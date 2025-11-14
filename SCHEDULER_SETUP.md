# Scheduler Service Setup

## Quick Start

The scheduler service must be running for the dashboard to work properly. Here's how to start it:

### Option 1: Start Scheduler Only

```bash
cd scheduler
npm install  # If not already done
npm start
```

### Option 2: Start All Services (Recommended)

From the root directory:

```bash
# Windows
.\start.ps1

# Linux/Mac
./start.sh

# Or use npm
npm run dev
```

## Prerequisites

### Redis Required

The scheduler uses Redis for job queuing. You need Redis running:

**Windows:**
- Download from https://redis.io/download
- Or use WSL: `wsl --install` then `sudo apt install redis`
- Or use Docker: `docker run -d -p 6379:6379 redis`

**Mac:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

### Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

## Configuration

Create `scheduler/.env` file:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
PORT=3001
```

## API Endpoints

Once running, the scheduler provides:

- `GET /health` - Health check
- `GET /api/scheduled` - List scheduled posts
- `POST /api/schedule` - Schedule a new post
- `DELETE /api/schedule/:jobId` - Cancel a scheduled post
- `GET /api/reminders` - Get reminders (for dashboard)
- `GET /api/trends` - Get trends (for dashboard)

## Troubleshooting

### Connection Refused Error

If you see `ERR_CONNECTION_REFUSED`:

1. **Check if scheduler is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check if Redis is running:**
   ```bash
   redis-cli ping
   ```

3. **Start scheduler:**
   ```bash
   cd scheduler && npm start
   ```

### Redis Connection Error

If scheduler can't connect to Redis:

1. Verify Redis is running: `redis-cli ping`
2. Check `scheduler/.env` has correct Redis host/port
3. Check firewall settings
4. Try `redis://localhost:6379` format

### Port Already in Use

If port 3001 is taken:

1. Change port in `scheduler/.env`:
   ```env
   PORT=3002
   ```

2. Update dashboard `.env`:
   ```env
   VITE_API_BASE=http://localhost:3002/api
   ```

## Running in Background

### Windows (PowerShell)

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd scheduler; npm start"
```

### Linux/Mac

```bash
cd scheduler
nohup npm start > scheduler.log 2>&1 &
```

## Development Mode

For auto-reload during development:

```bash
cd scheduler
npm run dev  # Requires nodemon
```

## Integration with Dashboard

The dashboard automatically connects to the scheduler at:
- `http://localhost:3001/api` (default)

Make sure both are running:
1. Dashboard: `cd dashboard && npm run dev` (port 3000)
2. Scheduler: `cd scheduler && npm start` (port 3001)

---

**Need Help?** Check the main `SETUP.md` or `QUICK_START.md` for full setup instructions.

