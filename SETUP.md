# Complete Setup Guide

## 🎯 Overview

This guide will help you set up and run the entire Viral n8n Platform, including:
- React Dashboard (Frontend)
- Scheduler Service (Backend API)
- Trending Scraper (Background Service)
- n8n Workflows (Automation)

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Redis installed (for scheduler - optional)
- [ ] n8n instance (cloud or self-hosted)
- [ ] API keys ready:
  - [ ] OpenAI API key
  - [ ] Supabase credentials
  - [ ] Social media API keys (optional)
  - [ ] DeepL API key (optional, for translation)

## 🚀 Installation Methods

### Method 1: Quick Start (Recommended)

**Windows:**
```powershell
# Run setup
npm run setup

# Start everything
.\start.ps1
```

**Linux/Mac:**
```bash
# Run setup
npm run setup

# Make script executable and run
chmod +x start.sh
./start.sh
```

### Method 2: Manual Setup

#### Step 1: Install Root Dependencies

```bash
npm install
```

#### Step 2: Install All Service Dependencies

```bash
npm run install:all
```

Or individually:
```bash
cd dashboard && npm install && cd ..
cd scheduler && npm install && cd ..
cd trending-scraper && npm install && cd ..
cd nodes && npm install && cd ..
```

#### Step 3: Create Environment Files

Copy example files:
```bash
# Root
cp .env.example .env

# Services
cp scheduler/.env.example scheduler/.env
cp trending-scraper/.env.example trending-scraper/.env
cp dashboard/.env.example dashboard/.env
```

#### Step 4: Configure Environment Variables

Edit each `.env` file with your credentials (see Configuration section below).

#### Step 5: Start Services

**Option A: All at once (npm scripts)**
```bash
npm run dev
```

**Option B: Individually**
```bash
# Terminal 1 - Dashboard
cd dashboard && npm run dev

# Terminal 2 - Scheduler
cd scheduler && npm start

# Terminal 3 - Scraper
cd trending-scraper && npm start
```

### Method 3: Docker (Advanced)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ⚙️ Configuration

### Root `.env`

```env
# n8n Configuration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/generate-hungarian-content

# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

# DeepL (Optional)
DEEPL_API_KEY=...

# Social Media APIs (Optional)
TWITTER_BEARER_TOKEN=...
LINKEDIN_CLIENT_ID=...
MASTODON_INSTANCE_URL=https://mastodon.social
MASTODON_ACCESS_TOKEN=...
MAILCHIMP_API_KEY=...
SENDGRID_API_KEY=...
```

### `scheduler/.env`

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
PORT=3001
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/publish
```

### `trending-scraper/.env`

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/trending-topics
SCRAPE_INTERVAL=0 */6 * * *
```

### `dashboard/.env`

```env
VITE_API_BASE=http://localhost:3001/api
VITE_N8N_WEBHOOK=https://your-n8n-instance.com/webhook/generate-hungarian-content
```

## 🔧 Redis Setup

### Windows

1. Download Redis from https://redis.io/download
2. Or use WSL: `wsl --install` then `sudo apt install redis`
3. Or use Docker: `docker run -d -p 6379:6379 redis`

### Mac

```bash
brew install redis
brew services start redis
```

### Linux

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Verify Redis

```bash
redis-cli ping
# Should return: PONG
```

## 🧪 Testing the Setup

### 1. Test Dashboard

Open browser: http://localhost:3000

You should see the dashboard interface.

### 2. Test Scheduler API

```bash
# Health check
curl http://localhost:3001/health

# Should return JSON with status: "healthy"
```

### 3. Test n8n Workflow

1. Import workflows (see `workflows/IMPORT_GUIDE.md`)
2. Configure credentials in n8n
3. Test webhook:
   - Use `index.html` form, or
   - Call webhook directly via curl/Postman

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Dashboard | 3000 | http://localhost:3000 |
| Scheduler API | 3001 | http://localhost:3001 |
| Redis | 6379 | localhost:6379 |

## 🐛 Troubleshooting

### Port Already in Use

**Change Dashboard Port:**
Edit `dashboard/vite.config.js`:
```js
server: {
  port: 3002, // Change from 3000
}
```

**Change Scheduler Port:**
Edit `scheduler/.env`:
```env
PORT=3002
```

### Redis Connection Failed

1. Check Redis is running: `redis-cli ping`
2. Verify host/port in `scheduler/.env`
3. Check firewall settings
4. Try `redis://localhost:6379` format

### Services Won't Start

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

2. **Reinstall dependencies:**
   ```bash
   npm run install:all
   ```

3. **Check logs:**
   - Windows: Check PowerShell windows
   - Linux/Mac: Check `logs/` directory
   - Docker: `docker-compose logs`

### Dashboard Can't Connect

1. Verify scheduler is running: http://localhost:3001/health
2. Check `dashboard/.env` has correct `VITE_API_BASE`
3. Check browser console for CORS errors
4. Verify CORS is enabled in scheduler (if needed)

### n8n Workflow Issues

1. Import all core modules first
2. Link Execute Workflow nodes correctly
3. Verify credentials in n8n
4. Check n8n execution logs
5. See `workflows/IMPORT_GUIDE.md`

## 🎯 Development Workflow

### Start Development Mode

```bash
npm run dev
```

This runs all services with auto-reload.

### Build for Production

```bash
# Build dashboard
cd dashboard && npm run build

# Services run with: npm start
```

### Stop Services

**Windows:**
- Close PowerShell windows, or
- Press `Ctrl+C` in each window

**Linux/Mac:**
- Press `Ctrl+C` in terminal, or
- `pkill -f "node.*dashboard|node.*scheduler|node.*scraper"`

**Docker:**
```bash
docker-compose down
```

## 📝 Next Steps

1. ✅ Services are running
2. 📥 Import n8n workflows (see `workflows/IMPORT_GUIDE.md`)
3. 🔑 Configure n8n credentials
4. 🧪 Test workflows
5. 🎨 Customize for your needs

## 📚 Additional Resources

- **Quick Start**: `QUICK_START.md`
- **Workflow Setup**: `workflows/WORKFLOW_SETUP.md`
- **Architecture**: `workflows/docs/ARCHITECTURE.md`
- **API Documentation**: See service READMEs

## 🆘 Need Help?

1. Check troubleshooting section above
2. Review service logs
3. Check n8n execution logs
4. Verify all environment variables are set
5. Ensure all dependencies are installed

---

**Happy Coding! 🚀**

