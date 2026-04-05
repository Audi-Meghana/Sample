@echo off
echo ========================================
echo    CORS & DEPLOYMENT TEST
echo ========================================
echo.

echo Testing Backend Health...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://parental-ai-backend.onrender.com/health' -Method GET -TimeoutSec 15 -UseBasicParsing; Write-Host '✅ Backend Health:' $response.StatusCode; $response.Content } catch { Write-Host '❌ Backend Health: Failed' }"

echo.
echo Testing Frontend Accessibility...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://parental-ai-frontend.onrender.com' -Method GET -TimeoutSec 15 -UseBasicParsing; Write-Host '✅ Frontend:' $response.StatusCode } catch { Write-Host '❌ Frontend: Failed' }"

echo.
echo Testing CORS Headers...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://parental-ai-backend.onrender.com/health' -Method GET -TimeoutSec 15 -UseBasicParsing; $cors = $response.Headers.'Access-Control-Allow-Origin'; if ($cors) { Write-Host '✅ CORS Headers: Present' } else { Write-Host '❌ CORS Headers: Missing' } } catch { Write-Host '❌ CORS Test: Failed' }"

echo.
echo ========================================
echo    MANUAL TESTING REQUIRED
echo ========================================
echo.
echo 1. Open https://parental-ai-frontend.onrender.com in browser
echo 2. Open Developer Tools (F12) -^> Console
echo 3. Try to login or access any feature
echo 4. Check for CORS errors in console
echo 5. If no CORS errors, app is working! 🎉
echo.
echo If CORS errors persist, check Render environment variables.