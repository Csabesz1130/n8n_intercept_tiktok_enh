# Workflows Index & Documentation

## 📚 Documentation Files

### Getting Started
- **[README.md](README.md)** - Overview and structure
- **[IMPORT_GUIDE.md](IMPORT_GUIDE.md)** - Step-by-step import instructions
- **[WORKFLOW_SETUP.md](WORKFLOW_SETUP.md)** - Configuration and setup
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference guide

### Detailed Documentation
- **[docs/COMPLETE_GUIDE.md](docs/COMPLETE_GUIDE.md)** - Complete guide to all workflows
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and design
- **[docs/CORE_MODULES.md](docs/CORE_MODULES.md)** - Core module documentation
- **[docs/USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md)** - User workflow documentation
- **[docs/CHANNEL_PUBLISHERS.md](docs/CHANNEL_PUBLISHERS.md)** - Channel publisher documentation

## 📦 Workflow Files

### Core Modules (Required)
Located in `core/` directory:

1. **content-generation-core.json**
   - Purpose: AI-powered content idea generation
   - Dependencies: OpenAI API
   - Used by: All user workflows
   - Documentation: [docs/CORE_MODULES.md](docs/CORE_MODULES.md#content-generation-core)

2. **content-enhancement.json**
   - Purpose: Enhance ideas with summaries, headlines, sentiment, fact-check
   - Dependencies: OpenAI API, Content Generation Core
   - Used by: All user workflows
   - Documentation: [docs/CORE_MODULES.md](docs/CORE_MODULES.md#content-enhancement)

3. **memory-system.json**
   - Purpose: User preferences and duplicate detection
   - Dependencies: Supabase
   - Used by: All user workflows
   - Documentation: [docs/CORE_MODULES.md](docs/CORE_MODULES.md#memory-system)

4. **translation-module.json** (Optional)
   - Purpose: Multi-language content translation
   - Dependencies: DeepL API, Content Generation Core
   - Used by: Organization workflow
   - Documentation: [docs/CORE_MODULES.md](docs/CORE_MODULES.md#translation-module)

5. **publishing-hub.json** (Optional)
   - Purpose: Multi-channel publishing coordinator
   - Dependencies: Channel publishers
   - Used by: Journalist, Politician workflows
   - Documentation: [docs/CORE_MODULES.md](docs/CORE_MODULES.md#publishing-hub)

### User Workflows (Complete Solutions)
Located in `users/` directory:

1. **journalist-workflow.json**
   - Purpose: News content with fact-checking
   - Features: Fact-check filtering, multi-channel publishing
   - Documentation: [docs/USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md#journalist-workflow)

2. **politician-workflow.json**
   - Purpose: Campaign content with scheduling
   - Features: Sentiment filtering, post scheduling
   - Documentation: [docs/USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md#politician-workflow)

3. **agency-workflow.json**
   - Purpose: Client content with approval
   - Features: Approval workflow, client management
   - Documentation: [docs/USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md#agency-workflow)

4. **organization-workflow.json**
   - Purpose: Internal communications with translation
   - Features: Multi-language, newsletter integration
   - Documentation: [docs/USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md#organization-workflow)

### Channel Publishers
Located in `channels/` directory:

1. **twitter-publisher.json**
   - Purpose: Publish to Twitter/X
   - Character limit: 280
   - Documentation: [docs/CHANNEL_PUBLISHERS.md](docs/CHANNEL_PUBLISHERS.md#twitter-publisher)

2. **linkedin-publisher.json**
   - Purpose: Publish to LinkedIn
   - Character limit: 3000
   - Documentation: [docs/CHANNEL_PUBLISHERS.md](docs/CHANNEL_PUBLISHERS.md#linkedin-publisher)

3. **mastodon-publisher.json**
   - Purpose: Publish to Mastodon
   - Character limit: 500
   - Documentation: [docs/CHANNEL_PUBLISHERS.md](docs/CHANNEL_PUBLISHERS.md#mastodon-publisher)

4. **newsletter-sender.json**
   - Purpose: Send newsletters via Mailchimp/SendGrid
   - Providers: Mailchimp, SendGrid
   - Documentation: [docs/CHANNEL_PUBLISHERS.md](docs/CHANNEL_PUBLISHERS.md#newsletter-sender)

### Utility Workflows
Located in `utils/` directory:

1. **content-scheduler.json**
   - Purpose: Schedule posts for future publication
   - Dependencies: Scheduler service
   - Documentation: See main README.md

2. **trending-monitor.json**
   - Purpose: Store trending topics
   - Dependencies: Supabase, Trending scraper
   - Documentation: See main README.md

### Webhook Endpoints
Located in `webhooks/` directory:

1. **quick-generate.json**
   - Purpose: Fast content generation endpoint
   - Documentation: See main README.md

2. **trending-content.json**
   - Purpose: Generate content from trending topics
   - Documentation: See main README.md

## 🚀 Quick Start Paths

### For Journalists
1. Read: [IMPORT_GUIDE.md](IMPORT_GUIDE.md)
2. Import: Core modules + Journalist workflow
3. Configure: OpenAI, Supabase, Twitter/LinkedIn
4. Test: Use webhook endpoint
5. Reference: [docs/USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md#journalist-workflow)

### For Politicians
1. Read: [IMPORT_GUIDE.md](IMPORT_GUIDE.md)
2. Import: Core modules + Politician workflow + Scheduler
3. Configure: OpenAI, Supabase, Scheduler service
4. Test: Schedule a post
5. Reference: [docs/USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md#politician-workflow)

### For Agencies
1. Read: [IMPORT_GUIDE.md](IMPORT_GUIDE.md)
2. Import: Core modules + Agency workflow
3. Configure: OpenAI, Supabase, Approval system
4. Test: Generate and approve content
5. Reference: [docs/USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md#agency-workflow)

### For Organizations
1. Read: [IMPORT_GUIDE.md](IMPORT_GUIDE.md)
2. Import: Core modules + Organization workflow + Translation + Newsletter
3. Configure: OpenAI, Supabase, DeepL, Mailchimp/SendGrid
4. Test: Generate, translate, send newsletter
5. Reference: [docs/USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md#organization-workflow)

## 📖 Documentation by Topic

### Understanding the System
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - How everything works together
- [COMPLETE_GUIDE.md](docs/COMPLETE_GUIDE.md) - Comprehensive guide

### Working with Workflows
- [CORE_MODULES.md](docs/CORE_MODULES.md) - Understanding core modules
- [USER_WORKFLOWS.md](docs/USER_WORKFLOWS.md) - Using user workflows
- [CHANNEL_PUBLISHERS.md](docs/CHANNEL_PUBLISHERS.md) - Publishing to channels

### Setup & Configuration
- [IMPORT_GUIDE.md](IMPORT_GUIDE.md) - Importing workflows
- [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md) - Configuration details
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick commands and formats

## 🔍 Finding What You Need

### I want to...
- **Import workflows** → [IMPORT_GUIDE.md](IMPORT_GUIDE.md)
- **Understand how it works** → [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Customize workflows** → [CORE_MODULES.md](docs/CORE_MODULES.md)
- **Publish to channels** → [CHANNEL_PUBLISHERS.md](docs/CHANNEL_PUBLISHERS.md)
- **Troubleshoot issues** → [COMPLETE_GUIDE.md](docs/COMPLETE_GUIDE.md#troubleshooting)
- **Quick reference** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

## 📝 File Structure

```
workflows/
├── INDEX.md (this file)
├── README.md
├── IMPORT_GUIDE.md
├── WORKFLOW_SETUP.md
├── QUICK_REFERENCE.md
├── core/
│   ├── content-generation-core.json
│   ├── content-enhancement.json
│   ├── memory-system.json
│   ├── translation-module.json
│   └── publishing-hub.json
├── users/
│   ├── journalist-workflow.json
│   ├── politician-workflow.json
│   ├── agency-workflow.json
│   └── organization-workflow.json
├── channels/
│   ├── twitter-publisher.json
│   ├── linkedin-publisher.json
│   ├── mastodon-publisher.json
│   └── newsletter-sender.json
├── utils/
│   ├── content-scheduler.json
│   └── trending-monitor.json
├── webhooks/
│   ├── quick-generate.json
│   └── trending-content.json
└── docs/
    ├── ARCHITECTURE.md
    ├── COMPLETE_GUIDE.md
    ├── CORE_MODULES.md
    ├── USER_WORKFLOWS.md
    └── CHANNEL_PUBLISHERS.md
```

## ✅ Checklist

Before using workflows:

- [ ] Read [IMPORT_GUIDE.md](IMPORT_GUIDE.md)
- [ ] Import core modules
- [ ] Configure credentials
- [ ] Import user workflow
- [ ] Link workflows together
- [ ] Test with sample data
- [ ] Read relevant documentation
- [ ] Configure variables
- [ ] Activate workflows

## 🆘 Need Help?

1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick answers
2. Read [COMPLETE_GUIDE.md](docs/COMPLETE_GUIDE.md) for comprehensive help
3. Review [IMPORT_GUIDE.md](IMPORT_GUIDE.md) for setup issues
4. Check execution logs in n8n
5. Verify all dependencies are imported

---

**Last Updated**: 2024-01-01
**Version**: 1.0.0

