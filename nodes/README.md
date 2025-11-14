# Custom n8n Nodes

Custom nodes for publishing content to various social media platforms.

## Setup

1. **Install Dependencies**:
```bash
cd nodes
npm install
```

2. **Build TypeScript**:
```bash
npm run build
```

3. **Install in n8n**:
   - Copy the `dist/` folder to your n8n custom nodes directory
   - Or use npm link for development

## Available Nodes

- **TwitterNode** - Publish to Twitter/X
- **LinkedInNode** - Publish to LinkedIn
- **MastodonNode** - Publish to Mastodon
- **NewsletterNode** - Send newsletters via Mailchimp/SendGrid

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build
```

## Note

These nodes require the `n8n-workflow` package which is provided by n8n. For local development, install it:

```bash
npm install n8n-workflow@latest
```

