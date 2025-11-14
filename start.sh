#!/bin/bash

# Viral n8n Platform - Startup Script for Linux/Mac
# This script starts all services together

echo "🚀 Starting Viral n8n Platform..."
echo ""

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running (required for scheduler)"
    echo "   Start it with: redis-server"
    echo "   Or skip scheduler for now"
    echo ""
fi

# Check if .env files exist
ENV_FILES=(".env" "scheduler/.env" "trending-scraper/.env" "dashboard/.env")
MISSING_ENV=()

for file in "${ENV_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_ENV+=("$file")
    fi
done

if [ ${#MISSING_ENV[@]} -gt 0 ]; then
    echo "⚠️  Missing environment files:"
    for file in "${MISSING_ENV[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Run 'npm run setup' first to create them"
    echo ""
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $DASHBOARD_PID $SCHEDULER_PID $SCRAPER_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Dashboard
echo "Starting Dashboard (port 3000)..."
cd dashboard && npm run dev > ../logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!
cd ..

# Start Scheduler
echo "Starting Scheduler (port 3001)..."
cd scheduler && npm start > ../logs/scheduler.log 2>&1 &
SCHEDULER_PID=$!
cd ..

# Start Trending Scraper
echo "Starting Trending Scraper..."
cd trending-scraper && npm start > ../logs/scraper.log 2>&1 &
SCRAPER_PID=$!
cd ..

# Create logs directory if it doesn't exist
mkdir -p logs

echo ""
echo "✅ All services starting!"
echo ""
echo "Services:"
echo "  📊 Dashboard:    http://localhost:3000"
echo "  ⏰ Scheduler:    http://localhost:3001"
echo "  🔍 Scraper:      Running in background"
echo ""
echo "Logs are in the 'logs' directory"
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all processes
wait

