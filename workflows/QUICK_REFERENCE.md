# Quick Reference Guide

## Workflow Selection Guide

### I want to...

**Generate content quickly**
→ Use `webhooks/quick-generate.json`

**Generate content from trending topics**
→ Use `webhooks/trending-content.json`

**Create news content with fact-checking**
→ Use `users/journalist-workflow.json`

**Create campaign content with scheduling**
→ Use `users/politician-workflow.json`

**Create client content with approval**
→ Use `users/agency-workflow.json`

**Create internal comms with translation**
→ Use `users/organization-workflow.json`

**Publish to multiple channels**
→ Use `core/publishing-hub.json`

**Schedule posts for later**
→ Use `utils/content-scheduler.json`

## Workflow Input/Output

### Content Generation Core
**Input:**
```json
{
  "keyword": "topic",
  "topics": ["#hashtag1", "#hashtag2"],
  "organization_type": "general",
  "region": "HU"
}
```

**Output:**
```json
{
  "ideas": [...],
  "ideas_count": 5
}
```

### Content Enhancement
**Input:**
```json
{
  "ideas": [...]
}
```

**Output:**
```json
{
  "ideas": [{
    "id": 1,
    "hook": "...",
    "summary": "...",
    "headlines": {...},
    "sentiment": "positive",
    "factCheckPrompts": [...]
  }]
}
```

### Publishing Hub
**Input:**
```json
{
  "content": "Your content here",
  "channels": ["twitter", "linkedin"]
}
```

**Output:**
```json
{
  "results": [...],
  "success_count": 2,
  "all_successful": true
}
```

## Common Webhook Endpoints

### Journalist Workflow
```
POST /webhook/journalist-content
Body: {
  "keyword": "news topic",
  "topics": ["#news"],
  "channels": ["twitter"]
}
```

### Politician Workflow
```
POST /webhook/politician-content
Body: {
  "keyword": "campaign topic",
  "schedule_time": "2024-12-25T10:00:00Z",
  "channels": ["twitter", "linkedin"]
}
```

### Quick Generate
```
POST /webhook/quick-generate
Body: {
  "keyword": "topic",
  "topics": ["#hashtag"]
}
```

## Workflow Dependencies

```
Journalist Workflow
├── Memory System
├── Content Generation Core
├── Content Enhancement
└── Twitter Publisher (if channels include twitter)

Politician Workflow
├── Memory System
├── Content Generation Core
├── Content Enhancement
└── Content Scheduler (if schedule_time provided)

Organization Workflow
├── Memory System
├── Content Generation Core
├── Content Enhancement
├── Translation Module
└── Newsletter Sender
```

## Troubleshooting Quick Fixes

**"Workflow not found"**
→ Import the workflow first, then link it in Execute Workflow nodes

**"Credential missing"**
→ Go to Settings → Credentials and add the required credential

**"Variable not set"**
→ Go to Settings → Variables and add the missing variable

**Translation not working**
→ Check DeepL API key, or remove translation node if not needed

**Publishing fails**
→ Verify channel credentials are set up correctly

