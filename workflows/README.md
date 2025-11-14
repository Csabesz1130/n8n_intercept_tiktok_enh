# Modular n8n Workflows

This directory contains modular, reusable n8n workflows organized by purpose.

## Structure

- **core/** - Reusable workflow modules
- **users/** - Complete workflows for specific user types
- **channels/** - Channel-specific publisher workflows
- **utils/** - Utility and helper workflows
- **webhooks/** - Simplified webhook entry points

## Usage

### Importing Workflows

1. Open your n8n instance
2. Click "Workflows" → "Import from File"
3. Select the desired workflow JSON file
4. Configure credentials and variables
5. Activate the workflow

### Using Sub-workflows

Many workflows use n8n's "Execute Workflow" node to call other workflows. Make sure to:
1. Import all required sub-workflows first
2. Update workflow IDs in Execute Workflow nodes
3. Configure shared variables (Supabase, API keys, etc.)

## Workflow Dependencies

### Core Modules (import these first)
- content-generation-core.json
- content-enhancement.json
- translation-module.json
- memory-system.json

### User Workflows (depend on core modules)
- journalist-workflow.json
- politician-workflow.json
- agency-workflow.json
- organization-workflow.json

### Channel Publishers (standalone or used by user workflows)
- twitter-publisher.json
- linkedin-publisher.json
- mastodon-publisher.json
- newsletter-sender.json

## Configuration

All workflows use n8n variables. Set these in your n8n instance:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key (for content generation)
- `DEEPL_API_KEY` - DeepL API key (for translation)

## Customization

Each workflow includes documentation nodes explaining:
- Purpose and use case
- Required credentials
- Input/output format
- Customization options

