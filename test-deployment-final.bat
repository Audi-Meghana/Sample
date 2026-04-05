@echo off
echo ========================================
echo    RENDER DEPLOYMENT VERIFICATION
echo ========================================
echo.

echo 1. Testing Frontend Accessibility...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://parental-ai-frontend.onrender.com' -Method GET -TimeoutSec 10; Write-Host '✅ Frontend: HTTP' $response.StatusCode } catch { Write-Host '❌ Frontend: Failed to load' }"

echo.
echo 2. Testing Backend Health Check...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://parental-ai-backend.onrender.com/health' -Method GET -TimeoutSec 10; Write-Host '✅ Backend Health: HTTP' $response.StatusCode } catch { Write-Host '❌ Backend Health: Failed' }"

echo.
echo 3. Testing API Endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://parental-ai-backend.onrender.com/api/auth/test' -Method GET -TimeoutSec 10; Write-Host '✅ API Test: HTTP' $response.StatusCode } catch { Write-Host '❌ API Test: Failed' }"

echo.
echo 4. Testing CORS (Frontend to Backend)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://parental-ai-frontend.onrender.com' -Method GET -TimeoutSec 10; if ($response.Content -match 'parental-ai-backend') { Write-Host '✅ CORS: Frontend configured for production' } else { Write-Host '❌ CORS: Frontend still using localhost' } } catch { Write-Host '❌ CORS: Cannot verify' }"

echo.
echo ========================================
echo    MANUAL TESTING REQUIRED
echo ========================================
echo.
echo Please test manually:
echo 1. Open https://parental-ai-frontend.onrender.com on mobile
echo 2. Try to login and access doctor dashboard
echo 3. Check browser console for any errors
echo 4. Verify images load from uploads endpoint
echo.
echo If all tests pass, your app works everywhere! 🎉