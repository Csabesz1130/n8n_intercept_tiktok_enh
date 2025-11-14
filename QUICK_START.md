# Quick Start Guide

Get the Viral n8n Platform running in minutes!

## Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Redis** (for scheduler - optional, can skip for basic testing)
- **n8n instance** (cloud or self-hosted)

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies

```bash
npm run setup
```

This will:
- Create all `.env` files from examples
- Install dependencies for all services

### Step 2: Configure Environment

Edit these files with your API keys:

**`.env`** (root):
```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/generate-hungarian-content
OPENAI_API_KEY=your-openai-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-key
```

**`scheduler/.env`**:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
```

**`dashboard/.env`**:
```env
VITE_API_BASE=http://localhost:3001/api
VITE_N8N_WEBHOOK=https://your-n8n-instance.com/webhook/generate-hungarian-content
```

### Step 3: Start Everything

**Windows:**
```powershell
.\start.ps1
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Or use npm:**
```bash
npm run dev
```

## 🌐 Access the App

Once started, open your browser:

- **Dashboard**: http://localhost:3000
- **Scheduler API**: http://localhost:3001
- **Scheduler Health**: http://localhost:3001/health

## 📋 What's Running

1. **Dashboard** (React) - Port 3000
   - Content review and scheduling UI
   - Multi-channel publishing interface

2. **Scheduler Service** - Port 3001
   - Post scheduling API
   - Redis-based queue management

3. **Trending Scraper** - Background
   - Scrapes trending topics
   - Sends to n8n webhook

## 🧪 Testing the App

### Test Dashboard

1. Open http://localhost:3000
2. You should see the dashboard interface
3. Select a content idea
4. Choose channels and schedule

### Test Scheduler API

```bash
# Health check
curl http://localhost:3001/health

# List scheduled posts
curl http://localhost:3001/api/scheduled

# Schedule a post
curl -X POST http://localhost:3001/api/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "webhookUrl": "https://your-n8n-instance.com/webhook/publish",
    "payload": {"content": "Test post"},
    "channels": ["twitter"],
    "scheduledTime": "2024-12-25T10:00:00Z"
  }'
```

### Test n8n Workflow

1. Import workflows from `workflows/` directory
2. Configure credentials in n8n
3. Use the webhook form at `index.html`
4. Or call webhook directly:

```bash
curl -X POST https://your-n8n-instance.com/webhook/journalist-content \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "test",
    "topics": ["#news"],
    "channels": ["twitter"]
  }'
```

## 🛠️ Troubleshooting

### Port Already in Use

If port 3000 or 3001 is taken:

**Dashboard:**
- Edit `dashboard/vite.config.js` and change port

**Scheduler:**
- Edit `scheduler/.env` and change `PORT=3001`

### Redis Not Running

Scheduler requires Redis. Options:

1. **Install Redis:**
   - Windows: Download from https://redis.io/download
   - Mac: `brew install redis && brew services start redis`
   - Linux: `sudo apt install redis && sudo systemctl start redis`

2. **Use Docker:**
   ```bash
   docker run -d -p 6379:6379 redis
   ```

3. **Skip Scheduler:**
   - Don't start scheduler service
   - Other services will work fine

### Services Not Starting

1. Check if dependencies are installed:
   ```bash
   npm run install:all
   ```

2. Check logs:
   - Windows: Check PowerShell windows
   - Linux/Mac: Check `logs/` directory

3. Verify Node.js version:
   ```bash
   node --version  # Should be 18+
   ```

### Dashboard Can't Connect to Scheduler

1. Verify scheduler is running: http://localhost:3001/health
2. Check `dashboard/.env` has correct `VITE_API_BASE`
3. Check CORS settings in scheduler (if needed)

## 📝 Development Mode

For development with auto-reload:

```bash
npm run dev
```

This runs all services in watch mode.

## 🛑 Stopping Services

**Windows (PowerShell):**
- Press `Ctrl+C` in the PowerShell window
- Or close the PowerShell windows

**Linux/Mac:**
- Press `Ctrl+C` in terminal
- Or: `pkill -f "node.*dashboard|node.*scheduler|node.*scraper"`

## 🎯 Next Steps

1. **Import n8n Workflows**: See `workflows/IMPORT_GUIDE.md`
2. **Configure n8n**: Set up credentials and variables
3. **Test Workflows**: Use webhook form or API
4. **Customize**: Modify workflows for your needs

## 📚 Documentation

- **Full Setup**: See main `README.md`
- **Workflows**: See `workflows/README.md`
- **Architecture**: See `workflows/docs/ARCHITECTURE.md`

---

**Need Help?** Check the troubleshooting section or review the logs!

