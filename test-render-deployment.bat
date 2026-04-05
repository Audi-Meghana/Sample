@echo off
echo Testing Render Deployment Configuration
echo ======================================

echo 1. Testing Frontend Accessibility...
curl -s -o /dev/null -w "%%{http_code}" https://parental-ai-frontend.onrender.com
echo.

echo 2. Testing Backend Health Check...
curl -s -o /dev/null -w "%%{http_code}" https://parental-ai-backend.onrender.com/health
echo.

echo 3. Testing API Endpoint...
curl -s -o /dev/null -w "%%{http_code}" https://parental-ai-backend.onrender.com/api/auth/test
echo.

echo 4. Checking if backend is responding...
curl -s https://parental-ai-backend.onrender.com/health | findstr "OK" >nul
if %errorlevel% equ 0 (
    echo ✓ Backend is responding correctly
) else (
    echo ✗ Backend health check failed
)

echo.
echo If tests fail, check:
echo - Environment variables in Render dashboard
echo - Backend deployment logs
echo - MongoDB Atlas network access
echo - CORS configuration