# Workflow Setup Guide

## Overview

This directory contains modular n8n workflows organized by purpose. Each workflow can be imported independently or used as part of a larger system.

## Installation Order

### 1. Core Modules (Required)
Import these first as they are dependencies for other workflows:

1. **content-generation-core.json** - Basic AI content generation
2. **content-enhancement.json** - Summaries, headlines, sentiment, fact-check
3. **translation-module.json** - Multi-language support
4. **memory-system.json** - User preferences and duplicate detection

### 2. Channel Publishers (Optional)
Import as needed for publishing:

- **twitter-publisher.json** - Twitter/X publishing
- **linkedin-publisher.json** - LinkedIn publishing
- **mastodon-publisher.json** - Mastodon publishing
- **newsletter-sender.json** - Mailchimp/SendGrid newsletters

### 3. User Workflows (Complete Solutions)
Ready-to-use workflows for specific user types:

- **journalist-workflow.json** - News content with fact-checking
- **politician-workflow.json** - Campaign content with scheduling
- **agency-workflow.json** - Client content with approval workflow
- **organization-workflow.json** - Internal comms with translation

### 4. Utility Workflows (Optional)
Helper workflows:

- **content-scheduler.json** - Post scheduling
- **trending-monitor.json** - Trending topics storage

### 5. Webhook Endpoints (Quick Access)
Simplified entry points:

- **quick-generate.json** - Fast content generation
- **trending-content.json** - Generate from trending topics

## Configuration Steps

### Step 1: Import Core Modules

1. Open n8n
2. Go to Workflows → Import from File
3. Import each core module in order
4. Note the workflow IDs (you'll need these)

### Step 2: Configure Execute Workflow Nodes

After importing user workflows, you need to link them to core modules:

1. Open a user workflow (e.g., journalist-workflow.json)
2. Find "Execute Workflow" nodes
3. For each node:
   - Click the node
   - Select the corresponding core module workflow from the dropdown
   - Save

### Step 3: Set Up Credentials

Configure credentials in n8n:

- **OpenAI API** - For content generation
- **DeepL API** - For translation (optional)
- **Twitter Bearer Token** - For Twitter publishing
- **LinkedIn OAuth2** - For LinkedIn publishing
- **Mastodon Access Token** - For Mastodon publishing
- **Mailchimp API Key** - For newsletters
- **SendGrid API Key** - For newsletters

### Step 4: Configure Variables

Set these in n8n Settings → Variables:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `DEEPL_API_KEY` - DeepL API key (optional)
- `MASTODON_INSTANCE_URL` - Mastodon instance URL
- `MASTODON_ACCESS_TOKEN` - Mastodon access token
- `SCHEDULER_URL` - Scheduler service URL (default: http://localhost:3001)
- `N8N_WEBHOOK_URL` - Your n8n webhook base URL
- `LINKEDIN_PERSON_ID` - LinkedIn person URN
- `MAILCHIMP_API_URL` - Mailchimp API URL (e.g., https://us1.api.mailchimp.com)
- `MAILCHIMP_API_KEY` - Mailchimp API key
- `SENDGRID_API_KEY` - SendGrid API key

### Step 5: Activate Workflows

1. Open each workflow
2. Click "Active" toggle to activate
3. Test with sample data

## Testing Workflows

### Test Core Module

1. Open "Content Generation Core"
2. Use "Execute Workflow" node or manual trigger
3. Input test data:
```json
{
  "keyword": "test topic",
  "topics": ["#test"],
  "organization_type": "general",
  "region": "HU"
}
```

### Test User Workflow

1. Open a user workflow (e.g., "Journalist Workflow")
2. Copy the webhook URL
3. Send POST request:
```bash
curl -X POST https://your-n8n-instance.com/webhook/journalist-content \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "test",
    "topics": ["#news"],
    "channels": ["twitter"]
  }'
```

## Workflow Dependencies

```
User Workflows
├── Memory System (core)
├── Content Generation Core (core)
├── Content Enhancement (core)
├── Translation Module (core, optional)
└── Channel Publishers (as needed)
    ├── Twitter Publisher
    ├── LinkedIn Publisher
    ├── Mastodon Publisher
    └── Newsletter Sender
```

## Troubleshooting

### "Workflow not found" error
- Ensure all core modules are imported
- Check workflow IDs in Execute Workflow nodes
- Verify workflows are activated

### "Credential not found" error
- Set up credentials in n8n Settings → Credentials
- Check credential names match workflow requirements

### "Variable not set" error
- Go to Settings → Variables
- Add missing variables
- Restart n8n if needed

### Translation not working
- Verify DeepL API key is set
- Check API quota/limits
- Remove translation node if not needed

## Customization

### Modify Prompts
Edit the "Build Prompts" node in content-generation-core.json to change AI behavior.

### Add New Channels
1. Create new publisher workflow (copy existing one)
2. Update channel routing in user workflows
3. Add to Execute Workflow nodes

### Custom User Workflow
1. Copy an existing user workflow
2. Modify processing logic
3. Add/remove enhancement steps
4. Configure channel routing

## Support

For issues:
1. Check n8n execution logs
2. Verify all dependencies are imported
3. Test core modules individually
4. Check credentials and variables

