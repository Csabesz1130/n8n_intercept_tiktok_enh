# Channel Publishers Documentation

## Overview

Channel publishers are specialized workflows that handle publishing content to specific social media platforms. Each publisher formats content appropriately and handles platform-specific requirements.

## Twitter Publisher

**File:** `channels/twitter-publisher.json`

### Purpose
Publishes content to Twitter/X with proper formatting and character limits.

### How It Works

1. **Format for Twitter**: Truncates content to 280 characters
2. **Publish to Twitter**: Calls Twitter API v2
3. **Format Response**: Returns success/failure with tweet details

### Input Format
```json
{
  "content": "Your tweet content here",
  "media_url": "https://example.com/image.jpg" // Optional
}
```

### Output Format
```json
{
  "success": true,
  "tweetId": "1234567890",
  "tweetText": "Your tweet content here",
  "url": "https://twitter.com/i/web/status/1234567890",
  "timestamp": "2024-01-01T12:00:00Z",
  "errors": null
}
```

### Character Limits
- **Maximum**: 280 characters
- **Auto-truncation**: Content longer than 280 chars is truncated with "..."
- **Original length**: Included in response for reference

### Features
- Automatic character limit handling
- Media URL support (requires separate media upload)
- Error handling and reporting
- Tweet URL generation

### Requirements
- Twitter Bearer Token credential
- Twitter API v2 access

### Customization
- Modify character limit (currently 280)
- Add media upload functionality
- Add thread support for longer content
- Add reply/quote tweet support

### API Endpoint
```
POST https://api.twitter.com/2/tweets
```

---

## LinkedIn Publisher

**File:** `channels/linkedin-publisher.json`

### Purpose
Publishes professional content to LinkedIn with proper formatting.

### How It Works

1. **Format for LinkedIn**: Truncates to 3000 characters if needed
2. **Publish to LinkedIn**: Calls LinkedIn UGC Posts API
3. **Format Response**: Returns success/failure with post details

### Input Format
```json
{
  "content": "Your LinkedIn post content",
  "visibility": "PUBLIC" // or "CONNECTIONS"
}
```

### Output Format
```json
{
  "success": true,
  "postId": "urn:li:ugcPost:123456",
  "postText": "Your LinkedIn post content",
  "timestamp": "2024-01-01T12:00:00Z",
  "errors": null
}
```

### Character Limits
- **Maximum**: 3000 characters
- **Recommended**: 150-300 characters for engagement
- **Auto-truncation**: Content longer than 3000 chars is truncated

### Visibility Options
- `PUBLIC` - Visible to everyone
- `CONNECTIONS` - Visible to connections only

### Features
- Professional formatting
- Visibility control
- Error handling
- Post ID tracking

### Requirements
- LinkedIn OAuth2 credential
- LinkedIn Person URN (n8n variable: `LINKEDIN_PERSON_ID`)
- LinkedIn API access

### Customization
- Add article publishing
- Add image/video support
- Add company page posting
- Add engagement tracking

### API Endpoint
```
POST https://api.linkedin.com/v2/ugcPosts
```

---

## Mastodon Publisher

**File:** `channels/mastodon-publisher.json`

### Purpose
Publishes content to Mastodon instances with federation support.

### How It Works

1. **Format for Mastodon**: Truncates to 500 characters
2. **Publish to Mastodon**: Calls Mastodon API
3. **Format Response**: Returns success/failure with status details

### Input Format
```json
{
  "content": "Your Mastodon status",
  "visibility": "public" // public, unlisted, private, direct
}
```

### Output Format
```json
{
  "success": true,
  "statusId": "123456",
  "statusText": "Your Mastodon status",
  "url": "https://mastodon.instance/@user/123456",
  "timestamp": "2024-01-01T12:00:00Z",
  "errors": null
}
```

### Character Limits
- **Maximum**: 500 characters
- **Auto-truncation**: Content longer than 500 chars is truncated

### Visibility Options
- `public` - Visible to everyone, appears in public timelines
- `unlisted` - Visible to everyone, doesn't appear in public timelines
- `private` - Visible to followers only
- `direct` - Direct message to mentioned users

### Features
- Federation-aware publishing
- Multiple visibility options
- Status URL generation
- Error handling

### Requirements
- Mastodon Instance URL (n8n variable: `MASTODON_INSTANCE_URL`)
- Mastodon Access Token (n8n variable: `MASTODON_ACCESS_TOKEN`)

### Customization
- Add media attachments
- Add content warnings
- Add reply/boost support
- Add scheduled posting

### API Endpoint
```
POST {MASTODON_INSTANCE_URL}/api/v1/statuses
```

---

## Newsletter Sender

**File:** `channels/newsletter-sender.json`

### Purpose
Sends newsletters via Mailchimp or SendGrid email services.

### How It Works

1. **Format Newsletter**: Converts content to HTML if needed
2. **Check Provider**: Routes to Mailchimp or SendGrid
3. **Create/Send**: Creates campaign (Mailchimp) or sends email (SendGrid)
4. **Format Response**: Returns success/failure

### Input Format
```json
{
  "content": "Newsletter content (HTML or plain text)",
  "subject": "Newsletter Subject",
  "list_id": "mailchimp-list-id or sendgrid-email",
  "provider": "mailchimp" // or "sendgrid"
}
```

### Output Format
```json
{
  "success": true,
  "campaignId": "abc123", // Mailchimp only
  "subject": "Newsletter Subject",
  "provider": "mailchimp",
  "timestamp": "2024-01-01T12:00:00Z",
  "errors": null
}
```

### Provider: Mailchimp

**Features:**
- Campaign creation
- List management
- HTML content support
- Analytics tracking

**Requirements:**
- Mailchimp API Key (n8n variable: `MAILCHIMP_API_KEY`)
- Mailchimp API URL (n8n variable: `MAILCHIMP_API_URL`)
- Mailchimp List ID

**Process:**
1. Create campaign
2. Set content
3. Send campaign

### Provider: SendGrid

**Features:**
- Direct email sending
- HTML content support
- Template support
- Delivery tracking

**Requirements:**
- SendGrid API Key (n8n variable: `SENDGRID_API_KEY`)
- Recipient email address

**Process:**
1. Format email
2. Send via API

### Content Formatting
- Plain text: Auto-converted to HTML paragraphs
- HTML: Used as-is
- Images: Supported in HTML content
- Links: Supported in HTML content

### Customization
- Add template support
- Add personalization
- Add A/B testing
- Add scheduling
- Add unsubscribe handling

---

## Publisher Comparison

| Feature | Twitter | LinkedIn | Mastodon | Newsletter |
|---------|---------|----------|----------|-----------|
| Character Limit | 280 | 3000 | 500 | Unlimited |
| Media Support | ✅ | ❌ | ❌ | ✅ |
| Visibility Options | Public only | Public/Connections | 4 options | N/A |
| Threading | ❌ | ❌ | ❌ | N/A |
| Scheduling | Via scheduler | Via scheduler | Via scheduler | Via scheduler |
| Analytics | Basic | Advanced | Basic | Advanced |

## Best Practices

### Content Formatting

1. **Twitter**: Keep under 280 chars, use hashtags, include links
2. **LinkedIn**: 150-300 chars optimal, professional tone, no hashtag spam
3. **Mastodon**: Under 500 chars, use content warnings when needed
4. **Newsletter**: HTML formatted, clear subject, call-to-action

### Error Handling

All publishers include error handling:
- Check `success` field in response
- Review `errors` field for details
- Log failures for debugging
- Implement retry logic if needed

### Rate Limits

- **Twitter**: 300 tweets per 3 hours
- **LinkedIn**: 25 posts per day
- **Mastodon**: Varies by instance
- **Newsletter**: Varies by provider

### Testing

1. Test with short content first
2. Verify character limits
3. Check formatting
4. Test error scenarios
5. Verify credentials

## Integration Examples

### Using in User Workflows

```json
// In user workflow, call publisher:
{
  "content": "Generated content",
  "channel": "twitter"
}
```

### Using in Publishing Hub

Publishing Hub automatically routes to correct publisher based on channel name.

### Direct API Calls

You can also call publishers directly via webhook if configured.

## Troubleshooting

### Twitter Publishing Fails
- Check Bearer Token
- Verify API v2 access
- Check rate limits
- Verify content format

### LinkedIn Publishing Fails
- Check OAuth2 token
- Verify Person URN
- Check API permissions
- Verify content format

### Mastodon Publishing Fails
- Check instance URL
- Verify access token
- Check instance rules
- Verify content format

### Newsletter Sending Fails
- Check API keys
- Verify list ID/email
- Check content format
- Verify provider settings

