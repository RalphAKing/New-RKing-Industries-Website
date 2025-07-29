import os
import re
import smtplib
import secrets
import string
import ipaddress
from datetime import datetime, timedelta, timezone

from fastapi import (
    FastAPI, Request, Form, Depends, HTTPException, status, Response, Cookie
)
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session as DBSession

from passlib.hash import argon2
import jwt
import psycopg2
import requests
import uvicorn
from dotenv import load_dotenv

# --- CONFIGURATION ---

# Load environment variables from .env file
load_dotenv()

# Access variables
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
SESSION_COOKIE = os.getenv("SESSION_COOKIE")

EMAIL_FROM = os.getenv("EMAIL_FROM")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_SMTP = "smtp.gmail.com"
EMAIL_PORT = 587

VERIFICATION_CODE_EXPIRY_HOURS = 12
SESSION_EXPIRY_DAYS = 2

# --- FASTAPI SETUP ---

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://192.168.1.67:8000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- DATABASE SETUP ---

Base = declarative_base()
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- MODELS ---

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(32), unique=True, nullable=False)
    email = Column(String(128), unique=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    verification_code = Column(String(6), nullable=True)
    verification_expiry = Column(DateTime, nullable=True)
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    pending_email = Column(String(128), nullable=True)
    verification_code = Column(String(6), nullable=True)
    verification_expiry = Column(DateTime, nullable=True)

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String(128), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    device = Column(String(256), nullable=True)
    location = Column(String(256), nullable=True)
    user = relationship("User", back_populates="sessions")

Base.metadata.create_all(bind=engine)

# --- UTILS ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    return argon2.hash(password)

def verify_password(password: str, hash_: str) -> bool:
    return argon2.verify(password, hash_)

def generate_token(length=64):
    return secrets.token_urlsafe(length)

def generate_verification_code():
    return ''.join(secrets.choice(string.digits) for _ in range(6))

def send_verification_email(email, code):
    subject = "Your Verification Code"
    html = f"""
    <html>
      <body style="font-family:sans-serif;background:#f8fafc;padding:32px;">
        <div style="max-width:420px;margin:auto;background:#fff;border-radius:12px;padding:32px 24px 24px 24px;box-shadow:0 2px 12px #0001;">
          <h2 style="color:#2563eb;text-align:center;margin-top:0;">Verify your account</h2>
          <p style="font-size:16px;color:#222;text-align:center;">
            Enter this code to verify your email:
          </p>
          <div style="font-size:30px;letter-spacing:12px;text-align:center;font-weight:bold;color:#2563eb;margin:24px 0 18px 0;">
            {code}
          </div>
          <p style="font-size:14px;color:#555;text-align:center;">
            This code expires in 12 hours.<br>
            If you did not request this, you can ignore this email.
          </p>
        </div>
      </body>
    </html>
    """
    message = f"From: {EMAIL_FROM}\nTo: {email}\nSubject: {subject}\nMIME-Version: 1.0\nContent-type: text/html\n\n{html}"
    try:
        with smtplib.SMTP(EMAIL_SMTP, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.sendmail(EMAIL_FROM, email, message)
    except Exception as e:
        print("Email send error:", e)
        raise

def send_account_change_email(email, what_changed):
    subject = "Account Change Notification"
    html = f"""
    <html>
      <body style="font-family:sans-serif;background:#f8fafc;padding:32px;">
        <div style="max-width:420px;margin:auto;background:#fff;border-radius:12px;padding:32px 24px 24px 24px;box-shadow:0 2px 12px #0001;">
          <h2 style="color:#2563eb;text-align:center;margin-top:0;">Account Change Alert</h2>
          <p style="font-size:16px;color:#222;text-align:center;">
            <b>{what_changed}</b>
          </p>
          <p style="font-size:14px;color:#555;text-align:center;">
            If this was <b>not you</b>, please contact our support team immediately.<br>
            <span style="color:#2563eb;">Your security is important to us.</span>
          </p>
          <div style="text-align:center;margin-top:24px;">
            <img src="https://cdn-icons-png.flaticon.com/512/3524/3524659.png" alt="Security" width="48" height="48" style="opacity:0.7;">
          </div>
        </div>
      </body>
    </html>
    """
    message = f"From: {EMAIL_FROM}\nTo: {email}\nSubject: {subject}\nMIME-Version: 1.0\nContent-type: text/html\n\n{html}"
    try:
        with smtplib.SMTP(EMAIL_SMTP, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.sendmail(EMAIL_FROM, email, message)
    except Exception as e:
        print("Email send error:", e)

def get_location(ip):
    try:
        if ip.startswith("127.") or ip.startswith("192.168.") or ip.startswith("10."):
            return "Local Network"
        resp = requests.get(f"https://ipinfo.io/{ip}/json", timeout=2)
        if resp.status_code == 200:
            data = resp.json()
            city = data.get("city", "")
            country = data.get("country", "")
            return f"{city}, {country}".strip(", ")
    except Exception:
        pass
    return "Unknown"

def password_requirements(password: str) -> list:
    reqs = [
        (len(password) >= 8, "At least 8 characters"),
        (re.search(r"[A-Z]", password), "An uppercase letter"),
        (re.search(r"[a-z]", password), "A lowercase letter"),
        (re.search(r"\d", password), "A number"),
        (re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", password), "A special character"),
    ]
    return [desc for ok, desc in reqs if not ok]

def get_client_ip(request: Request):
    # Try X-Forwarded-For first (if behind proxy)
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host


# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

SESSION_COOKIE = "session_token"

def clear_session_cookie(response: Response):
    response.delete_cookie(SESSION_COOKIE)

async def get_current_user(
    request: Request,
    response: Response,
    session_token: str = Cookie(None),
    db: DBSession = Depends(get_db)
):
    if not session_token:
        return None
    session = db.query(Session).filter_by(token=session_token).first()
    if not session:
        clear_session_cookie(response)
        return None
    if session.expires_at and session.expires_at < datetime.utcnow():
        db.delete(session)
        db.commit()
        clear_session_cookie(response)
        return None
    user = session.user
    return user

# --- CLEANUP: DELETE UNVERIFIED USERS AFTER 12H ---

@app.on_event("startup")
def cleanup_unverified():
    import threading, time
    def worker():
        while True:
            db = SessionLocal()
            now = datetime.utcnow()
            users = db.query(User).filter(
                User.is_verified == False,
                User.verification_expiry < now
            ).all()
            for u in users:
                db.delete(u)
            db.commit()
            db.close()
            time.sleep(3600)  # Run every hour
    threading.Thread(target=worker, daemon=True).start()

# --- ROUTES ---

# --- Index Route with Auth Check ---
@app.get("/", response_class=HTMLResponse)
async def read_root(
    request: Request,
    response: Response,
    user=Depends(get_current_user)
):
    # user will be None if not logged in or session is invalid
    return templates.TemplateResponse("index.html", {
        "request": request,
        "solutions": [
    {
        "id": 1,
        "title": "Darts Tracker",
        "short_description": "Darts Tracker is a user-friendly web app for tracking scores and stats in your darts games. Add players, set game rules, and keep score easily on any device.",
        "full_description": "Darts Tracker by RKing Industries is a modern web application designed to make scoring your darts games fast and intuitive. Easily add multiple players, customize the number of legs and starting score, and track each player's progress in real time. The app features a clean, mobile-responsive interface with a virtual number pad for quick score entry, automatic average calculation, and finish suggestions for each player. No account is required—just open the app and start playing. Perfect for casual games at home, in the pub, or anywhere you play darts!",
        "image_url": "/static/images/darts.png",
        "link_url": "/darts"
    }
],
        "user": user
    })

@app.get("/darts", response_class=HTMLResponse)
async def darts_page(
    request: Request,
    response: Response,
    user=Depends(get_current_user)
):
    if user:
        # User is logged in: render the online game
        return templates.TemplateResponse("darts_game.html", {"request": request, "user": user})
    else:
        # User is not logged in: send the offline file as a download
        return templates.TemplateResponse("offline_darts_game.html", {"request": request, "user": user})

@app.exception_handler(StarletteHTTPException)
async def custom_404_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return templates.TemplateResponse(
            "404.html",
            {"request": request},
            status_code=404
        )
    # For other HTTP errors, you can return the default response or customize as needed
    return HTMLResponse(
        f"<h1>{exc.status_code} Error</h1><p>{exc.detail}</p>",
        status_code=exc.status_code
    )

# --- Example: API to check session (for frontend JS) ---
@app.get("/api/session")
async def api_session(
    response: Response,
    user=Depends(get_current_user)
):
    if not user:
        return {"ok": False, "error": "Not authenticated"}
    return {"ok": True, "user": {"id": user.id, "username": user.username, "email": user.email}}

@app.post("/api/signup")
async def api_signup(
    request: Request,
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: DBSession = Depends(get_db)
):
    # Check requirements
    missing = password_requirements(password)
    if missing:
        return JSONResponse({"ok": False, "error": "Password requirements not met", "missing": missing}, status_code=400)
    if db.query(User).filter_by(email=email).first():
        return JSONResponse({"ok": False, "error": "Email already in use"}, status_code=400)
    if db.query(User).filter_by(username=username).first():
        return JSONResponse({"ok": False, "error": "Username already in use"}, status_code=400)
    hash_ = hash_password(password)
    code = generate_verification_code()
    expiry = datetime.utcnow() + timedelta(hours=VERIFICATION_CODE_EXPIRY_HOURS)
    user = User(
        username=username,
        email=email,
        password_hash=hash_,
        is_verified=False,
        verification_code=code,
        verification_expiry=expiry
    )
    db.add(user)
    db.commit()
    send_verification_email(email, code)
    return JSONResponse({"ok": True, "user_id": user.id})

@app.post("/api/verify")
async def api_verify(
    user_id: int = Form(...),
    code: str = Form(...),
    db: DBSession = Depends(get_db)
):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        return JSONResponse({"ok": False, "error": "User not found"}, status_code=404)
    if user.verification_code != code or user.verification_expiry < datetime.utcnow():
        return JSONResponse({"ok": False, "error": "Invalid or expired code"}, status_code=400)
    # If pending_email, this is an email change
    if user.pending_email:
        user.email = user.pending_email
        user.pending_email = None
        user.is_verified = True
        user.verification_code = None
        user.verification_expiry = None
        db.commit()
        return JSONResponse({"ok": True, "email_changed": True})
    # Otherwise, normal signup verification
    user.is_verified = True
    user.verification_code = None
    user.verification_expiry = None
    db.commit()
    return JSONResponse({"ok": True})

@app.post("/api/login")
async def api_login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    stay_logged_in: bool = Form(False),
    db: DBSession = Depends(get_db)
):
    user = db.query(User).filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        return JSONResponse({"ok": False, "error": "Invalid credentials"}, status_code=401)
    if not user.is_verified:
        return JSONResponse({"ok": False, "error": "Account not verified", "user_id": user.id}, status_code=403)
    token = generate_token(32)
    now = datetime.utcnow()
    expires_at = None if stay_logged_in else now + timedelta(days=SESSION_EXPIRY_DAYS)
    ip = get_client_ip(request)
    ua = request.headers.get("user-agent", "Unknown")
    location = get_location(ip)
    session = Session(
        user_id=user.id,
        token=token,
        created_at=now,
        expires_at=expires_at,
        device=ua,
        location=location
    )
    db.add(session)
    db.commit()
    resp = JSONResponse({"ok": True, "token": token, "user_id": user.id})
    resp.set_cookie(
        SESSION_COOKIE, token,
        httponly=True, secure=False, samesite="lax",
        expires=None if stay_logged_in else int((expires_at - now).total_seconds())
    )
    return resp

@app.post("/api/logout")
async def api_logout(
    response: Response,
    session_token: str = Cookie(None),
    db: DBSession = Depends(get_db)
):
    if session_token:
        db.query(Session).filter_by(token=session_token).delete()
        db.commit()
    response = JSONResponse({"ok": True})
    response.delete_cookie(SESSION_COOKIE)
    return response

@app.get("/api/session")
async def api_session(
    session_token: str = Cookie(None),
    db: DBSession = Depends(get_db)
):
    if not session_token:
        return JSONResponse({"ok": False, "error": "Not logged in"}, status_code=401)
    session = db.query(Session).filter_by(token=session_token).first()
    if not session:
        return JSONResponse({"ok": False, "error": "Invalid session"}, status_code=401)
    if session.expires_at and session.expires_at < datetime.utcnow():
        db.delete(session)
        db.commit()
        return JSONResponse({"ok": False, "error": "Session expired"}, status_code=401)
    user = session.user
    return JSONResponse({
        "ok": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_verified": user.is_verified
        },
        "session": {
            "created_at": session.created_at.isoformat(),
            "expires_at": session.expires_at.isoformat() if session.expires_at else None,
            "device": session.device,
            "location": session.location
        }
    })


@app.get("/api/profile/sessions")
async def get_profile_sessions(
    session_token: str = Cookie(None),
    db: DBSession = Depends(get_db)
):
    if not session_token:
        return JSONResponse({"ok": False, "error": "Not authenticated"}, status_code=401)
    session = db.query(Session).filter_by(token=session_token).first()
    if not session or (session.expires_at and session.expires_at < datetime.utcnow()):
        return JSONResponse({"ok": False, "error": "Session expired"}, status_code=401)
    user = session.user
    sessions = db.query(Session).filter_by(user_id=user.id).all()
    return {
        "ok": True,
        "sessions": [
            {
                "id": s.id,
                "created_at": s.created_at.isoformat(),
                "expires_at": s.expires_at.isoformat() if s.expires_at else None,
                "device": s.device,
                "location": s.location,
                "current": s.token == session_token
            }
            for s in sessions
        ]
    }

@app.post("/api/profile/remove_session")
async def remove_profile_session(
    session_id: int = Form(...),
    password: str = Form(...),
    session_token: str = Cookie(None),
    db: DBSession = Depends(get_db)
):
    if not session_token:
        return JSONResponse({"ok": False, "error": "Not authenticated"}, status_code=401)
    session = db.query(Session).filter_by(token=session_token).first()
    if not session or (session.expires_at and session.expires_at < datetime.utcnow()):
        return JSONResponse({"ok": False, "error": "Session expired"}, status_code=401)
    user = session.user
    if not verify_password(password, user.password_hash):
        return JSONResponse({"ok": False, "error": "Incorrect password"}, status_code=403)
    target_session = db.query(Session).filter_by(id=session_id, user_id=user.id).first()
    if not target_session:
        return JSONResponse({"ok": False, "error": "Session not found"}, status_code=404)
    db.delete(target_session)
    db.commit()
    return {"ok": True}

@app.post("/api/logout")
async def api_logout(
    response: Response,
    session_token: str = Cookie(None),
    db: DBSession = Depends(get_db)
):
    if session_token:
        db.query(Session).filter_by(token=session_token).delete()
        db.commit()
    response = JSONResponse({"ok": True})
    response.delete_cookie("session_token")
    return response

@app.post("/api/profile/update")
async def profile_update(
    request: Request,
    field: str = Form(...),
    value: str = Form(None),
    password: str = Form(None),
    old_password: str = Form(None),
    new_password: str = Form(None),
    session_token: str = Cookie(None),
    db: DBSession = Depends(get_db)
):
    # --- Authenticate user via session token ---
    if not session_token:
        return JSONResponse({"ok": False, "error": "Not authenticated"}, status_code=401)
    session = db.query(Session).filter_by(token=session_token).first()
    if not session or (session.expires_at and session.expires_at < datetime.utcnow()):
        return JSONResponse({"ok": False, "error": "Session expired"}, status_code=401)
    user = session.user

    # --- Change Username ---
    if field == "username":
        if not value or not password:
            return JSONResponse({"ok": False, "error": "Username and password required"}, status_code=400)
        if not verify_password(password, user.password_hash):
            return JSONResponse({"ok": False, "error": "Incorrect password"}, status_code=403)
        if db.query(User).filter(User.username == value, User.id != user.id).first():
            return JSONResponse({"ok": False, "error": "Username already taken"}, status_code=400)
        old_username = user.username
        user.username = value
        db.commit()
        # Send notification email
        send_account_change_email(user.email, f"Your username was changed from {old_username} to {value}.")
        return {"ok": True}

    # --- Change Email (with verification) ---
    if field == "email":
        if not value or not password:
            return JSONResponse({"ok": False, "error": "Email and password required"}, status_code=400)
        if not verify_password(password, user.password_hash):
            return JSONResponse({"ok": False, "error": "Incorrect password"}, status_code=403)
        if db.query(User).filter(User.email == value, User.id != user.id).first():
            return JSONResponse({"ok": False, "error": "Email already in use"}, status_code=400)
        code = generate_verification_code()
        user.pending_email = value
        user.verification_code = code
        user.verification_expiry = datetime.utcnow() + timedelta(hours=12)
        db.commit()
        send_verification_email(value, code)
        # Notify old email as well
        send_account_change_email(user.email, f"An email change was requested to {value}. If this wasn't you, contact support.")
        return {"ok": True, "reverify": True}

    # --- Change Password ---
    if field == "password":
        if not old_password or not new_password:
            return JSONResponse({"ok": False, "error": "Old and new password required"}, status_code=400)
        if not verify_password(old_password, user.password_hash):
            return JSONResponse({"ok": False, "error": "Incorrect current password"}, status_code=403)
        # Password requirements (same as signup)
        import re
        pw = new_password
        reqs = [
            (len(pw) >= 8, "At least 8 characters"),
            (re.search(r"[A-Z]", pw), "An uppercase letter"),
            (re.search(r"[a-z]", pw), "A lowercase letter"),
            (re.search(r"\d", pw), "A number"),
            (re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", pw), "A special character"),
        ]
        missing = [desc for ok, desc in reqs if not ok]
        if missing:
            return JSONResponse({"ok": False, "error": "Password requirements not met", "missing": missing}, status_code=400)
        user.password_hash = hash_password(new_password)
        db.commit()
        send_account_change_email(user.email, "Your password was changed.")
        return {"ok": True}

    return JSONResponse({"ok": False, "error": "Invalid field"}, status_code=400)

# --- ENDPOINTS FOR DEMO (OPTIONAL) ---

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

