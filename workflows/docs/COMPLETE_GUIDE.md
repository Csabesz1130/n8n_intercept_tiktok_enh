# Complete Guide to Viral n8n Workflows

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Getting Started](#getting-started)
4. [Core Modules Deep Dive](#core-modules-deep-dive)
5. [User Workflows Explained](#user-workflows-explained)
6. [Channel Publishers Guide](#channel-publishers-guide)
7. [Advanced Usage](#advanced-usage)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Introduction

The Viral n8n Content Platform is a comprehensive system for generating, enhancing, and publishing content across multiple social media channels. This guide provides complete documentation for all workflows.

## System Overview

### Architecture

The platform uses a modular architecture:

- **Core Modules**: Reusable components for content generation, enhancement, translation, and memory management
- **User Workflows**: Complete solutions tailored for specific user types
- **Channel Publishers**: Specialized workflows for each social media platform
- **Utilities**: Helper workflows for scheduling and monitoring

### Key Features

- AI-powered content generation
- Multi-channel publishing
- Content enhancement (summaries, headlines, sentiment, fact-check)
- Multi-language support
- Duplicate detection
- Scheduling capabilities
- Approval workflows

## Getting Started

### Prerequisites

- n8n instance (v1.0.0+)
- OpenAI API key
- Supabase account (for memory system)
- Social media API credentials (as needed)
- DeepL API key (for translation - optional)

### Installation Steps

1. **Import Core Modules** (see IMPORT_GUIDE.md)
2. **Configure Credentials**
3. **Import User Workflow**
4. **Link Workflows**
5. **Test and Activate**

See `IMPORT_GUIDE.md` for detailed step-by-step instructions.

## Core Modules Deep Dive

### Content Generation Core

**Purpose**: Generate AI-powered content ideas

**How It Works**:
1. Receives keyword, topics, organization type, region
2. Builds optimized prompts for target audience
3. Calls OpenAI GPT model
4. Extracts and structures ideas

**Input**:
```json
{
  "keyword": "main topic",
  "topics": ["#hashtag1", "#hashtag2"],
  "organization_type": "journalist",
  "region": "HU",
  "account": {
    "niche": "news",
    "tone": "professional"
  }
}
```

**Output**:
```json
{
  "ideas": [
    {
      "id": 1,
      "hook": "Engaging title",
      "format": "Talking Head",
      "concept": "Detailed concept",
      "beats": ["Intro", "Main", "Conclusion"],
      "caption": "Social caption #hashtags",
      "CTA": "Call to action"
    }
  ],
  "ideas_count": 5
}
```

**Customization**:
- Modify prompts in "Build Prompts" node
- Change AI model (gpt-4o-mini, gpt-4, etc.)
- Adjust idea count in prompts

**See**: `docs/CORE_MODULES.md` for full documentation

### Content Enhancement

**Purpose**: Enhance ideas with summaries, headlines, sentiment, fact-check

**How It Works**:
1. Splits ideas for parallel processing
2. Runs 4 AI processes simultaneously
3. Merges results into original ideas

**Enhancements Added**:
- Summary and TL;DR
- Headline variations (clickbait, neutral, formal)
- Sentiment analysis
- Fact-check prompts

**See**: `docs/CORE_MODULES.md` for full documentation

### Memory System

**Purpose**: Manage user preferences and prevent duplicates

**How It Works**:
1. Generates fingerprints for duplicate detection
2. Loads user preferences, previous ideas, themes
3. Determines if new content should be generated

**Features**:
- 7-day duplicate detection window
- Theme coverage tracking
- User preference management

**See**: `docs/CORE_MODULES.md` for full documentation

### Translation Module

**Purpose**: Translate content to target languages

**How It Works**:
1. Extracts translatable content
2. Calls DeepL API
3. Merges translations back

**Supported Languages**: All DeepL-supported languages

**See**: `docs/CORE_MODULES.md` for full documentation

## User Workflows Explained

### Journalist Workflow

**Best For**: News content, journalism, fact-checked content

**Features**:
- Fact-check priority filtering
- Multi-channel publishing
- Professional tone
- Immediate publishing

**Workflow**:
```
Request → Memory → Generate → Enhance → Filter Fact-Check → Publish → Respond
```

**See**: `docs/USER_WORKFLOWS.md` for full documentation

### Politician Workflow

**Best For**: Campaign content, political communications

**Features**:
- Sentiment filtering (positive/neutral only)
- Scheduling support
- Campaign-optimized
- Multi-channel ready

**Workflow**:
```
Request → Memory → Generate → Enhance → Filter Sentiment → Schedule/Respond
```

**See**: `docs/USER_WORKFLOWS.md` for full documentation

### Agency Workflow

**Best For**: Client content, agency services

**Features**:
- Approval workflow
- Client management
- Professional quality
- Multi-channel ready

**Workflow**:
```
Request → Memory → Generate → Enhance → Store for Approval → Respond
```

**See**: `docs/USER_WORKFLOWS.md` for full documentation

### Organization Workflow

**Best For**: Internal communications, multi-language content

**Features**:
- Multi-language translation
- Newsletter integration
- Formal tone
- Internal focus

**Workflow**:
```
Request → Memory → Generate → Enhance → Translate → Newsletter → Respond
```

**See**: `docs/USER_WORKFLOWS.md` for full documentation

## Channel Publishers Guide

### Twitter Publisher

**Character Limit**: 280 characters
**Features**: Auto-truncation, media support, URL generation

**Input**:
```json
{
  "content": "Your tweet",
  "media_url": "https://..." // Optional
}
```

**See**: `docs/CHANNEL_PUBLISHERS.md` for full documentation

### LinkedIn Publisher

**Character Limit**: 3000 characters
**Features**: Visibility control, professional formatting

**Input**:
```json
{
  "content": "Your post",
  "visibility": "PUBLIC" // or "CONNECTIONS"
}
```

**See**: `docs/CHANNEL_PUBLISHERS.md` for full documentation

### Mastodon Publisher

**Character Limit**: 500 characters
**Features**: Federation support, multiple visibility options

**Input**:
```json
{
  "content": "Your status",
  "visibility": "public" // public, unlisted, private, direct
}
```

**See**: `docs/CHANNEL_PUBLISHERS.md` for full documentation

### Newsletter Sender

**Providers**: Mailchimp, SendGrid
**Features**: HTML support, campaign management

**Input**:
```json
{
  "content": "Newsletter content",
  "subject": "Subject line",
  "list_id": "list-id or email",
  "provider": "mailchimp" // or "sendgrid"
}
```

**See**: `docs/CHANNEL_PUBLISHERS.md` for full documentation

## Advanced Usage

### Customizing AI Prompts

1. Open Content Generation Core workflow
2. Find "Build Prompts" node
3. Modify system_prompt or user_prompt
4. Save and test

### Adding New Channels

1. Create new publisher workflow (copy existing)
2. Implement channel-specific formatting
3. Add to Publishing Hub routing
4. Update user workflows

### Creating Custom User Workflow

1. Copy existing user workflow
2. Modify processing logic
3. Add/remove enhancement steps
4. Configure channel routing
5. Test thoroughly

### Workflow Chaining

Workflows can call other workflows:
```
User Workflow
  → Calls Memory System
  → Calls Content Generation
  → Calls Content Enhancement
  → Calls Publishing Hub
    → Calls Channel Publishers
```

## Troubleshooting

### Common Issues

**Workflow Not Found**
- Import all dependencies first
- Link Execute Workflow nodes
- Verify workflow IDs

**Credential Errors**
- Check credential names match
- Verify API keys are valid
- Test credentials individually

**Variable Missing**
- Add to Settings → Variables
- Restart n8n if needed
- Check variable names match

**Execution Fails**
- Check execution logs
- Verify input format
- Test individual nodes
- Check API quotas

### Debugging Tips

1. **Test Incrementally**: Test each module separately
2. **Check Logs**: Review n8n execution logs
3. **Verify Data**: Check data format at each step
4. **Test Credentials**: Verify API credentials work
5. **Monitor Resources**: Check API quotas and limits

## Best Practices

### Workflow Design

1. **Modular**: Keep workflows focused and reusable
2. **Documented**: Include documentation nodes
3. **Error Handling**: Handle errors gracefully
4. **Tested**: Test thoroughly before production
5. **Versioned**: Keep backups of workflows

### Performance

1. **Parallel Processing**: Use parallel branches where possible
2. **Caching**: Cache frequently used data
3. **Batching**: Process multiple items together
4. **Optimization**: Remove unnecessary nodes

### Security

1. **Credentials**: Never hardcode credentials
2. **Variables**: Use n8n variables for sensitive data
3. **Validation**: Validate all inputs
4. **Access Control**: Implement proper access control

### Maintenance

1. **Regular Updates**: Keep workflows updated
2. **Monitoring**: Monitor execution and errors
3. **Documentation**: Keep documentation current
4. **Testing**: Regular testing of workflows
5. **Backups**: Regular backups of workflows

## Additional Resources

- **Import Guide**: `IMPORT_GUIDE.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Setup Guide**: `WORKFLOW_SETUP.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Core Modules**: `docs/CORE_MODULES.md`
- **User Workflows**: `docs/USER_WORKFLOWS.md`
- **Channel Publishers**: `docs/CHANNEL_PUBLISHERS.md`

## Support

For issues or questions:
1. Check documentation first
2. Review execution logs
3. Test individual components
4. Verify configuration
5. Check n8n community forums

---

**Last Updated**: 2024-01-01
**Version**: 1.0.0

