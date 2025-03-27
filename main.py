from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.exceptions import HTTPException as StarletteHTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.status import HTTP_404_NOT_FOUND
from typing import Annotated
import uvicorn
import time
from contextlib import asynccontextmanager
import logging
import traceback
from datetime import datetime
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize resources
    print("Starting up application...")
    # Initialize database connections, load models
    yield
    # Shutdown: Clean up resources
    print("Shutting down application...")

app = FastAPI(
    title="RKing Industries Website",
    description="Optimized FastAPI application",
    version="1.0.0",
    lifespan=lifespan
)

log_directory = "logs"
os.makedirs(log_directory, exist_ok=True)
log_file = os.path.join(log_directory, f"app_errors_{datetime.now().strftime('%Y-%m-%d')}.log")

logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler() 
    ]
)
logger = logging.getLogger(__name__)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.mount(
    "/static",
    StaticFiles(directory="static", check_dir=False),
    name="static"
)

templates = Jinja2Templates(directory="templates")

class RateLimiter:
    def __init__(self, requests_per_minute=60):
        self.requests_per_minute = requests_per_minute
        self.requests = {}
        
    async def check(self, client_id: str):
        current_time = time.time()
        if client_id in self.requests:
            requests = [r for r in self.requests[client_id] if r > current_time - 60]
            if len(requests) >= self.requests_per_minute:
                raise HTTPException(
                    status_code=429,
                    detail="Rate limit exceeded"
                )
            self.requests[client_id] = requests + [current_time]
        else:
            self.requests[client_id] = [current_time]
        return True

rate_limiter = RateLimiter()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Define your routes
@app.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    response = templates.TemplateResponse(
        "index.html", 
        {"request": request, "title": "RKing Industries"}
    )
    response.headers["Cache-Control"] = "public, max-age=300" 
    return response















@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"status": "error", "detail": str(exc)},
    )

@app.exception_handler(HTTPException)
async def fastapi_http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    error_msg = f"Unhandled exception: {str(exc)}"
    error_traceback = traceback.format_exc()
    request_info = {
        "url": str(request.url),
        "method": request.method,
        "client_host": request.client.host if request.client else "unknown",
        "headers": dict(request.headers),
    }
    logger.error(
        f"{error_msg}\nRequest: {request_info}\nTraceback: {error_traceback}"
    )
    return JSONResponse(
        status_code=500,
        content={"status": "error", "detail": "Internal server error"},
    )

@app.get("/{full_path:path}", response_class=HTMLResponse)
async def catch_all(request: Request, full_path: str):
    logger.warning(f"404 Not Found: {request.url.path}")
    return templates.TemplateResponse(
        "404.html",
        {"request": request, "path": full_path},
        status_code=404
    )

if __name__ == "__main__":
    # Development settings
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
else:
    # Production settings
    # When running in production, use:
    # uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4 --log-level warning
    pass
