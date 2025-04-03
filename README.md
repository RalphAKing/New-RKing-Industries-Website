
# RKing Industries 

## Overview

This project provides a website built with FastAPI for accessing various data points, including integration with the Beehive API. It includes features such as database connectivity, rate limiting, error logging, and static file serving.

## Project Structure

```
.
├── beehive_api.py   # Module for interacting with the Beehive API
├── main.py          # Main FastAPI application
├── README.md        # This file
├── logs/            # Directory for application logs
├── static/          # Directory for static files (CSS, JavaScript, images)
├── templates/       # Directory for Jinja2 templates
└── .env             # Environment variables (API keys, database credentials)
```

## `beehive_api.py`

This module contains the `BeehiveAPI` class, which handles authentication and data retrieval from the Beehive API.

### Class: `BeehiveAPI`

#### `__init__(self, token=None, user_id=None)`

Initializes a new instance of the `BeehiveAPI` class.

-   `token` (str, optional): The authentication token. Defaults to `None`.
-   `user_id` (str, optional): The user ID. Defaults to `None`.

#### `async def login(self, username, password, attempts=0)`

Authenticates with the Beehive API using a username and password.

-   `username` (str): The username for authentication.
-   `password` (str): The password for authentication.
-   `attempts` (int, optional): Number of login attempts. Defaults to 0.

Returns:

-   `True` if login is successful, `False` otherwise.

#### `async def submit_assignment(self, assignment_id, attempts=0)`

Submits an assignment to the Beehive API.

-   `assignment_id` (str): The ID of the assignment to submit.
-   `attempts` (int, optional): Number of submission attempts. Defaults to 0.

Returns:

-   `True` if submission is successful, `False` otherwise.

#### `async def get_smartcard_info(self, attempts=0)`

Retrieves smartcard information from the Beehive API.

-   `attempts` (int, optional): Number of retrieval attempts. Defaults to 0.

Returns:

-   `balance` (float): The balance of the smartcard.
-   `printbalance` (float): The print credit balance.
-   `transactions` (list): A list of transaction dictionaries.

#### `async def get_user_stats(self, attempts=0)`

Retrieves user statistics from the Beehive API.

-   `attempts` (int, optional): Number of retrieval attempts. Defaults to 0.

Returns:

-   `name` (str): The user's full name.
-   `tutor_group` (str): The user's tutor group.
-   `attendance` (float): The user's attendance rate.
-   `behaviour_points` (int): The user's behavior points.
-   `reward_points` (int): The user's reward points.
-   `lates` (int): The number of times the user was late.
-   `absences` (int): The number of times the user was absent.

#### `async def get_events(self, attempts=0)`

Retrieves events from the Beehive API.

-   `attempts` (int, optional): Number of retrieval attempts. Defaults to 0.

Returns:

-   `dict`: A dictionary of events.

#### `async def get_timetable(self, attempts=0)`

Retrieves the timetable from the Beehive API.

-   `attempts` (int, optional): Number of retrieval attempts. Defaults to 0.

Returns:

-   `dict`: A dictionary of timetable data.

#### `async def get_assignments(self, attempts=0)`

Retrieves assignments from the Beehive API.

-   `attempts` (int, optional): Number of retrieval attempts. Defaults to 0.

Returns:

-   `dict`: A dictionary of assignments.

#### `async def get_links(self, attempts=0)`

Retrieves useful links from the Beehive API.

-   `attempts` (int, optional): Number of retrieval attempts. Defaults to 0.

Returns:

-   `dict`: A dictionary of links.

#### `async def get_noticeboard(self, attempts=0)`

Retrieves noticeboard items from the Beehive API.

-   `attempts` (int, optional): Number of retrieval attempts. Defaults to 0.

Returns:

-   `list`: A list of noticeboard items.

#### `@classmethod async def from_credentials(cls, username, password, attempts=0)`

Authenticates with the Beehive API and returns the token and user ID.

-   `username` (str): The username for authentication.
-   `password` (str): The password for authentication.
-   `attempts` (int, optional): Number of login attempts. Defaults to 0.

Returns:

-   `tuple`: A tuple containing the token and user ID.

#### `@classmethod def from_token(cls, token, user_id)`

Creates a `BeehiveAPI` instance from a token and user ID.

-   `token` (str): The authentication token.
-   `user_id` (str): The user ID.

Returns:

-   `BeehiveAPI`: An instance of the `BeehiveAPI` class.

## `main.py`

This is the main file for the FastAPI application, defining the API endpoints and middleware.

### Dependencies

-   fastapi
-   fastapi.responses
-   fastapi.staticfiles
-   fastapi.templating
-   fastapi.middleware.gzip
-   fastapi.middleware.cors
-   fastapi.exceptions
-   starlette.status
-   contextlib
-   logging
-   os
-   time
-   asyncpg
-   dotenv
-   uvicorn
-   datetime
-   traceback
-   asyncio
-   `beehive_api` (local module)

### Configuration

-   Environment variables are loaded from a `.env` file using `dotenv`.
-   Database connection details are configured using environment variables:
    -   `DB_HOST`
    -   `DB_PORT`
    -   `DB_USER`
    -   `DB_PASSWORD`
    -   `DB_NAME`

### Features

-   **GZip Middleware**: Compresses responses for faster delivery.
-   **CORS Middleware**: Configures Cross-Origin Resource Sharing.
-   **Static Files**: Serves static files from the `static` directory.
-   **Jinja2 Templates**: Uses Jinja2 for rendering HTML templates from the `templates` directory.
-   **Rate Limiter**: Limits the number of requests per minute per client.
-   **Error Logging**: Logs errors to a file and the console.
-   **Exception Handling**: Custom exception handlers for validation errors, HTTP exceptions, and general exceptions.

### API Endpoints

-   `/health`: Health check endpoint.
-   `/db-test`: Tests the database connection.
-   `/`: Home page, rendered from `templates/index.html`.
-   `/portfolio`: Portfolio page, rendered from `templates/portfolio.html`.
-   `/{full_path:path}`: Catch-all route for handling 404 errors.

### Usage

1.  **Install Dependencies**:

    ```bash
    pip install fastapi uvicorn aiohttp python-dotenv Jinja2 aiofiles asyncpg python-multipart
    ```

2.  **Set Up Environment Variables**:

    Create a `.env` file in the project root with the following variables:

    ```
    DB_HOST=<your_db_host>
    DB_PORT=<your_db_port>
    DB_USER=<your_db_user>
    DB_PASSWORD=<your_db_password>
    DB_NAME=<your_db_name>
    ```

3.  **Run the Application**:

    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```

    -   `--host 0.0.0.0`: Binds the application to all network interfaces.
    -   `--port 8000`: Specifies the port to listen on.
    -   `--reload`: Enables automatic reloading on code changes (for development).

### Production Deployment

For production deployment, it is recommended to use a process manager like `gunicorn` or `pm2`.

Example using `gunicorn`:

```bash
gunicorn main:app --workers 10 --worker-class uvicorn.workers.UvicornWorker --host 0.0.0.0 --port 8000 --log-level warning
```

## Logs

Application logs are stored in the `logs` directory. Each log file is named with the date of the logs to help keep things organized.
```
logs/
└── app_errors_YYYY-MM-DD.log
```
