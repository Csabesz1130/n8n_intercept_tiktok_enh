# Trending Engine Documentation

## Overview

The Trending Engine continuously discovers, ranks, and surfaces the hottest topics across tech, politics, finance, culture, and more. It aggregates data from multiple sources, normalizes and categorizes topics using AI, and provides real-time access to trending content for instant content generation.

## System Architecture

```
Data Sources (4 APIs)
    ↓
Trending Collector (every 30 min)
    ↓
Raw Data Storage (source_raw)
    ↓
Trending Normaliser (every 35 min)
    ↓
AI Categorization & Scoring
    ↓
Trending Engine (every 40 min)
    ↓
Ranked Topics Storage (trending_topics)
    ↓
Get Trends Webhook
    ↓
Dashboard / Content Generation
```

## Components

### 1. Trending Collector (`utils/trending-collector.json`)

**Purpose**: Collects raw trending data from 4 sources every 30 minutes

**Data Sources**:

1. **Google Trends** (SerpAPI)
   - Global and regional trending searches
   - Time-series data
   - Requires: `SERPAPI_KEY` (optional)

2. **Twitter API v2**
   - Real-time hashtag volume
   - Tweet engagement metrics
   - Requires: `TWITTER_BEARER_TOKEN` (optional)

3. **Reddit**
   - Top posts from r/all
   - Upvote scores
   - Free (rate-limited)

4. **NewsAPI**
   - Breaking headlines
   - Politics and finance focus
   - Requires: `NEWSAPI_KEY` (optional)

**How It Works**:

1. **Cron Trigger**: Fires every 30 minutes
2. **Parallel API Calls**: Calls all 4 sources simultaneously
3. **Data Processing**: Extracts topics/hashtags from each source
4. **Raw Storage**: Stores complete JSON payloads in `source_raw` table

**Output**: Stores raw data with metadata (source, region, topic_count)

### 2. Trending Normaliser (`core/trending-normaliser.json`)

**Purpose**: Deduplicates, normalizes, and categorizes topics

**How It Works**:

1. **Load Raw Data**: Fetches recent raw data from `source_raw`
2. **Normalize Topics**: 
   - Lowercase, trim, remove special chars
   - Create normalized version for deduplication
3. **Group by Normalized**: Merge topics from multiple sources
4. **AI Categorization**: Uses OpenAI to classify:
   - Category: tech, politics, finance, culture, sports, health, other
   - Popularity score: 0-100
5. **Calculate Metrics**:
   - Velocity: Based on source_count (0-100)
   - Final Score: Weighted average (popularity 60%, velocity 40%)

**Output**: Normalized topics with categories and scores

### 3. Trending Engine (`core/trending-engine.json`)

**Purpose**: Ranks topics and stores top 100 per region/category

**How It Works**:

1. **Load Normalized Data**: Gets processed topics from normaliser
2. **Rank Topics**: 
   - Group by category and region
   - Sort by: score → velocity → source_count
   - Keep top 100 per group
3. **Upsert to Database**: Uses `upsert_trending_topic` function
   - Merges if topic exists
   - Updates score, velocity, last_seen
   - Tracks sources

**Output**: Stores ranked topics in `trending_topics` table

### 4. Get Trends Webhook (`webhooks/get-trends.json`)

**Purpose**: API endpoint to retrieve trending topics

**Query Parameters**:
- `category`: Filter by category (tech, politics, etc.)
- `region`: Filter by region (default: global)
- `limit`: Max results (default: 50, max: 100)
- `min_score`: Minimum score (0-100)

**Example**:
```
GET /webhook/get-trends?category=tech&region=US&limit=20&min_score=70
```

**Response**:
```json
{
  "success": true,
  "count": 20,
  "filters": {
    "category": "tech",
    "region": "US",
    "min_score": 70
  },
  "trends": [
    {
      "id": "uuid",
      "topic": "AI breakthrough",
      "category": "tech",
      "region": "US",
      "score": 92,
      "velocity": 85.5,
      "popularity": 88,
      "temperature": "hot",
      "source_count": 3,
      "sources": ["google_trends", "twitter", "reddit"],
      "first_seen": "2024-12-25T10:00:00Z",
      "last_seen": "2024-12-25T11:30:00Z",
      "metadata": {}
    }
  ],
  "timestamp": "2024-12-25T12:00:00Z"
}
```

### 5. Dashboard Integration

**New "Trends" Tab**:

- **Live Feed**: Real-time trending topics
- **Category Filters**: All, Tech, Politics, Finance, Culture, Sports, Health, Other
- **Trend Cards**: Display topic, score, velocity, sources, temperature
- **Generate Content**: One-click button to generate content from trend
- **Auto-refresh**: Updates every 30 seconds

**Features**:
- Visual temperature indicators (🔥 hot, 🌡️ warm, ❄️ cool)
- Score-based color coding
- Source tags
- Region display
- Direct content generation integration

## Database Schema

### source_raw Table

Stores raw JSON payloads from data sources:

```sql
CREATE TABLE source_raw (
  id UUID PRIMARY KEY,
  source TEXT NOT NULL, -- 'google_trends', 'twitter', 'reddit', 'newsapi'
  payload JSONB NOT NULL,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  region TEXT DEFAULT 'global',
  metadata JSONB DEFAULT '{}'
);
```

### trending_topics Table

Stores normalized and ranked trending topics:

```sql
CREATE TABLE trending_topics (
  id UUID PRIMARY KEY,
  topic TEXT NOT NULL,
  normalized_topic TEXT NOT NULL, -- For deduplication
  category TEXT NOT NULL, -- 'tech', 'politics', 'finance', etc.
  region TEXT NOT NULL DEFAULT 'global',
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  velocity NUMERIC(10, 2) DEFAULT 0,
  popularity NUMERIC(10, 2) DEFAULT 0,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  source_count INTEGER DEFAULT 1,
  sources TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}',
  UNIQUE(normalized_topic, region, category)
);
```

### Views

- **trending_topics_live**: Topics from last 24 hours with temperature
- **trending_by_category**: Grouped by category and region

### Functions

- **upsert_trending_topic**: Upserts topic, merging if exists

See `workflows/supabase-trending-schema.sql` for complete schema.

## Usage Flow

### 1. Automatic Collection

Trending Collector runs every 30 minutes:
- Fetches data from 4 sources
- Stores raw JSON in `source_raw`

### 2. Normalization

Trending Normaliser runs every 35 minutes:
- Processes raw data
- Deduplicates topics
- AI categorizes and scores
- Outputs normalized topics

### 3. Ranking

Trending Engine runs every 40 minutes:
- Ranks normalized topics
- Stores top 100 per category/region
- Updates existing topics

### 4. Access Trends

**Via Webhook**:
```bash
curl "https://your-n8n.com/webhook/get-trends?category=tech&limit=10"
```

**Via Dashboard**:
- Open "Trends" tab
- Filter by category
- Click "Generate Content" on any trend

### 5. Generate Content

Clicking "Generate Content" on a trend:
- Pre-fills content generation webhook with trend topic
- Triggers existing content generation workflow
- Returns to "Content Ideas" tab with generated ideas

## Configuration

### Required Variables

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

### Optional Variables (for full functionality)

- `SERPAPI_KEY` - Google Trends API (SerpAPI)
- `TWITTER_BEARER_TOKEN` - Twitter API v2
- `NEWSAPI_KEY` - NewsAPI key
- Reddit API is free (no key needed, but rate-limited)

### Required Credentials

- **OpenAI API** - For AI categorization

## Customization

### Adjust Collection Frequency

Edit cron expressions:
- Collector: `*/30 * * * *` (every 30 min)
- Normaliser: `*/35 * * * *` (every 35 min)
- Engine: `*/40 * * * *` (every 40 min)

### Modify Scoring Formula

Edit `Calculate Scores` node in `trending-normaliser.json`:

```javascript
// Current: popularity 60%, velocity 40%
const score = Math.round((popularity * 0.6) + (velocity * 0.4));

// Customize weights:
const score = Math.round((popularity * 0.7) + (velocity * 0.3));
```

### Add Data Sources

1. Add API call node in `trending-collector.json`
2. Add processing node
3. Update `source_raw` table source enum
4. Update normaliser to handle new source format

### Custom Categories

Edit AI prompt in `trending-normaliser.json` to add/remove categories.

## Performance Considerations

### Rate Limiting

- **Reddit**: 60 requests/minute (free tier)
- **Twitter**: Rate limits based on plan
- **NewsAPI**: 100 requests/day (free tier)
- **SerpAPI**: Based on plan

### Database Optimization

- Indexes on `category`, `region`, `score`, `last_seen`
- Partitioning by date (for large scale)
- Archival of old `source_raw` data

### Caching

- Dashboard caches trends for 30 seconds
- Webhook responses can be cached
- Consider Redis for high-traffic scenarios

## Troubleshooting

### No Trends Collected

**Possible Causes**:
- API keys missing or invalid
- Rate limits exceeded
- Network issues

**Solutions**:
- Check API keys in n8n variables
- Review collector execution logs
- Verify API quotas

### Topics Not Categorizing

**Possible Causes**:
- OpenAI API issues
- Invalid topic format
- AI prompt too strict

**Solutions**:
- Check OpenAI credentials
- Review normaliser logs
- Adjust AI prompt

### Low Scores

**Possible Causes**:
- Insufficient source coverage
- Velocity calculation issues
- Popularity scoring too conservative

**Solutions**:
- Ensure multiple sources active
- Review scoring formula
- Adjust AI popularity estimation

## Integration Examples

### Generate Content from Trend

```javascript
// In dashboard
const handleGenerateFromTrend = async (trend) => {
  const response = await axios.post(N8N_WEBHOOK, {
    keyword: trend.topic,
    topics: [trend.topic],
    region: trend.region,
    channels: ['twitter']
  });
  // Handle response
};
```

### Filter Trends by Category

```bash
# Get tech trends
GET /webhook/get-trends?category=tech&limit=20

# Get politics trends in US
GET /webhook/get-trends?category=politics&region=US&min_score=80
```

### Monitor Hot Trends

```sql
-- Get hottest trends (score > 90, last hour)
SELECT * FROM trending_topics_live
WHERE score > 90
  AND last_seen > NOW() - INTERVAL '1 hour'
ORDER BY score DESC;
```

## Future Enhancements

1. **Real-time WebSockets**: Push new trends to dashboard
2. **Trend Alerts**: Notify users of breaking trends
3. **Trend Prediction**: ML model to predict viral topics
4. **Multi-language**: Support for non-English trends
5. **Sentiment Analysis**: Track positive/negative trends
6. **Competitor Tracking**: Monitor competitor mentions
7. **Historical Analysis**: Trend lifecycle tracking

## API Endpoints

### Get Trends

```bash
GET /webhook/get-trends
Query: ?category=tech&region=US&limit=20&min_score=70
```

### Get Trends by Category

```bash
GET /webhook/get-trends?category=politics
```

### Get Hot Trends

```bash
GET /webhook/get-trends?min_score=90&limit=10
```

## Best Practices

1. **Monitor API Quotas**: Track usage to avoid rate limits
2. **Error Handling**: Gracefully handle API failures
3. **Data Quality**: Filter out spam/low-quality topics
4. **Privacy**: Don't store PII in raw data
5. **Performance**: Index database properly
6. **Backup**: Archive old raw data periodically

---

**Last Updated**: 2024-01-01
**Version**: 1.0.0

