-- Supabase Schema for Trending Engine
-- Run this SQL in your Supabase SQL Editor

-- Table: source_raw
-- Stores raw JSON payloads from different data sources
CREATE TABLE IF NOT EXISTS source_raw (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('google_trends', 'twitter', 'reddit', 'newsapi')),
  payload JSONB NOT NULL,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  region TEXT DEFAULT 'global',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for source_raw
CREATE INDEX IF NOT EXISTS idx_source_raw_source ON source_raw(source);
CREATE INDEX IF NOT EXISTS idx_source_raw_collected_at ON source_raw(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_raw_region ON source_raw(region);
CREATE INDEX IF NOT EXISTS idx_source_raw_source_collected ON source_raw(source, collected_at DESC);

-- Table: trending_topics
-- Stores normalized and ranked trending topics
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  normalized_topic TEXT NOT NULL, -- For deduplication
  category TEXT NOT NULL CHECK (category IN ('tech', 'politics', 'finance', 'culture', 'sports', 'health', 'other')),
  region TEXT NOT NULL DEFAULT 'global',
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  velocity NUMERIC(10, 2) DEFAULT 0, -- Rate of growth
  popularity NUMERIC(10, 2) DEFAULT 0, -- Current popularity
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  source_count INTEGER DEFAULT 1, -- Number of sources reporting this
  sources TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of source names
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data (hashtags, URLs, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(normalized_topic, region, category)
);

-- Indexes for trending_topics
CREATE INDEX IF NOT EXISTS idx_trending_topics_category ON trending_topics(category);
CREATE INDEX IF NOT EXISTS idx_trending_topics_region ON trending_topics(region);
CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON trending_topics(score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_last_seen ON trending_topics(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_category_region_score ON trending_topics(category, region, score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_normalized ON trending_topics(normalized_topic);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trending_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_trending_topics_updated_at
  BEFORE UPDATE ON trending_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_trending_updated_at();

-- View: trending_topics_live
-- Live view of current trending topics (last 24 hours)
CREATE OR REPLACE VIEW trending_topics_live AS
SELECT
  id,
  topic,
  normalized_topic,
  category,
  region,
  score,
  velocity,
  popularity,
  first_seen,
  last_seen,
  source_count,
  sources,
  metadata,
  CASE
    WHEN last_seen > NOW() - INTERVAL '1 hour' THEN 'hot'
    WHEN last_seen > NOW() - INTERVAL '6 hours' THEN 'warm'
    WHEN last_seen > NOW() - INTERVAL '24 hours' THEN 'cool'
    ELSE 'cold'
  END as temperature
FROM trending_topics
WHERE last_seen > NOW() - INTERVAL '24 hours'
ORDER BY score DESC, last_seen DESC;

-- View: trending_by_category
-- Trending topics grouped by category
CREATE OR REPLACE VIEW trending_by_category AS
SELECT
  category,
  region,
  COUNT(*) as topic_count,
  AVG(score) as avg_score,
  MAX(score) as max_score,
  ARRAY_AGG(topic ORDER BY score DESC LIMIT 10) as top_topics
FROM trending_topics
WHERE last_seen > NOW() - INTERVAL '24 hours'
GROUP BY category, region
ORDER BY avg_score DESC;

-- Function: upsert_trending_topic
-- Upserts a trending topic, updating score and last_seen if exists
CREATE OR REPLACE FUNCTION upsert_trending_topic(
  p_topic TEXT,
  p_normalized_topic TEXT,
  p_category TEXT,
  p_region TEXT,
  p_score INTEGER,
  p_velocity NUMERIC,
  p_popularity NUMERIC,
  p_source TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO trending_topics (
    topic,
    normalized_topic,
    category,
    region,
    score,
    velocity,
    popularity,
    source_count,
    sources,
    metadata,
    last_seen
  )
  VALUES (
    p_topic,
    p_normalized_topic,
    p_category,
    p_region,
    p_score,
    p_velocity,
    p_popularity,
    1,
    ARRAY[p_source],
    p_metadata,
    NOW()
  )
  ON CONFLICT (normalized_topic, region, category)
  DO UPDATE SET
    score = GREATEST(trending_topics.score, p_score),
    velocity = (trending_topics.velocity + p_velocity) / 2,
    popularity = (trending_topics.popularity + p_popularity) / 2,
    last_seen = NOW(),
    source_count = trending_topics.source_count + 1,
    sources = CASE
      WHEN p_source = ANY(trending_topics.sources) THEN trending_topics.sources
      ELSE array_append(trending_topics.sources, p_source)
    END,
    metadata = trending_topics.metadata || p_metadata,
    updated_at = NOW()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE source_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read source_raw (for analytics)
CREATE POLICY "Anyone can read source_raw"
  ON source_raw FOR SELECT
  USING (true);

-- Policy: Service role can insert source_raw
CREATE POLICY "Service can insert source_raw"
  ON source_raw FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read trending_topics
CREATE POLICY "Anyone can read trending_topics"
  ON trending_topics FOR SELECT
  USING (true);

-- Policy: Service role can insert/update trending_topics
CREATE POLICY "Service can modify trending_topics"
  ON trending_topics FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE source_raw IS 'Stores raw JSON payloads from trending data sources (Google Trends, Twitter, Reddit, NewsAPI)';
COMMENT ON TABLE trending_topics IS 'Stores normalized and ranked trending topics with scores and metadata';
COMMENT ON VIEW trending_topics_live IS 'Live view of trending topics from last 24 hours with temperature indicators';
COMMENT ON VIEW trending_by_category IS 'Trending topics grouped by category and region';
COMMENT ON FUNCTION upsert_trending_topic IS 'Upserts a trending topic, merging data if topic already exists';

