# User Workflows Documentation

## Overview

User workflows are complete, ready-to-use solutions tailored for specific user types. They combine core modules and channel publishers to provide end-to-end functionality.

## Journalist Workflow

**File:** `users/journalist-workflow.json`

### Purpose
Generates fact-checked news content and publishes to social media channels.

### Workflow Steps

1. **Webhook Receives Request** - Accepts journalist content request
2. **Process Request** - Validates and formats input
3. **Call Memory System** - Loads user preferences and checks duplicates
4. **Should Generate?** - Checks if content should be generated (not duplicate)
5. **Call Content Generation** - Generates content ideas
6. **Call Content Enhancement** - Adds summaries, headlines, sentiment, fact-check
7. **Filter by Fact-Check** - Prioritizes content with fact-check prompts
8. **Prepare Publishing** - Formats content for selected channels
9. **Route by Channel** - Routes to appropriate publishers
10. **Publish** - Publishes to Twitter, LinkedIn, etc.
11. **Respond** - Returns success response

### Input (Webhook)
```json
{
  "user_id": "journalist-001",
  "keyword": "breaking news topic",
  "topics": ["#news", "#breaking"],
  "region": "HU",
  "prompt": "Create content about this news story",
  "channels": ["twitter", "linkedin"]
}
```

### Output
```json
{
  "success": true,
  "ideas_generated": 5,
  "published": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Key Features
- **Fact-Check Priority**: Filters ideas that have fact-check prompts
- **Multi-Channel Publishing**: Supports Twitter, LinkedIn, Mastodon
- **Duplicate Prevention**: Uses memory system to avoid duplicate content
- **Professional Tone**: Optimized for news/journalism context

### Use Cases
- Breaking news coverage
- Investigative journalism
- Opinion pieces
- News analysis

### Configuration
1. Import core modules (Memory System, Content Generation, Content Enhancement)
2. Import channel publishers (Twitter, LinkedIn)
3. Link Execute Workflow nodes to core modules
4. Configure credentials (OpenAI, Twitter, LinkedIn)
5. Set Supabase variables

---

## Politician Workflow

**File:** `users/politician-workflow.json`

### Purpose
Generates campaign content with sentiment filtering and scheduling capabilities.

### Workflow Steps

1. **Webhook Receives Request** - Accepts politician content request
2. **Process Request** - Validates input, extracts schedule time
3. **Call Memory System** - Loads preferences
4. **Call Content Generation** - Generates ideas
5. **Call Content Enhancement** - Enhances with sentiment analysis
6. **Filter by Sentiment** - Removes negative sentiment content
7. **Check Schedule** - Determines if content should be scheduled
8. **Schedule Post** - Schedules via scheduler service (if time provided)
9. **Respond** - Returns response

### Input (Webhook)
```json
{
  "user_id": "politician-001",
  "keyword": "campaign topic",
  "topics": ["#campaign", "#election"],
  "region": "HU",
  "prompt": "Create campaign content",
  "schedule_time": "2024-12-25T10:00:00Z",
  "channels": ["twitter", "linkedin"]
}
```

### Output (Scheduled)
```json
{
  "success": true,
  "ideas_generated": 5,
  "scheduled": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Key Features
- **Sentiment Filtering**: Only positive/neutral content
- **Scheduling**: Can schedule posts for future publication
- **Campaign-Optimized**: Tailored for political campaigns
- **Multi-Channel**: Supports all major platforms

### Use Cases
- Campaign announcements
- Policy explanations
- Event promotion
- Voter engagement

### Configuration
1. Import core modules
2. Import Content Scheduler utility workflow
3. Configure scheduler service URL
4. Set up channel credentials
5. Configure Supabase

---

## Agency Workflow

**File:** `users/agency-workflow.json`

### Purpose
Generates client content with approval workflow before publishing.

### Workflow Steps

1. **Webhook Receives Request** - Accepts agency content request
2. **Process Request** - Validates input, extracts client ID
3. **Call Memory System** - Loads preferences
4. **Call Content Generation** - Generates ideas
5. **Call Content Enhancement** - Enhances content
6. **Store for Approval** - Saves content for client approval
7. **Respond** - Returns approval URL

### Input (Webhook)
```json
{
  "user_id": "agency-001",
  "client_id": "client-123",
  "keyword": "client topic",
  "topics": ["#client", "#brand"],
  "region": "HU",
  "prompt": "Create content for client",
  "channels": ["twitter", "linkedin"]
}
```

### Output
```json
{
  "success": true,
  "ideas_generated": 5,
  "approval_required": true,
  "approval_url": "https://dashboard.example.com/approve/client-123",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Key Features
- **Approval Workflow**: Content stored for client review
- **Client Management**: Tracks content per client
- **Multi-Channel Ready**: Prepares for all channels
- **Professional Quality**: Enhanced with all AI features

### Use Cases
- Client social media management
- Content marketing campaigns
- Brand content creation
- Multi-client management

### Configuration
1. Import core modules
2. Set up approval storage (database or external system)
3. Configure approval URL generation
4. Set up client management system

---

## Organization Workflow

**File:** `users/organization-workflow.json`

### Purpose
Generates internal communications with translation and newsletter distribution.

### Workflow Steps

1. **Webhook Receives Request** - Accepts organization content request
2. **Process Request** - Validates input, extracts translation targets
3. **Call Memory System** - Loads preferences
4. **Call Content Generation** - Generates ideas
5. **Call Content Enhancement** - Enhances content
6. **Call Translation** - Translates to target languages
7. **Send Newsletter** - Distributes via Mailchimp/SendGrid
8. **Respond** - Returns success response

### Input (Webhook)
```json
{
  "user_id": "org-001",
  "keyword": "internal topic",
  "topics": ["#internal", "#announcement"],
  "region": "HU",
  "prompt": "Create internal communication",
  "translate_to": ["EN", "DE"],
  "newsletter_enabled": true
}
```

### Output
```json
{
  "success": true,
  "ideas_generated": 5,
  "translated": true,
  "newsletter_sent": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Key Features
- **Multi-Language**: Automatic translation to multiple languages
- **Newsletter Integration**: Direct Mailchimp/SendGrid support
- **Internal Focus**: Optimized for organizational communications
- **Professional Tone**: Formal, informative content style

### Use Cases
- Company announcements
- Internal newsletters
- Multi-region communications
- Policy updates

### Configuration
1. Import core modules including Translation Module
2. Import Newsletter Sender workflow
3. Configure DeepL API key
4. Set up Mailchimp or SendGrid
5. Configure translation target languages

---

## Workflow Comparison

| Feature | Journalist | Politician | Agency | Organization |
|---------|-----------|------------|--------|--------------|
| Fact-Check | ✅ Priority | ❌ | ❌ | ❌ |
| Sentiment Filter | ❌ | ✅ Positive only | ❌ | ❌ |
| Scheduling | ❌ | ✅ | ❌ | ❌ |
| Approval | ❌ | ❌ | ✅ | ❌ |
| Translation | ❌ | ❌ | ❌ | ✅ |
| Newsletter | ❌ | ❌ | ❌ | ✅ |
| Multi-Channel | ✅ | ✅ | ✅ | ❌ |

## Choosing the Right Workflow

### Use Journalist Workflow if:
- You need fact-checked content
- Publishing news or journalism
- Need immediate publishing
- Professional, objective tone required

### Use Politician Workflow if:
- Creating campaign content
- Need to schedule posts
- Want positive sentiment only
- Political context required

### Use Agency Workflow if:
- Managing multiple clients
- Need approval before publishing
- Client-specific content
- Professional agency services

### Use Organization Workflow if:
- Internal communications
- Multi-language support needed
- Newsletter distribution
- Formal, organizational tone

## Customization Guide

### Adding Features

1. **Add Fact-Check to Any Workflow**:
   - Import Content Enhancement module
   - Add Filter node after enhancement
   - Filter by `factCheckPrompts` presence

2. **Add Scheduling**:
   - Import Content Scheduler utility
   - Add Check Schedule node
   - Call scheduler before publishing

3. **Add Translation**:
   - Import Translation Module
   - Add after Content Enhancement
   - Configure target languages

4. **Add Approval**:
   - Add Store for Approval node
   - Set up approval storage
   - Generate approval URLs

### Modifying Workflows

1. **Change AI Prompts**: Edit Content Generation Core workflow
2. **Add Channels**: Import channel publisher, add to routing
3. **Modify Filters**: Edit filter nodes (sentiment, fact-check)
4. **Change Response Format**: Edit Respond nodes

## Best Practices

1. **Test Each Step**: Test workflows incrementally
2. **Monitor Execution**: Check n8n execution logs
3. **Handle Errors**: Add error handling nodes
4. **Document Changes**: Update workflow documentation
5. **Version Control**: Keep workflow backups

## Troubleshooting

### Workflow Not Executing
- Check all core modules are imported
- Verify Execute Workflow nodes are linked
- Check credentials are configured

### Content Not Generating
- Verify OpenAI API key
- Check input format matches expected
- Review execution logs

### Publishing Failing
- Verify channel credentials
- Check channel publisher workflows imported
- Verify content format matches channel requirements

### Translation Not Working
- Check DeepL API key
- Verify target language code
- Check API quota

