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

- **Docker and Docker Compose**: For running the entire application stack.
- **Node.js 18+ and npm**: For dependency management and running setup scripts.
- **API Keys**:
  - OpenAI
  - Supabase (for data storage)
  - _(Optional)_ DeepL, Twitter/X, LinkedIn, etc.

## 🛠️ Installation

### Quick Start (Recommended)

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd n8n_intercept_tiktok_enh
    ```

2.  **Run the Setup Script**
    This will install all dependencies and create the necessary `.env` files.
    ```bash
    npm run setup
    ```

3.  **Add Your API Keys**
    Edit the newly created `.env` files in `dashboard/` and `scheduler/` with your API keys (especially Supabase and OpenAI).

4.  **Start All Services**
    ```bash
    docker-compose up -d
    ```

5.  **Access the applications:**
    - **Dashboard**: http://localhost:3000
    - **n8n**: http://localhost:5678

See **[QUICK_START.md](QUICK_START.md)** for more detailed instructions.

### Manual Installation

The recommended setup is using Docker Compose. For manual setup of each service, refer to the `README.md` inside each service's directory.

## ⚙️ Configuration

The entire platform is configured through `.env` files in each service's directory and the `docker-compose.yml` file.

- **`docker-compose.yml`**: Defines the services, ports, and volumes.
- **`dashboard/.env`**: Contains API keys for the frontend application (Vite prefixes are required).
- **`scheduler/.env`**: Contains API keys and service configurations for the backend scheduler.
- **`trending-scraper/.env`**: Contains the webhook URL for the scraper service.
- **`n8n` service `environment` in `docker-compose.yml`**: Contains Supabase credentials for n8n.

## 📖 Usage

### Basic Content Generation

1. Open your n8n instance at `http://localhost:5678`.
2. Import the workflows from the `/workflows` directory.
3. Configure your credentials in n8n for the services you want to use (e.g., OpenAI, Twitter).
4. Trigger the workflows via the webhooks defined in them.

### Advanced Features

- **Scheduled Publishing**: Use the dashboard to schedule content for future publication.
- **Multi-Channel Publishing**: Configure the `publishing-hub.json` workflow to publish to multiple channels.
- **Trending Topics**: The scraper service will automatically feed trending topics to your n8n workflows.

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

