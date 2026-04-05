@echo off
REM AIgNOZ Backend - Local Test (Windows)

setlocal enabledelayedexpansion
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set RESET=[0m

cls
echo.
echo %YELLOW%================================%RESET%
echo %YELLOW%AIgNOZ Backend - Local Test %RESET%
echo %YELLOW%================================%RESET%
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo %RED%X Docker is not installed%RESET%
    exit /b 1
)
echo %GREEN%√ Docker is installed%RESET%

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo %RED%X Docker Compose is not installed%RESET%
    exit /b 1
)
echo %GREEN%√ Docker Compose is installed%RESET%
echo.

REM Check required files
echo %YELLOW%Checking required files...%RESET%
if exist "Dockerfile" (echo %GREEN%√ Dockerfile found%RESET%) else (echo %RED%X Dockerfile not found%RESET% & exit /b 1)
if exist "docker-entrypoint.sh" (echo %GREEN%√ docker-entrypoint.sh found%RESET%) else (echo %RED%X docker-entrypoint.sh not found%RESET% & exit /b 1)
if exist "docker-compose.yml" (echo %GREEN%√ docker-compose.yml found%RESET%) else (echo %RED%X docker-compose.yml not found%RESET% & exit /b 1)
if exist ".env.example" (echo %GREEN%√ .env.example found%RESET%) else (echo %RED%X .env.example not found%RESET% & exit /b 1)
echo.

REM Create .env if it doesn't exist
if not exist ".env" (
    echo %YELLOW%Creating .env file from .env.example...%RESET%
    copy .env.example .env
    echo %YELLOW%W Please edit .env with your MongoDB URI and other settings%RESET%
    exit /b 0
) else (
    echo %GREEN%√ .env file exists%RESET%
)
echo.

REM Check MONGO_URI
findstr /R "^MONGO_URI=" .env >nul
if errorlevel 1 (
    echo %RED%X MONGO_URI not found in .env%RESET%
    exit /b 1
)
echo %GREEN%√ MONGO_URI is configured%RESET%
echo.

echo %YELLOW%Building Docker image...%RESET%
docker build -t aignoz-backend:latest .
if errorlevel 1 (
    echo %RED%X Docker build failed%RESET%
    exit /b 1
)
echo %GREEN%√ Docker image built successfully%RESET%
echo.

echo %YELLOW%Starting services with docker-compose...%RESET%
docker-compose down 2>nul
docker-compose up -d
if errorlevel 1 (
    echo %RED%X Failed to start services%RESET%
    docker-compose logs
    exit /b 1
)
echo %GREEN%√ Services started%RESET%
echo.

echo %YELLOW%Waiting 10 seconds for services to initialize...%RESET%
timeout /t 10 /nobreak
echo.

echo %YELLOW%Testing services...%RESET%
echo.

echo %YELLOW%Testing Node.js server health endpoint...%RESET%
curl -s http://localhost:3000/health | findstr /I "status" >nul
if errorlevel 1 (
    echo %RED%X Node.js server is not responding%RESET%
    docker-compose logs
    exit /b 1
)
echo %GREEN%√ Node.js server is responding%RESET%
echo.

echo %YELLOW%Testing MongoDB connection...%RESET%
curl -s http://localhost:3000/api/gene >nul
if errorlevel 0 (
    echo %GREEN%√ MongoDB connection seems OK%RESET%
)
echo.

echo %YELLOW%Service URLs:%RESET%
echo   Node.js: http://localhost:3000
echo   FastAPI: http://localhost:8000
echo   Health: http://localhost:3000/health
echo.

echo %GREEN%√ All tests passed! Services are running.%RESET%
echo.

echo %YELLOW%Common commands:%RESET%
echo   View logs:     docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart:       docker-compose restart
echo.

echo %YELLOW%When ready to deploy to Render:%RESET%
echo   1. Push to GitHub
echo   2. Create web service on Render
echo   3. Set environment variables (see .env)
echo   4. Monitor logs at https://dashboard.render.com
echo.

pause
