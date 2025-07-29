# RKing Industries Website

## Overview

This project provides a modern, optimized website built with FastAPI for RKing Industries. It features integration with the Beehive API (Lion Heart Trust's school management system), database connectivity, rate limiting, error logging, and static file serving.

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Beehive API Integration](#beehive-api-integration)
- [Database](#database)
- [Error Handling and Logging](#error-handling-and-logging)
- [Production Deployment](#production-deployment)
- [Contributing](#contributing)

## Project Structure

```
.
├── beehive_api.py   # Module for interacting with the Beehive API
├── main.py          # Main FastAPI application
├── README.md        # Documentation
├── logs/            # Directory for application logs
├── static/          # Directory for static files (CSS, JavaScript, images)
│   └── fasthive/    # Directory for cached Beehive API resources
│       └── noticeboard/ # Cached and optimized noticeboard images
├── templates/       # Directory for Jinja2 templates
│   ├── index.html   # Home page template
│   ├── portfolio.html # Portfolio page template
│   └── 404.html     # Custom 404 error page
└── .env             # Environment variables (API keys, database credentials)
```

## Features

- **FastAPI Framework**: High-performance, easy-to-use web framework
- **Beehive API Integration**: Comprehensive integration with the Lion Heart Trust's school management system
- **PostgreSQL Database**: Robust database connectivity with asyncpg
- **Rate Limiting**: Protection against abuse with per-client request limits
- **Response Compression**: GZip middleware for faster content delivery
- **CORS Support**: Configured Cross-Origin Resource Sharing
- **Jinja2 Templates**: Dynamic HTML rendering
- **Static File Serving**: Optimized delivery of CSS, JavaScript, and images
- **Comprehensive Error Handling**: Custom exception handlers with detailed logging
- **Image Optimization**: Automatic conversion of images to WebP format for better performance
- **Caching Headers**: Proper cache control for improved performance

## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL database

### Install Dependencies

```bash
pip install fastapi uvicorn aiohttp python-dotenv Jinja2 aiofiles asyncpg python-multipart python-jwt pillow
```

## Configuration

Create a `.env` file in the project root with the following variables:

```
DB_HOST=<your_db_host>
DB_PORT=<your_db_port>
DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>
DB_NAME=<your_db_name>
```

## Running the Application

### Development Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Or simply run:

```bash
python main.py
```

### Testing

To verify your setup is working correctly:

1. Visit `http://localhost:8000/health` to check the application status
2. Visit `http://localhost:8000/db-test` to verify database connectivity

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/db-test` | GET | Tests database connection |
| `/` | GET | Home page |
| `/portfolio` | GET | Portfolio page |
| `/{full_path:path}` | GET | Catch-all route (returns 404 page) |

## Beehive API Integration

The `BeehiveAPI` class in `beehive_api.py` provides comprehensive integration with the Lion Heart Trust's Beehive API. It handles:

- Authentication
- User information retrieval
- Timetable access
- Assignment management
- Smartcard information
- Events and notices
- Resource links

### Authentication Methods

```python
# Authenticate with username and password
token, user_id = await BeehiveAPI.from_credentials(username, password)

# Create API instance from existing token
api = BeehiveAPI.from_token(token, user_id)
```

### Available Methods

- `login(username, password)`: Authenticate with the API
- `get_user_stats()`: Retrieve user information
- `get_timetable()`: Get user's class schedule
- `get_assignments()`: Get homework assignments
- `submit_assignment(assignment_id)`: Submit completed assignments
- `get_smartcard_info()`: Get balance and transaction history
- `get_events()`: Get upcoming events
- `get_links()`: Get useful resource links
- `get_noticeboard()`: Get school announcements

## Database

The application uses PostgreSQL with asyncpg for asynchronous database operations. Database connection is established during application startup and closed during shutdown.

To test database connectivity:

```bash
curl http://localhost:8000/db-test
```

## Error Handling and Logging

The application includes comprehensive error handling:

- Validation errors (422)
- HTTP exceptions (various status codes)
- General exceptions (500)

Logs are stored in the `logs` directory with filenames based on the current date:

```
logs/app_errors_YYYY-MM-DD.log
```

## Production Deployment

For production deployment, it's recommended to use a process manager like Gunicorn:

```bash
gunicorn main:app --workers 10 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --log-level warning
```

### Environment Considerations

- Set appropriate number of workers based on available CPU cores
- Configure proper logging for production
- Set up a reverse proxy (Nginx/Apache) for SSL termination
- Consider using Docker for containerization

## License

```md

# RKing Industries Website Proprietary License v1.0

**Copyright (c) 2025 Ralph King, RKing Industries**  
**All Rights Reserved.**

---

## 1. Grant of License

Subject to the terms and conditions of this License, the Copyright Holder grants no rights to use, copy, modify, merge, publish, distribute, sublicense, or sell copies of the Software, in whole or in part, for any purpose, including but not limited to public or commercial use, except as expressly permitted by a separate, written license agreement signed by the Copyright Holder.

---

## 2. Prohibited Uses

Unless you have received explicit, written permission from the Copyright Holder, you may **not**:

- Use the Software in any public or commercial project.
- Distribute, sublicense, or otherwise make the Software available to any third party.
- Modify, adapt, or create derivative works based on the Software.
- Use the Software for any purpose that is unlawful or prohibited by this License.

---

## 3. Permitted Uses

You may:

- View and review the source code for personal, non-commercial evaluation purposes only.
- Request a license for broader use by contacting the Copyright Holder.

---

## 4. Requesting Permission

To obtain permission for any use not expressly permitted by this License, you must contact the Copyright Holder at:

**Email:** ralphaking09@gmail.com

Permission, if granted, will be provided in writing and may be subject to additional terms and conditions.

---

## 5. Termination

Any unauthorized use of the Software will automatically terminate your rights under this License. Upon termination, you must immediately cease all use of the Software and destroy all copies in your possession.

---

## 6. Disclaimer of Warranty

The Software is provided "AS IS", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the Copyright Holder be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the Software or the use or other dealings in the Software.

---

## 7. Governing Law

This License shall be governed by and construed in accordance with the laws of your jurisdiction, without regard to its conflict of law provisions.

---

## 8. Contact

For any questions regarding this License or to request permission, please contact:

**Ralph King, RKing Industries**  
**Email:** ralphaking09@gmail.com

---

**RKing Industries Website Proprietary License v1.0**  
**Effective Date:** July 29, 2025


```