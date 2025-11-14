# n8n Workflow Import Guide

## Quick Start

This guide will help you import and configure all workflows in your n8n instance.

## Step-by-Step Import Process

### Step 1: Prepare Your n8n Instance

1. **Access n8n**: Open your n8n instance (cloud or self-hosted)
2. **Check Version**: Ensure you're using n8n v1.0.0 or later
3. **Verify Credentials**: You'll need to set up credentials (see Step 3)

### Step 2: Import Core Modules (Required First)

Import these workflows in order - they are dependencies for other workflows:

#### 2.1 Content Generation Core
1. Go to **Workflows** → **Import from File**
2. Select `workflows/core/content-generation-core.json`
3. Click **Import**
4. **Note the Workflow ID** (you'll need this later)
5. **Don't activate yet** - configure credentials first

#### 2.2 Content Enhancement
1. Import `workflows/core/content-enhancement.json`
2. Note the Workflow ID

#### 2.3 Memory System
1. Import `workflows/core/memory-system.json`
2. Note the Workflow ID

#### 2.4 Translation Module (Optional)
1. Import `workflows/core/translation-module.json`
2. Note the Workflow ID
3. Only needed if you want translation features

#### 2.5 Publishing Hub (Optional)
1. Import `workflows/core/publishing-hub.json`
2. Note the Workflow ID
3. Only needed for multi-channel publishing

### Step 3: Configure Credentials

Before activating workflows, set up credentials:

#### 3.1 OpenAI API
1. Go to **Credentials** → **Add Credential**
2. Select **OpenAI**
3. Enter your OpenAI API key
4. Name it: `OpenAI` (or match the name in workflows)
5. Save

#### 3.2 Supabase (for Memory System)
1. Go to **Settings** → **Variables**
2. Add variable: `SUPABASE_URL` = Your Supabase project URL
3. Add variable: `SUPABASE_ANON_KEY` = Your Supabase anonymous key

#### 3.3 DeepL (for Translation - Optional)
1. Go to **Settings** → **Variables**
2. Add variable: `DEEPL_API_KEY` = Your DeepL API key

#### 3.4 Social Media APIs (for Publishers)
- **Twitter**: Add Bearer Token credential
- **LinkedIn**: Add OAuth2 credential
- **Mastodon**: Add variables `MASTODON_INSTANCE_URL` and `MASTODON_ACCESS_TOKEN`
- **Mailchimp**: Add variable `MAILCHIMP_API_KEY`
- **SendGrid**: Add variable `SENDGRID_API_KEY`

### Step 4: Link Core Modules

After importing, you need to link workflows together:

#### 4.1 Update Execute Workflow Nodes

1. Open **Content Generation Core** workflow
2. Check if it has any "Execute Workflow" nodes (it shouldn't - it's a base module)
3. Open **Content Enhancement** workflow
4. If it has "Execute Workflow" nodes, click each one:
   - Select the **Content Generation Core** workflow from dropdown
   - Save

5. Repeat for other workflows that use core modules

### Step 5: Import Channel Publishers (Optional)

Only import the channels you plan to use:

#### 5.1 Twitter Publisher
1. Import `workflows/channels/twitter-publisher.json`
2. Configure Twitter Bearer Token credential
3. Note the Workflow ID

#### 5.2 LinkedIn Publisher
1. Import `workflows/channels/linkedin-publisher.json`
2. Configure LinkedIn OAuth2 credential
3. Add variable: `LINKEDIN_PERSON_ID` = Your LinkedIn person URN
4. Note the Workflow ID

#### 5.3 Mastodon Publisher
1. Import `workflows/channels/mastodon-publisher.json`
2. Add variables: `MASTODON_INSTANCE_URL` and `MASTODON_ACCESS_TOKEN`
3. Note the Workflow ID

#### 5.4 Newsletter Sender
1. Import `workflows/channels/newsletter-sender.json`
2. Add variable: `MAILCHIMP_API_KEY` or `SENDGRID_API_KEY`
3. Note the Workflow ID

### Step 6: Import User Workflows

Choose the workflow that matches your use case:

#### 6.1 Journalist Workflow
1. Import `workflows/users/journalist-workflow.json`
2. Open the workflow
3. Find all "Execute Workflow" nodes
4. For each node:
   - **Call Memory System**: Select Memory System workflow
   - **Call Content Generation**: Select Content Generation Core workflow
   - **Call Content Enhancement**: Select Content Enhancement workflow
   - **Publish to Twitter**: Select Twitter Publisher workflow (if using)
   - **Publish to LinkedIn**: Select LinkedIn Publisher workflow (if using)
5. Save the workflow

#### 6.2 Politician Workflow
1. Import `workflows/users/politician-workflow.json`
2. Link Execute Workflow nodes (same as above)
3. Import `workflows/utils/content-scheduler.json` if using scheduling
4. Add variable: `SCHEDULER_URL` = http://localhost:3001 (or your scheduler URL)
5. Add variable: `N8N_WEBHOOK_URL` = Your n8n webhook base URL

#### 6.3 Agency Workflow
1. Import `workflows/users/agency-workflow.json`
2. Link Execute Workflow nodes
3. Configure approval storage system (database or external)

#### 6.4 Organization Workflow
1. Import `workflows/users/organization-workflow.json`
2. Link Execute Workflow nodes
3. Link Translation Module workflow
4. Link Newsletter Sender workflow

### Step 7: Import Utility Workflows (Optional)

#### 7.1 Content Scheduler
1. Import `workflows/utils/content-scheduler.json`
2. Ensure scheduler service is running
3. Add variable: `SCHEDULER_URL`

#### 7.2 Trending Monitor
1. Import `workflows/utils/trending-monitor.json`
2. Ensure Supabase is configured
3. Connect to trending scraper service

### Step 8: Import Webhook Endpoints (Optional)

#### 8.1 Quick Generate
1. Import `workflows/webhooks/quick-generate.json`
2. Link to Content Generation Core workflow
3. Activate workflow
4. Copy webhook URL

#### 8.2 Trending Content
1. Import `workflows/webhooks/trending-content.json`
2. Link to Content Generation Core workflow
3. Ensure Supabase has trending_topics table
4. Activate workflow

### Step 9: Activate Workflows

1. **Start with Core Modules**:
   - Activate Content Generation Core
   - Activate Content Enhancement
   - Activate Memory System

2. **Then Channel Publishers** (if using):
   - Activate each publisher you imported

3. **Finally User Workflows**:
   - Activate your chosen user workflow

### Step 10: Test Workflows

#### Test Core Module
1. Open Content Generation Core
2. Click "Execute Workflow"
3. Use test data:
```json
{
  "keyword": "test topic",
  "topics": ["#test"],
  "organization_type": "general",
  "region": "HU"
}
```
4. Check execution log for results

#### Test User Workflow
1. Open your user workflow (e.g., Journalist Workflow)
2. Copy the webhook URL
3. Send test request:
```bash
curl -X POST https://your-n8n-instance.com/webhook/journalist-content \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "test",
    "topics": ["#news"],
    "channels": ["twitter"]
  }'
```
4. Check execution log

## Troubleshooting Import Issues

### "Workflow not found" Error
**Problem**: Execute Workflow node can't find linked workflow

**Solution**:
1. Ensure all core modules are imported
2. Check workflow IDs match
3. Re-link Execute Workflow nodes
4. Verify workflows are saved

### "Credential not found" Error
**Problem**: Workflow references missing credential

**Solution**:
1. Go to Credentials
2. Create the missing credential
3. Name it exactly as referenced in workflow
4. Re-save the workflow

### "Variable not set" Error
**Problem**: Required n8n variable is missing

**Solution**:
1. Go to Settings → Variables
2. Add missing variable
3. Restart n8n if needed
4. Re-execute workflow

### JSON Import Fails
**Problem**: n8n can't parse the JSON file

**Solution**:
1. Verify JSON is valid (use JSON validator)
2. Check n8n version compatibility
3. Try importing in smaller chunks
4. Check for special characters

### Workflow Executes But No Output
**Problem**: Workflow runs but produces no results

**Solution**:
1. Check execution log for errors
2. Verify input data format
3. Check node connections
4. Verify credentials are working
5. Test individual nodes

## Workflow ID Reference

After importing, create a reference list:

```
Content Generation Core: [ID]
Content Enhancement: [ID]
Memory System: [ID]
Translation Module: [ID]
Publishing Hub: [ID]
Twitter Publisher: [ID]
LinkedIn Publisher: [ID]
Mastodon Publisher: [ID]
Newsletter Sender: [ID]
Journalist Workflow: [ID]
Politician Workflow: [ID]
Agency Workflow: [ID]
Organization Workflow: [ID]
```

## Next Steps

After successful import:

1. **Read Documentation**: See `workflows/docs/` for detailed guides
2. **Customize**: Modify workflows for your needs
3. **Test**: Test all workflows thoroughly
4. **Monitor**: Set up monitoring and alerts
5. **Optimize**: Fine-tune for performance

## Support

For issues:
1. Check n8n execution logs
2. Review workflow documentation
3. Verify all dependencies are imported
4. Test core modules individually
5. Check credentials and variables

