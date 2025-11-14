# Core Modules Documentation

## Overview

Core modules are reusable workflow components that provide fundamental functionality. They are designed to be called by other workflows using n8n's "Execute Workflow" node.

## Content Generation Core

**File:** `core/content-generation-core.json`

### Purpose
Generates AI-powered content ideas based on keywords, topics, and context.

### How It Works

1. **Input Processing**: Receives keyword, topics, organization type, and region
2. **Prompt Building**: Creates system and user prompts optimized for the target audience
3. **AI Generation**: Calls OpenAI GPT model to generate content ideas
4. **Extraction**: Parses AI response and extracts structured ideas

### Input Format
```json
{
  "keyword": "main topic",
  "topics": ["#hashtag1", "#hashtag2"],
  "organization_type": "journalist|politician|agency|organization",
  "region": "HU|US|EU",
  "account": {
    "niche": "content niche",
    "tone": "professional tone",
    "targetAudience": "target audience"
  },
  "samplePosts": [],
  "topTags": []
}
```

### Output Format
```json
{
  "ideas": [
    {
      "id": 1,
      "hook": "Engaging title",
      "format": "Talking Head",
      "concept": "Detailed concept description",
      "beats": ["Introduction", "Main points", "Conclusion"],
      "onScreenText": ["FACTS", "DATA"],
      "caption": "Social media caption #hashtags",
      "CTA": "Call to action",
      "stitchOrDuet": "Standalone",
      "safetyNotes": ["Safety considerations"],
      "saveValue": "Why this is valuable",
      "sourcePrompts": ["Recommended sources"]
    }
  ],
  "ideas_count": 5,
  "extraction_successful": true
}
```

### Customization
- Modify the "Build Prompts" node to change AI behavior
- Adjust system prompt for different content styles
- Change model in "Generate Content Ideas" node (gpt-4o-mini, gpt-4, etc.)

### Dependencies
- OpenAI API credential
- n8n variable: `OPENAI_API_KEY` (if using credential)

---

## Content Enhancement

**File:** `core/content-enhancement.json`

### Purpose
Enhances generated content ideas with summaries, headlines, sentiment analysis, and fact-check prompts.

### How It Works

1. **Split Ideas**: Separates ideas for parallel processing
2. **Parallel Enhancement**: Runs 4 AI processes simultaneously:
   - Generate summaries and TL;DR
   - Create headline variations (clickbait, neutral, formal)
   - Analyze sentiment and political stance
   - Generate fact-check prompts
3. **Merge Results**: Combines all enhancements into original ideas

### Input Format
```json
{
  "ideas": [
    {
      "id": 1,
      "hook": "...",
      "concept": "..."
    }
  ]
}
```

### Output Format
```json
{
  "ideas": [
    {
      "id": 1,
      "hook": "...",
      "summary": "Full summary",
      "tldr": "Short TL;DR",
      "headlines": {
        "clickbait": "Clickbait headline",
        "neutral": "Neutral headline",
        "formal": "Formal headline"
      },
      "sentiment": "positive|neutral|negative",
      "stance": "Political stance description",
      "sentiment_confidence": 0.85,
      "factCheckPrompts": ["Prompt 1", "Prompt 2"],
      "verificationSources": ["Source 1", "Source 2"]
    }
  ],
  "ideas_count": 5,
  "enhancement_complete": true
}
```

### Processing Flow
```
Split Ideas → [Summary, Headlines, Sentiment, Fact-Check] → Merge
```

### Customization
- Modify individual AI prompts in each enhancement node
- Add new enhancement types by duplicating nodes
- Adjust confidence thresholds for sentiment filtering

### Dependencies
- OpenAI API credential
- Content ideas from Content Generation Core

---

## Translation Module

**File:** `core/translation-module.json`

### Purpose
Translates content ideas to target languages using DeepL API.

### How It Works

1. **Prepare Translation**: Extracts translatable content (hook, concept, caption, CTA)
2. **DeepL API Call**: Sends content to DeepL for translation
3. **Merge Translations**: Combines translated content back into ideas

### Input Format
```json
{
  "ideas": [
    {
      "id": 1,
      "hook": "Hungarian text",
      "concept": "Hungarian concept",
      "caption": "Hungarian caption"
    }
  ],
  "target_language": "EN|DE|FR|ES",
  "source_language": "HU"
}
```

### Output Format
```json
{
  "ideas": [
    {
      "id": 1,
      "hook": "Original Hungarian",
      "hook_translated": "Translated English",
      "concept_translated": "Translated concept",
      "caption_translated": "Translated caption",
      "translated": true
    }
  ],
  "translation_complete": true,
  "target_language": "EN"
}
```

### Supported Languages
- EN (English)
- DE (German)
- FR (French)
- ES (Spanish)
- HU (Hungarian)
- And all DeepL-supported languages

### Customization
- Change target language in input
- Modify which fields are translated in "Prepare Translation" node
- Add fallback for failed translations

### Dependencies
- DeepL API key (n8n variable: `DEEPL_API_KEY`)
- Content ideas from Content Generation Core

---

## Memory System

**File:** `core/memory-system.json`

### Purpose
Manages user preferences, duplicate detection, and theme tracking using Supabase.

### How It Works

1. **Initialize Memory**: Generates fingerprints for duplicate detection
2. **Load Data**: Fetches user preferences, previous ideas, and theme coverage in parallel
3. **Merge Memory**: Combines all data and determines if new content should be generated

### Input Format
```json
{
  "user_id": "user-123",
  "keyword": "topic",
  "topics": ["#hashtag"],
  "region": "HU",
  "organization_type": "journalist"
}
```

### Output Format
```json
{
  "user_id": "user-123",
  "keyword": "topic",
  "topics": ["#hashtag"],
  "region": "HU",
  "organization_type": "journalist",
  "request_fingerprint": "sha1-hash",
  "combined_fingerprint": "sha1-hash",
  "account": {
    "niche": "content niche",
    "redLines": ["no hate", "no doxxing"],
    "preferredFormats": ["Talking Head"],
    "targetAudience": "target audience",
    "tone": "professional",
    "brandWords": ["word1", "word2"],
    "language": "hu-HU"
  },
  "duplicate": false,
  "previous_ideas_count": 0,
  "theme_coverage_count": 5,
  "should_generate": true
}
```

### Duplicate Detection
- Checks if similar content was generated in last 7 days
- Uses SHA1 hash of request parameters
- Prevents redundant content generation

### Theme Tracking
- Tracks which themes/topics user has covered
- Helps avoid over-saturation of specific topics
- Provides recommendations for new content

### Customization
- Adjust duplicate detection window (currently 7 days)
- Modify fingerprint algorithm
- Add custom user preference fields

### Dependencies
- Supabase (n8n variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`)
- Database tables: `user_preferences`, `generated_ideas`, `theme_coverage`

---

## Publishing Hub

**File:** `core/publishing-hub.json`

### Purpose
Coordinates multi-channel publishing by routing content to appropriate channel workflows.

### How It Works

1. **Prepare Tasks**: Creates publishing tasks for each selected channel
2. **Route by Channel**: Uses Switch node to route to correct publisher
3. **Execute Publishers**: Calls channel-specific workflows in parallel
4. **Aggregate Results**: Combines all publishing results

### Input Format
```json
{
  "content": "Content to publish",
  "channels": ["twitter", "linkedin", "mastodon", "newsletter"]
}
```

### Output Format
```json
{
  "results": [
    {
      "success": true,
      "tweetId": "123456",
      "channel": "twitter"
    },
    {
      "success": true,
      "postId": "789012",
      "channel": "linkedin"
    }
  ],
  "success_count": 2,
  "total_count": 2,
  "all_successful": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Supported Channels
- `twitter` - Twitter/X
- `linkedin` - LinkedIn
- `mastodon` - Mastodon
- `newsletter` - Mailchimp/SendGrid

### Customization
- Add new channels by extending Switch node
- Modify content formatting per channel
- Add retry logic for failed publishes

### Dependencies
- Channel publisher workflows (Twitter, LinkedIn, Mastodon, Newsletter)
- Channel-specific credentials

---

## Best Practices

### Using Core Modules

1. **Always import core modules first** before importing workflows that use them
2. **Link workflows** using Execute Workflow nodes after import
3. **Test individually** before combining with other workflows
4. **Monitor execution** to understand data flow

### Error Handling

- Core modules include error handling
- Check `extraction_successful`, `enhancement_complete` flags
- Handle empty arrays gracefully
- Log errors for debugging

### Performance

- Content Enhancement runs in parallel (faster)
- Translation can be skipped if not needed
- Memory System caches user preferences
- Publishing Hub runs channels in parallel

### Extending Core Modules

1. Copy the workflow
2. Modify nodes as needed
3. Update documentation node
4. Test thoroughly
5. Update dependent workflows if interface changes

