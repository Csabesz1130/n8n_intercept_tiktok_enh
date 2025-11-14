@echo off
REM Viral n8n Platform - Windows Batch Startup Script

echo.
echo ========================================
echo   Viral n8n Platform - Development Mode
echo ========================================
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Checking dependencies...
if not exist "dashboard\node_modules" (
    echo Installing dashboard dependencies...
    cd dashboard
    call npm install
    cd ..
)

if not exist "scheduler\node_modules" (
    echo Installing scheduler dependencies...
    cd scheduler
    call npm install
    cd ..
)

if not exist "trending-scraper\node_modules" (
    echo Installing scraper dependencies...
    cd trending-scraper
    call npm install
    cd ..
)

echo.
echo [2/4] Checking environment files...
if not exist ".env" (
    echo WARNING: .env file not found
    echo Creating from .env.example...
    if exist ".env.example" copy ".env.example" ".env"
)

echo.
echo [3/4] Starting services...
echo.

REM Start Dashboard
echo Starting Dashboard on http://localhost:3000
start "Dashboard" cmd /k "cd dashboard && npm run dev"

timeout /t 3 /nobreak >nul

REM Start Scheduler
echo Starting Scheduler on http://localhost:3001
start "Scheduler" cmd /k "cd scheduler && npm start"

timeout /t 3 /nobreak >nul

REM Start Scraper
echo Starting Trending Scraper
start "Scraper" cmd /k "cd trending-scraper && npm start"

echo.
echo [4/4] All services started!
echo.
echo ========================================
echo   Services Running:
echo ========================================
echo   Dashboard:  http://localhost:3000
echo   Scheduler:  http://localhost:3001
echo   Scraper:    Running in background
echo ========================================
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
taskkill /FI "WINDOWTITLE eq Dashboard*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Scheduler*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Scraper*" /F >nul 2>&1

echo Done!
timeout /t 2 /nobreak >nul

