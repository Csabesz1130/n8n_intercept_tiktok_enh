# Viral n8n Content Generation Platform

A powerful, AI-driven content generation and multi-channel publishing platform built on n8n workflows. Designed for journalists, politicians, agencies, and organizations to create, enhance, and distribute viral content across multiple social media channels.

## 🚀 Features

### Content Generation
- **AI-Powered Content Ideas**: Generate TikTok-style content ideas using OpenAI GPT models
- **Multi-Language Support**: Automatic translation via DeepL API
- **Content Enhancement**:
  - Summaries & TL;DR generation
  - Multiple headline variations (clickbait, neutral, formal)
  - Sentiment analysis
  - Fact-checking prompts
- **Trending Topics Integration**: Automatic scraping from Google Trends, Twitter, and GDELT

### Multi-Channel Publishing
- **Twitter/X**: Publish directly to Twitter/X
- **LinkedIn**: Share professional content on LinkedIn
- **Mastodon**: Post to Mastodon instances
- **Newsletter**: Send via Mailchimp or SendGrid

### Scheduling & Management
- **Scheduled Publishing**: Queue posts for future publication
- **Content Dashboard**: React-based UI for reviewing, editing, and approving content
- **Analytics**: Track engagement metrics across channels

### Memory & Personalization
- **User Preferences**: Store and recall user settings
- **Duplicate Detection**: Prevent generating duplicate content
- **Theme Coverage Tracking**: Monitor content themes over time

## 📋 Prerequisites

- Node.js 18+ and npm
- n8n instance (cloud or self-hosted)
- Redis (for scheduler service)
- API keys for:
  - OpenAI
  - DeepL (optional, for translation)
  - Twitter/X API
  - LinkedIn API
  - Mastodon (instance-specific)
  - Mailchimp or SendGrid
  - Supabase (for data storage)

## 🛠️ Installation

### Quick Start (Recommended)

**Windows:**
```powershell
npm run setup
.\start.ps1
```

**Linux/Mac:**
```bash
npm run setup
chmod +x start.sh
./start.sh
```

Then open http://localhost:3000 in your browser!

See **[QUICK_START.md](QUICK_START.md)** for detailed instructions.

### Manual Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd n8n_intercept_tiktok_enh
```

### 2. Run Setup

```bash
npm run setup
```

This will install all dependencies and create environment files.

### 3. Configure Environment

Edit `.env` files with your API keys (see [SETUP.md](SETUP.md) for details).

### 4. Start Services

```bash
npm run dev
```

Or use platform-specific scripts:
- Windows: `.\start.ps1` or `start-dev.bat`
- Linux/Mac: `./start.sh`

### 5. Import n8n Workflow

1. Open your n8n instance
2. Import `whatcanitdo.json` as a new workflow
3. Configure credentials:
   - OpenAI API
   - Supabase (URL and anon key)
   - Gmail (for email delivery)
   - PDFShift (for PDF generation)

### 3. Install Custom Nodes

Copy the custom node files from `nodes/` to your n8n custom nodes directory:

```bash
# For n8n self-hosted
cp -r nodes/ ~/.n8n/custom/

# For n8n cloud, use the n8n UI to add custom nodes
```

### 4. Setup Scheduler Service

```bash
cd scheduler
npm install
cp .env.example .env
# Edit .env with your Redis and n8n webhook URLs
npm start
```

### 5. Setup Trending Scraper

```bash
cd trending-scraper
npm install
cp .env.example .env
# Edit .env with your n8n webhook URL
npm start
```

### 6. Setup Dashboard

```bash
cd dashboard
npm install
# Create .env file with:
# VITE_API_BASE=http://localhost:3001/api
# VITE_N8N_WEBHOOK=https://your-n8n-instance.com/webhook/generate-hungarian-content
npm run dev
```

## ⚙️ Configuration

### Environment Variables

#### Scheduler Service (`scheduler/.env`)
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
PORT=3001
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/publish
```

#### Trending Scraper (`trending-scraper/.env`)
```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/trending-topics
SCRAPE_INTERVAL=0 */6 * * *
```

#### Dashboard (`dashboard/.env`)
```env
VITE_API_BASE=http://localhost:3001/api
VITE_N8N_WEBHOOK=https://your-n8n-instance.com/webhook/generate-hungarian-content
```

### n8n Variables

Set these in your n8n instance settings:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `DEEPL_API_KEY`: DeepL API key (optional)

## 📖 Usage

### Basic Content Generation

1. Open `index.html` in a browser
2. Fill in the form:
   - User ID
   - Organization type
   - Keyword/topic
   - Topics/hashtags
   - Email for delivery
3. Submit the form
4. Receive PDF report via email

### Advanced Features

#### Scheduled Publishing

1. Use the React dashboard (`dashboard/`)
2. Select a generated content idea
3. Choose publishing channels
4. Set schedule time
5. Content will be published automatically

#### Multi-Channel Publishing

In the workflow, after content generation:
1. Content is enhanced with AI (summaries, headlines, sentiment)
2. Translated if needed
3. Published to selected channels via custom nodes

#### Trending Topics Integration

The trending scraper automatically:
1. Scrapes Google Trends, Twitter, and GDELT
2. Sends trending topics to n8n webhook
3. Workflow can use these for content generation

## 🎯 Use Cases

### For Journalists
- Generate article ideas based on trending topics
- Create social media content for articles
- Schedule posts for optimal engagement

### For Politicians
- Create campaign content
- Track theme coverage
- Multi-channel distribution

### For Agencies
- Client content generation
- Scheduled social media campaigns
- Analytics and reporting

### For Organizations
- Internal communications
- Public relations content
- Newsletter generation

## 📁 Project Structure

```
.
├── whatcanitdo.json          # Main n8n workflow (monolithic)
├── index.html                # Content generation webhook form
├── workflows/                # Modular n8n workflows
│   ├── core/                 # Core reusable modules
│   │   ├── content-generation-core.json
│   │   ├── content-enhancement.json
│   │   ├── translation-module.json
│   │   ├── memory-system.json
│   │   └── publishing-hub.json
│   ├── users/                # User-specific workflows
│   │   ├── journalist-workflow.json
│   │   ├── politician-workflow.json
│   │   ├── agency-workflow.json
│   │   └── organization-workflow.json
│   ├── channels/             # Channel publishers
│   │   ├── twitter-publisher.json
│   │   ├── linkedin-publisher.json
│   │   ├── mastodon-publisher.json
│   │   └── newsletter-sender.json
│   ├── utils/                # Utility workflows
│   │   ├── content-scheduler.json
│   │   └── trending-monitor.json
│   ├── webhooks/             # Webhook endpoints
│   │   ├── quick-generate.json
│   │   └── trending-content.json
│   ├── README.md
│   └── WORKFLOW_SETUP.md
├── nodes/                    # Custom n8n nodes
│   ├── TwitterNode.ts
│   ├── LinkedInNode.ts
│   ├── MastodonNode.ts
│   └── NewsletterNode.ts
├── scheduler/                # Post scheduling service
│   ├── index.js
│   └── package.json
├── trending-scraper/         # Trending topics scraper
│   ├── index.js
│   └── package.json
└── dashboard/                # React dashboard
    ├── src/
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🔄 Modular Workflows

The project now includes **modular workflows** for easier customization and maintenance. See `workflows/README.md` and `workflows/WORKFLOW_SETUP.md` for details.

### Quick Start with Modular Workflows

1. **Import Core Modules** (required):
   - `workflows/core/content-generation-core.json`
   - `workflows/core/content-enhancement.json`
   - `workflows/core/memory-system.json`

2. **Import User Workflow** (choose one):
   - `workflows/users/journalist-workflow.json` - For journalists
   - `workflows/users/politician-workflow.json` - For politicians
   - `workflows/users/agency-workflow.json` - For agencies
   - `workflows/users/organization-workflow.json` - For organizations

3. **Link Workflows**: Configure "Execute Workflow" nodes to reference core modules

4. **Configure**: Set credentials and variables as described in `workflows/WORKFLOW_SETUP.md`

## 🔧 Customization

### Adding New Channels

1. Create a new node in `nodes/` following the pattern of existing nodes
2. Add it to the workflow after content generation
3. Update the dashboard to include the new channel option

### Custom AI Prompts

Edit the AI enhancement nodes in `whatcanitdo.json`:
- `Generate Summaries`
- `Generate Headlines`
- `Analyze Sentiment`
- `Generate Fact-Check Prompts`

### Workflow Modifications

The workflow is modular. Key sections:
- **Input Processing**: Webhook → Content Request Processor
- **Memory Management**: Load preferences, check duplicates
- **Content Generation**: TikTok scraping → AI generation
- **Enhancement**: Summaries, headlines, sentiment, fact-check
- **Translation**: DeepL integration
- **Storage**: Supabase integration
- **Output**: PDF generation and email delivery

## 🐛 Troubleshooting

### Workflow Not Executing
- Check n8n credentials are configured
- Verify webhook URL is correct
- Check n8n execution logs

### Scheduler Not Working
- Verify Redis is running and accessible
- Check scheduler service logs
- Ensure n8n webhook URL is correct

### Translation Failing
- Verify DeepL API key is set
- Check API quota/limits
- Fallback: Remove translation node if not needed

### Custom Nodes Not Loading
- Ensure nodes are in correct directory
- Restart n8n after adding custom nodes
- Check n8n logs for errors

## 📝 License

[Your License Here]

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues and questions, please open a GitHub issue.

---

**Made with ❤️ for journalists, politicians, agencies, and organizations**

