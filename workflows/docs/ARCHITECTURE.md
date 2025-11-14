# Architecture Documentation

## System Overview

The Viral n8n Content Platform is built on a modular architecture where workflows are composed of reusable components. This design enables flexibility, maintainability, and easy customization.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    User Workflows                        │
│  (Journalist, Politician, Agency, Organization)          │
└──────────────┬──────────────────────────────────────────┘
               │
               │ Uses
               ▼
┌─────────────────────────────────────────────────────────┐
│                    Core Modules                          │
│  (Generation, Enhancement, Translation, Memory)         │
└──────────────┬──────────────────────────────────────────┘
               │
               │ Uses
               ▼
┌─────────────────────────────────────────────────────────┐
│                 Channel Publishers                       │
│  (Twitter, LinkedIn, Mastodon, Newsletter)               │
└──────────────┬──────────────────────────────────────────┘
               │
               │ Uses
               ▼
┌─────────────────────────────────────────────────────────┐
│              External Services & APIs                    │
│  (OpenAI, DeepL, Supabase, Social Media APIs)            │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Content Generation Flow

```
User Request
    │
    ▼
Webhook (User Workflow)
    │
    ▼
Process Request
    │
    ▼
Memory System ────┐
    │            │
    ▼            │
Should Generate? │
    │            │
    ▼            │
Content Generation Core
    │            │
    ▼            │
Content Enhancement
    │            │
    ▼            │
Filter/Process   │
    │            │
    ▼            │
Publishing Hub ──┘
    │
    ▼
Channel Publishers
    │
    ▼
External APIs
    │
    ▼
Response
```

### Memory System Flow

```
Request
    │
    ▼
Initialize Memory (Generate Fingerprints)
    │
    ├──► Load User Preferences
    ├──► Check Previous Ideas
    └──► Load Theme Coverage
    │
    ▼
Merge Memory Data
    │
    ├──► Check Duplicate (7-day window)
    ├──► Build Account Object
    └──► Determine should_generate
    │
    ▼
Output
```

### Publishing Flow

```
Content
    │
    ▼
Publishing Hub
    │
    ├──► Prepare Tasks (one per channel)
    │
    ├──► Route by Channel
    │    │
    │    ├──► Twitter Publisher
    │    ├──► LinkedIn Publisher
    │    ├──► Mastodon Publisher
    │    └──► Newsletter Sender
    │
    ▼
Aggregate Results
    │
    ▼
Response
```

## Component Relationships

### Core Modules

**Content Generation Core**
- **Input**: Keyword, topics, organization type, region
- **Output**: Generated content ideas
- **Dependencies**: OpenAI API
- **Used By**: All user workflows

**Content Enhancement**
- **Input**: Content ideas
- **Output**: Enhanced ideas (summaries, headlines, sentiment, fact-check)
- **Dependencies**: OpenAI API, Content Generation Core
- **Used By**: All user workflows

**Translation Module**
- **Input**: Content ideas, target language
- **Output**: Translated ideas
- **Dependencies**: DeepL API, Content Generation Core
- **Used By**: Organization workflow

**Memory System**
- **Input**: User ID, keyword, topics, region
- **Output**: User preferences, duplicate status, theme coverage
- **Dependencies**: Supabase
- **Used By**: All user workflows

**Publishing Hub**
- **Input**: Content, channels array
- **Output**: Publishing results
- **Dependencies**: Channel publishers
- **Used By**: Journalist, Politician workflows

### User Workflows

**Journalist Workflow**
- Uses: Memory System, Content Generation, Content Enhancement, Publishing Hub
- Features: Fact-check filtering, multi-channel publishing
- Output: Published content

**Politician Workflow**
- Uses: Memory System, Content Generation, Content Enhancement, Content Scheduler
- Features: Sentiment filtering, scheduling
- Output: Scheduled or ready content

**Agency Workflow**
- Uses: Memory System, Content Generation, Content Enhancement
- Features: Approval workflow
- Output: Approval URL

**Organization Workflow**
- Uses: Memory System, Content Generation, Content Enhancement, Translation, Newsletter
- Features: Multi-language, newsletter
- Output: Translated content, newsletter sent

### Channel Publishers

**Twitter Publisher**
- Input: Content (max 280 chars)
- Output: Tweet ID, URL
- API: Twitter API v2

**LinkedIn Publisher**
- Input: Content (max 3000 chars), visibility
- Output: Post ID
- API: LinkedIn UGC Posts API

**Mastodon Publisher**
- Input: Content (max 500 chars), visibility
- Output: Status ID, URL
- API: Mastodon REST API

**Newsletter Sender**
- Input: Content, subject, list ID, provider
- Output: Campaign ID (Mailchimp) or success (SendGrid)
- APIs: Mailchimp API, SendGrid API

## Execution Patterns

### Sequential Execution
Most workflows execute sequentially:
```
Step 1 → Step 2 → Step 3 → ...
```

### Parallel Execution
Some steps run in parallel:
```
Step 1
  ├──► Step 2a
  ├──► Step 2b
  ├──► Step 2c
  └──► Step 2d
      │
      ▼
  Step 3 (Merge)
```

Examples:
- Content Enhancement (4 parallel AI calls)
- Memory System (3 parallel Supabase queries)
- Publishing Hub (multiple channels in parallel)

### Conditional Execution
Workflows use conditions:
```
Step 1
  │
  ├──► [Condition True] → Step 2a
  └──► [Condition False] → Step 2b
```

Examples:
- Should Generate? (duplicate check)
- Check Schedule (scheduling decision)
- Route by Channel (channel selection)

## Data Structures

### Content Idea Structure
```json
{
  "id": 1,
  "hook": "Engaging title",
  "format": "Talking Head",
  "concept": "Detailed description",
  "beats": ["Introduction", "Main", "Conclusion"],
  "onScreenText": ["FACTS", "DATA"],
  "caption": "Social caption #hashtags",
  "CTA": "Call to action",
  "stitchOrDuet": "Standalone",
  "safetyNotes": ["Notes"],
  "saveValue": "Value proposition",
  "sourcePrompts": ["Sources"],
  "summary": "Full summary",
  "tldr": "TL;DR",
  "headlines": {
    "clickbait": "...",
    "neutral": "...",
    "formal": "..."
  },
  "sentiment": "positive",
  "stance": "Description",
  "sentiment_confidence": 0.85,
  "factCheckPrompts": ["..."],
  "verificationSources": ["..."]
}
```

### User Account Structure
```json
{
  "niche": "Content niche",
  "redLines": ["no hate", "no doxxing"],
  "preferredFormats": ["Talking Head", "Green Screen"],
  "targetAudience": "Target audience",
  "tone": "Professional tone",
  "brandWords": ["word1", "word2"],
  "language": "hu-HU"
}
```

### Publishing Result Structure
```json
{
  "success": true,
  "channel": "twitter",
  "id": "123456",
  "url": "https://...",
  "timestamp": "2024-01-01T12:00:00Z",
  "errors": null
}
```

## Error Handling

### Levels of Error Handling

1. **Node Level**: Each node handles its own errors
2. **Workflow Level**: Workflows check success flags
3. **System Level**: n8n execution logs

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": {...},
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Common Error Scenarios

1. **API Failures**: Credential issues, rate limits, network errors
2. **Data Format Errors**: Missing fields, wrong types
3. **Workflow Not Found**: Execute Workflow node issues
4. **Variable Missing**: Required n8n variables not set

## Performance Considerations

### Optimization Strategies

1. **Parallel Processing**: Use parallel branches where possible
2. **Caching**: Memory System caches user preferences
3. **Batching**: Process multiple items together
4. **Lazy Loading**: Only load what's needed

### Execution Times

- **Content Generation**: 5-15 seconds (OpenAI API)
- **Content Enhancement**: 10-20 seconds (4 parallel calls)
- **Translation**: 2-5 seconds (DeepL API)
- **Memory System**: 1-3 seconds (3 parallel queries)
- **Publishing**: 1-5 seconds per channel

### Rate Limits

- **OpenAI**: Varies by tier
- **DeepL**: 500,000 chars/month (free tier)
- **Twitter**: 300 tweets/3 hours
- **LinkedIn**: 25 posts/day
- **Supabase**: Based on plan

## Security Considerations

### Credential Management
- All credentials stored in n8n credential store
- Never hardcode credentials
- Use n8n variables for sensitive data

### Data Privacy
- User data stored in Supabase
- API keys never exposed in responses
- Content filtered for sensitive information

### Access Control
- Webhook authentication (if needed)
- User ID validation
- Organization type restrictions

## Scalability

### Horizontal Scaling
- Multiple n8n instances
- Load balancing for webhooks
- Distributed execution

### Vertical Scaling
- Increase n8n resources
- Optimize workflow execution
- Cache frequently used data

### Database Scaling
- Supabase auto-scaling
- Index optimization
- Query optimization

## Monitoring & Logging

### Execution Logs
- n8n execution history
- Node-level logging
- Error tracking

### Metrics to Monitor
- Execution time
- Success/failure rates
- API usage
- Error frequency

### Alerts
- Failed executions
- API rate limit warnings
- Error threshold breaches

## Future Enhancements

### Planned Features
1. Analytics dashboard
2. A/B testing
3. Content templates
4. Advanced scheduling
5. Multi-user collaboration

### Architecture Improvements
1. Workflow versioning
2. Automated testing
3. Performance optimization
4. Enhanced error recovery
5. Workflow marketplace

