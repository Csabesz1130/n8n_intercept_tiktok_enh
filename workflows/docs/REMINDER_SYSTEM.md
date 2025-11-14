# Smart Reminder System Documentation

## Overview

The Smart Reminder System helps users maximize content reach by analyzing historical engagement data and global peak times to recommend optimal posting times. Users receive timely reminders when it's best to share their content.

## System Architecture

```
Content Generation
    ↓
Reminder Engine (analyzes & recommends)
    ↓
Reminder Scheduler (schedules notifications)
    ↓
Send Reminder (sends email/Slack)
    ↓
User acts → Publish
```

## Components

### 1. Reminder Engine (`core/reminder-engine.json`)

**Purpose**: Analyzes data and recommends optimal posting times

**How It Works**:

1. **Load Historical Metrics**: Fetches past engagement data from Supabase
2. **Analyze Patterns**: Identifies peak engagement hours and days
3. **Get Global Peaks**: Retrieves industry-standard peak times by region/channel
4. **AI Recommendation**: Uses OpenAI to synthesize recommendations
5. **Format Output**: Returns top 3 optimal posting times with scores

**Input**:
```json
{
  "user_id": "user-123",
  "content": {...},
  "channels": ["twitter", "linkedin"],
  "region": "HU"
}
```

**Output**:
```json
{
  "recommendations": [
    {
      "time": "2024-12-25T10:00:00Z",
      "channel": "twitter",
      "score": 92,
      "reason": "Peak engagement hour based on 150 historical posts"
    },
    {
      "time": "2024-12-25T18:00:00Z",
      "channel": "linkedin",
      "score": 88,
      "reason": "Optimal time for professional audience"
    }
  ],
  "analysis": {
    "historical": {...},
    "global": {...}
  }
}
```

**Features**:
- Historical engagement analysis
- Global peak time integration
- AI-powered time slot ranking
- Multi-channel support
- Region-specific optimization

### 2. Analytics Collector (`utils/analytics-collector.json`)

**Purpose**: Collects engagement metrics from social media APIs nightly

**Schedule**: Runs daily at 2 AM (configurable via cron)

**How It Works**:

1. **Trigger**: Cron job fires daily
2. **Get Published Posts**: Fetches all published content from Supabase
3. **Fetch Metrics**: Calls social media APIs for each post:
   - Twitter API v2: `/2/tweets/:id`
   - LinkedIn API: `/v2/ugcPosts/:id`
   - Mastodon API: `/api/v1/statuses/:id`
4. **Calculate Engagement**: Computes engagement score
5. **Store Metrics**: Saves to `channel_metrics` table

**Engagement Score Formula**:
```
score = (likes × 1) + (shares × 2) + (comments × 1.5) + (views × 0.1)
```

**Output**: Stores metrics in Supabase for historical analysis

### 3. Reminder Scheduler (`utils/reminder-scheduler.json`)

**Purpose**: Schedules reminder notifications using BullMQ

**How It Works**:

1. **Receive Recommendations**: Gets optimal times from Reminder Engine
2. **Split into Jobs**: Creates individual reminder jobs
3. **Schedule via BullMQ**: Uses scheduler service to queue reminders
4. **Store in Supabase**: Saves reminder records for tracking
5. **Respond**: Returns scheduled reminder details

**Input**:
```json
{
  "recommendations": [
    {
      "time": "2024-12-25T10:00:00Z",
      "channel": "twitter",
      "score": 92,
      "reason": "..."
    }
  ],
  "user_id": "user-123",
  "content": {...}
}
```

**Output**:
```json
{
  "reminders_scheduled": 3,
  "scheduled_reminders": [
    {
      "jobId": "job-123",
      "scheduledTime": "2024-12-25T10:00:00Z",
      "channel": "twitter",
      "score": 92
    }
  ]
}
```

### 4. Send Reminder (`webhooks/send-reminder.json`)

**Purpose**: Sends reminder notifications when optimal time arrives

**How It Works**:

1. **Triggered by Scheduler**: Called by BullMQ worker at scheduled time
2. **Get User Contact**: Fetches user email and preferences
3. **Format Email**: Creates HTML email with reminder details
4. **Send Notifications**: 
   - Email via Gmail
   - Slack (optional)
5. **Update Status**: Marks reminder as "sent" in Supabase

**Email Content**:
- Content preview
- Optimal posting time
- Engagement score
- Reason for recommendation
- Link to dashboard

**Channels**:
- **Email**: Gmail OAuth2
- **Slack**: Webhook URL (optional)
- **Push**: OneSignal (future enhancement)

## Database Schema

### channel_metrics Table

Stores engagement metrics for published posts:

```sql
CREATE TABLE channel_metrics (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  engagement_score NUMERIC(10, 2) DEFAULT 0
);
```

### reminders Table

Stores scheduled reminders:

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  reminder_id TEXT UNIQUE NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  reason TEXT,
  status TEXT DEFAULT 'scheduled',
  sent_at TIMESTAMPTZ
);
```

See `workflows/supabase-schema.sql` for complete schema.

## Usage Flow

### 1. Generate Content

User generates content ideas via workflow.

### 2. Get Reminders

After content generation, call Reminder Engine:

```bash
POST /webhook/reminder-engine
{
  "user_id": "user-123",
  "content": {...},
  "channels": ["twitter"],
  "region": "HU"
}
```

### 3. Schedule Reminders

Reminder Scheduler creates jobs for each recommendation:

```bash
POST /webhook/schedule-reminder
{
  "recommendations": [...],
  "user_id": "user-123",
  "content": {...}
}
```

### 4. Receive Reminder

At optimal time, user receives:
- Email notification
- Slack message (if configured)
- Dashboard notification

### 5. User Acts

User can:
- Publish immediately
- Reschedule
- Dismiss reminder

## Dashboard Integration

The dashboard includes a **Reminders** tab showing:

1. **Engagement Heatmap**: Visual representation of optimal posting hours
2. **Upcoming Reminders**: List of scheduled reminders
3. **Get Optimal Times**: Button to trigger reminder analysis

### Features

- **Heatmap**: Shows engagement patterns by hour
- **Score Display**: Visual score indicators (0-100)
- **Time Remaining**: Countdown to posting time
- **Quick Actions**: Publish, reschedule, dismiss

## Configuration

### Required Variables

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SCHEDULER_URL` - Scheduler service URL (default: http://localhost:3001)
- `N8N_WEBHOOK_URL` - Base n8n webhook URL
- `SLACK_WEBHOOK_URL` - Slack webhook (optional)
- `DASHBOARD_URL` - Dashboard URL for email links

### Required Credentials

- **OpenAI API** - For AI time recommendations
- **Gmail OAuth2** - For email reminders
- **Social Media APIs** - For analytics collection (Twitter, LinkedIn, Mastodon)

## Customization

### Adjust Peak Times

Edit `Get Global Peak Times` node in `reminder-engine.json` to modify:
- Channel-specific peak hours
- Region-specific adjustments
- Day-of-week preferences

### Modify Engagement Formula

Edit `Fetch Metrics from APIs` node in `analytics-collector.json`:

```javascript
metric.engagement_score = 
  (metric.likes || 0) * 1 +
  (metric.shares || 0) * 2 +
  (metric.comments || 0) * 1.5 +
  (metric.views || 0) * 0.1;
```

### Change Reminder Frequency

Edit cron expression in `analytics-collector.json`:
- Current: `0 2 * * *` (2 AM daily)
- Change to: `0 */6 * * *` (every 6 hours)

### Add Notification Channels

Extend `send-reminder.json` to add:
- MS Teams webhook
- Discord webhook
- SMS via Twilio
- Push notifications

## Best Practices

### 1. Historical Data

- Collect metrics for at least 2 weeks before relying on historical analysis
- Use global peak times as fallback for new users

### 2. Reminder Timing

- Send reminders 15-30 minutes before optimal time
- Allow user time to review and prepare

### 3. Score Thresholds

- Only recommend times with score > 70
- Filter out times in user's quiet hours

### 4. User Preferences

- Allow users to set quiet hours
- Respect timezone preferences
- Enable/disable reminders per channel

## Troubleshooting

### No Recommendations Generated

**Possible Causes**:
- Insufficient historical data
- API errors in Reminder Engine
- Missing user preferences

**Solutions**:
- Check Supabase for historical metrics
- Review Reminder Engine execution logs
- Verify OpenAI API key

### Reminders Not Sending

**Possible Causes**:
- Scheduler service not running
- Redis connection issues
- Webhook URL incorrect

**Solutions**:
- Verify scheduler is running: http://localhost:3001/health
- Check Redis connection
- Verify `N8N_WEBHOOK_URL` variable

### Email Not Received

**Possible Causes**:
- Gmail credential issues
- Email in spam folder
- User email not in database

**Solutions**:
- Re-authenticate Gmail OAuth2
- Check spam folder
- Verify user email in Supabase

## Performance Considerations

### Analytics Collection

- Runs nightly to avoid API rate limits
- Processes posts in batches
- Caches results in Supabase

### Reminder Engine

- Caches historical analysis (24h TTL)
- Uses AI only when sufficient data available
- Falls back to global peaks for new users

### Scaling

- Use Redis for distributed reminder queue
- Batch email sending
- Rate limit API calls

## Future Enhancements

1. **Real-time Trend Spikes**: Integrate trending scraper for immediate opportunities
2. **A/B Testing**: Test different posting times
3. **Auto-publish**: Option to auto-publish if user doesn't act
4. **Multi-timezone**: Support for global audiences
5. **ML Models**: Train custom models on user's data
6. **Competitor Analysis**: Analyze competitor posting times

## API Endpoints

### Get Reminders

```bash
GET /api/reminders?user_id=user-123
```

### Schedule Reminder

```bash
POST /api/schedule-reminder
{
  "recommendations": [...],
  "user_id": "user-123"
}
```

### Cancel Reminder

```bash
DELETE /api/reminders/:reminderId
```

## Examples

### Example Recommendation

```json
{
  "time": "2024-12-25T10:00:00Z",
  "channel": "twitter",
  "score": 92,
  "reason": "Peak engagement hour (10 AM) based on analysis of 150 historical posts. Your audience is most active at this time, with average engagement 3.2x higher than other hours."
}
```

### Example Reminder Email

Subject: ⏰ Reminder: Time to post on twitter!

Body includes:
- Content preview
- Optimal time (formatted)
- Engagement score
- Reason for recommendation
- Link to dashboard

## Integration with User Workflows

To add reminders to existing workflows:

1. After content generation, call Reminder Engine
2. Present recommendations to user
3. If accepted, call Reminder Scheduler
4. User receives reminders at optimal times

See updated user workflows for examples.

---

**Last Updated**: 2024-01-01
**Version**: 1.0.0

