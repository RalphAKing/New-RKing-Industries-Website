from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.status import HTTP_404_NOT_FOUND
from contextlib import asynccontextmanager
import logging
import os
import time
import asyncpg
from dotenv import load_dotenv
import uvicorn
from datetime import datetime
import traceback
import asyncio

# Import the BeehiveAPI class
from beehive_api import BeehiveAPI

load_dotenv()

# async def main():
#     # Authenticate and get token and user_id
#     token, user_id = await BeehiveAPI.from_credentials("2019rking", "Gsx1300rD")
    
#     if token and user_id:
#         print(f"Authentication successful!")
#         print(f"Token: {token[:20]}...") # Only show beginning of token for security
#         print(f"User ID: {user_id}")
#     else:
#         print("Authentication failed")

# # Run the async function
# if __name__ == "__main__":
#     asyncio.run(main())

#------------------

# Global variable for database connection
db_connection = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_connection
    print("Starting up application...")

    # Initialize database connection
    try:
        db_connection = await asyncpg.connect(
            host=os.getenv("DB_HOST"),
            port=int(os.getenv("DB_PORT")),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        print("Database connection established.")
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        db_connection = None

    yield

    if db_connection:
        await db_connection.close()
        print("Database connection closed.")
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

@app.get("/db-test")
async def db_test():
    """Test database connection by running a simple query."""
    global db_connection
    if not db_connection:
        raise HTTPException(status_code=500, detail="Database connection not initialized.")
    
    try:
        rows = await db_connection.fetch("SELECT version();")
        return {"status": "success", "db_version": rows[0]['version']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {e}")

@app.get("/", response_class=HTMLResponse)
async def home_page(request: Request):
    # Example products data
    products = [
        {
            "title": "Cloud Server Solutions",
            "description": "High-performance cloud servers with 99.9% uptime guarantee. Perfect for businesses of all sizes requiring reliable hosting infrastructure.",
            "image": "/static/images/cloud-server.jpg",
            "price": "29.99",
            "link": "/products/cloud-servers"
        },
        {
            "title": "3D Printing Service",
            "description": "Professional 3D printing services with rapid turnaround times. We support various materials including PLA, ABS, PETG, and specialty filaments.",
            "image": "/static/images/3d-printing.jpg",
            "price": "49.99",
            "link": "/products/3d-printing"
        },
        {
            "title": "Web Development",
            "description": "Custom web development services using modern frameworks and technologies. From simple landing pages to complex web applications.",
            "image": "/static/images/web-dev.jpg",
            "price": "199.99",
            "link": "/products/web-development"
        },
        {
            "title": "Open Source Tools",
            "description": "Free and open-source developer tools created by our team to help streamline your workflow and boost productivity.",
            "image": "/static/images/open-source.jpg",
            "price": "Free",
            "link": "/products/open-source"
        }
    ]
    
    response = templates.TemplateResponse(
        "index.html", 
        {
            "request": request, 
            "title": "RKing Industries",
            "products": products,
            "loggedin": False,  # You can set this based on actual authentication status
            "beehivelinked": False  # Set this based on your requirements
        }
    )
    response.headers["Cache-Control"] = "public, max-age=300" 
    return response


@app.get("/portfolio", response_class=HTMLResponse)
async def portfolio(request: Request):
    response = templates.TemplateResponse(
        "portfolio.html", 
        {"request": request, "title": "Portfolio"}
    )
    response.headers["Cache-Control"] = "public, max-age=600" 
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
    response = templates.TemplateResponse(
        "404.html", 
        {"request": request, "path": full_path},
        status_code=404
    )
    response.headers["Cache-Control"] = "public, max-age=300" 
    return response

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
    # uvicorn main:app --host 0.0.0.0 --port 8000 --workers 10 --log-level warning
    pass
