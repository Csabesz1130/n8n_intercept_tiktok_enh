# Viral n8n Platform - Startup Script for Windows
# This script starts all services together

Write-Host "🚀 Starting Viral n8n Platform..." -ForegroundColor Green
Write-Host ""

# Check if Redis is running (optional check)
Write-Host "⚠️  Make sure Redis is running (required for scheduler)" -ForegroundColor Yellow
Write-Host "   If not installed, you can skip scheduler for now" -ForegroundColor Yellow
Write-Host ""

# Check if .env files exist
$envFiles = @(".env", "scheduler\.env", "trending-scraper\.env", "dashboard\.env")
$missingEnv = @()

foreach ($file in $envFiles) {
    if (-not (Test-Path $file)) {
        $missingEnv += $file
    }
}

if ($missingEnv.Count -gt 0) {
    Write-Host "⚠️  Missing environment files:" -ForegroundColor Yellow
    foreach ($file in $missingEnv) {
        Write-Host "   - $file" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Run 'npm run setup' first to create them" -ForegroundColor Yellow
    Write-Host ""
}

# Start services in parallel
Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start Dashboard (port 3000)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd dashboard; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 2

# Start Scheduler (port 3001)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd scheduler; npm start" -WindowStyle Minimized
Start-Sleep -Seconds 2

# Start Trending Scraper
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd trending-scraper; npm start" -WindowStyle Minimized
Start-Sleep -Seconds 2

Write-Host "✅ All services starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  📊 Dashboard:    http://localhost:3000" -ForegroundColor White
Write-Host "  ⏰ Scheduler:    http://localhost:3001" -ForegroundColor White
Write-Host "  🔍 Scraper:      Running in background" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Get-Process | Where-Object { $_.MainWindowTitle -like "*dashboard*" -or $_.MainWindowTitle -like "*scheduler*" -or $_.MainWindowTitle -like "*scraper*" } | Stop-Process -Force
    Write-Host "✅ Services stopped" -ForegroundColor Green
}

