# Quick Start Guide

Get the Viral n8n Platform running in minutes with Docker!

## Prerequisites

- **Docker and Docker Compose**: For running the entire application stack.
- **Node.js 18+ and npm**: For running the initial setup script.

## 🚀 Quick Setup (4 Steps)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd n8n_intercept_tiktok_enh
```

### Step 2: Install Dependencies & Create .env Files

```bash
npm run setup
```
This command installs all necessary npm packages and creates the `.env` files for you.

### Step 3: Add Your API Keys

Edit the `.env` files in `dashboard/` and `scheduler/` with your API keys. At a minimum, you'll need to add your Supabase and OpenAI credentials.

- `dashboard/.env`: For frontend-specific keys (like Supabase anon key).
- `scheduler/.env`: For backend service keys (like Supabase service role key and OpenAI key).

### Step 4: Start Everything with Docker

```bash
docker-compose up -d
```

This single command will start all the services in the background:
- **Dashboard** (React UI)
- **Scheduler Service** (Backend API)
- **Trending Scraper** (Background worker)
- **n8n** (Workflow engine)
- **Redis** (In-memory cache)

## 🌐 Access the App

Once the containers are running, you can access the different parts of the application:

- **Dashboard**: http://localhost:3000
- **n8n**: http://localhost:5678
- **Scheduler API**: http://localhost:3001
- **Scheduler Health**: http://localhost:3001/health

## 🧪 Testing the Full-Stack Application

1.  **Open the dashboard** at http://localhost:3000.
2.  **Open n8n** at http://localhost:5678 and import the workflows from the `/workflows` directory.
3.  **Configure credentials** in n8n for any services you want to use (e.g., your Twitter account).
4.  Use the dashboard to **create and schedule content**.
5.  **Verify** that the scheduled content is published by checking the logs in `docker-compose logs -f scheduler` and `docker-compose logs -f n8n`.

## 🛑 Stopping Services

To stop all the running services, use the following command:

```bash
docker-compose down
```

## 🎯 Next Steps

1.  **Explore the Workflows**: Open n8n and see how the different workflows are connected.
2.  **Customize the Dashboard**: The React dashboard in the `dashboard/` directory is ready for you to customize.
3.  **Add New Channels**: Create new custom nodes in the `nodes/` directory to add support for more social media channels.

