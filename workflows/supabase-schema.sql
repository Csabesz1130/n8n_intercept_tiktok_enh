-- Supabase Schema for Reminder System
-- Run this SQL in your Supabase SQL Editor

-- Table: channel_metrics
-- Stores engagement metrics for published posts
CREATE TABLE IF NOT EXISTS channel_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('twitter', 'linkedin', 'mastodon', 'newsletter')),
  timestamp TIMESTAMPTZ NOT NULL,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  engagement_score NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id, channel, timestamp)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_channel_metrics_user_id ON channel_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_metrics_channel ON channel_metrics(channel);
CREATE INDEX IF NOT EXISTS idx_channel_metrics_timestamp ON channel_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_channel_metrics_user_channel ON channel_metrics(user_id, channel);

-- Table: reminders
-- Stores scheduled reminders
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  reminder_id TEXT UNIQUE NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  reason TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'expired')),
  content_preview TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reminders
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_time ON reminders(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_user_status ON reminders(user_id, status);

-- Table: published_content
-- Tracks published content for analytics collection
CREATE TABLE IF NOT EXISTS published_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  content_id TEXT, -- Reference to generated_ideas.id
  published_at TIMESTAMPTZ NOT NULL,
  published BOOLEAN DEFAULT true,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id, channel)
);

-- Indexes for published_content
CREATE INDEX IF NOT EXISTS idx_published_content_user_id ON published_content(user_id);
CREATE INDEX IF NOT EXISTS idx_published_content_channel ON published_content(channel);
CREATE INDEX IF NOT EXISTS idx_published_content_published ON published_content(published, published_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_channel_metrics_updated_at
  BEFORE UPDATE ON channel_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View: user_engagement_summary
-- Summary of user engagement by channel
CREATE OR REPLACE VIEW user_engagement_summary AS
SELECT
  user_id,
  channel,
  COUNT(*) as total_posts,
  AVG(engagement_score) as avg_engagement,
  MAX(engagement_score) as max_engagement,
  SUM(likes) as total_likes,
  SUM(shares) as total_shares,
  SUM(views) as total_views,
  DATE_TRUNC('hour', timestamp) as hour_of_day,
  EXTRACT(DOW FROM timestamp) as day_of_week
FROM channel_metrics
GROUP BY user_id, channel, DATE_TRUNC('hour', timestamp), EXTRACT(DOW FROM timestamp);

-- View: upcoming_reminders
-- View of upcoming reminders for dashboard
CREATE OR REPLACE VIEW upcoming_reminders AS
SELECT
  r.*,
  u.email,
  u.notification_preferences
FROM reminders r
LEFT JOIN user_preferences u ON r.user_id = u.user_id
WHERE r.status = 'scheduled'
  AND r.scheduled_time > NOW()
ORDER BY r.scheduled_time ASC;

-- Row Level Security (RLS) Policies
-- Enable RLS
ALTER TABLE channel_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_content ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own metrics
CREATE POLICY "Users can view own channel_metrics"
  ON channel_metrics FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = current_setting('app.user_id', true));

-- Policy: Users can only see their own reminders
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = current_setting('app.user_id', true));

-- Policy: Users can only see their own published content
CREATE POLICY "Users can view own published_content"
  ON published_content FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = current_setting('app.user_id', true));

-- Grant permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE ON channel_metrics TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON reminders TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON published_content TO authenticated;

-- Comments for documentation
COMMENT ON TABLE channel_metrics IS 'Stores engagement metrics for published social media posts';
COMMENT ON TABLE reminders IS 'Stores scheduled reminder notifications for optimal posting times';
COMMENT ON TABLE published_content IS 'Tracks published content for analytics collection';
COMMENT ON VIEW user_engagement_summary IS 'Summary view of user engagement metrics by channel and time';
COMMENT ON VIEW upcoming_reminders IS 'View of upcoming scheduled reminders with user contact info';

