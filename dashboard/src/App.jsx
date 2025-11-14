import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';
const N8N_WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK || 'https://your-n8n-instance.com/webhook/generate-hungarian-content';

function App() {
  const [activeTab, setActiveTab] = useState('ideas'); // 'ideas', 'reminders', or 'trends'
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsCategory, setTrendsCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState({
    twitter: false,
    linkedin: false,
    mastodon: false,
    newsletter: false,
  });
  const [scheduleTime, setScheduleTime] = useState('');
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    loadScheduledPosts();
    loadReminders();
    if (activeTab === 'trends') {
      loadTrends();
    }
  }, [activeTab]);

  const loadScheduledPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/scheduled`);
      setScheduledPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
      // Silently fail - scheduler might not be running
      setScheduledPosts([]);
    }
  };

  const loadReminders = async () => {
    try {
      // In production, this would call Supabase or your API
      // For now, we'll use mock data or scheduler API
      const response = await axios.get(`${API_BASE}/reminders`).catch(() => ({ data: { reminders: [] } }));
      setReminders(response.data.reminders || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
      // Fallback: try to get from scheduled posts
      setReminders([]);
    }
  };

  const handleGetReminders = async () => {
    if (!selectedIdea) {
      alert('Please select an idea first');
      return;
    }

    setLoading(true);
    try {
      const selectedChannels = Object.entries(channels)
        .filter(([_, selected]) => selected)
        .map(([channel]) => channel);

      if (selectedChannels.length === 0) {
        alert('Please select at least one channel');
        setLoading(false);
        return;
      }

      // Call reminder engine via n8n webhook
      const reminderWebhook = N8N_WEBHOOK.replace('generate-hungarian-content', 'reminder-engine');
      const response = await axios.post(reminderWebhook, {
        user_id: 'demo-user-1',
        content: selectedIdea,
        channels: selectedChannels,
        region: 'HU'
      });

      if (response.data.recommendations) {
        alert(`Found ${response.data.recommendations.length} optimal posting times!`);
        // Schedule reminders
        await scheduleReminders(response.data.recommendations);
        loadReminders();
      }
    } catch (error) {
      console.error('Error getting reminders:', error);
      alert('Failed to get reminder recommendations. Using fallback times.');
      // Fallback: generate basic reminders
      const fallbackReminders = generateFallbackReminders();
      await scheduleReminders(fallbackReminders);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackReminders = () => {
    const now = new Date();
    const reminders = [];
    for (let i = 0; i < 3; i++) {
      const future = new Date(now.getTime() + (i + 1) * 8 * 60 * 60 * 1000);
      future.setMinutes(0, 0, 0);
      reminders.push({
        time: future.toISOString(),
        channel: Object.keys(channels).find(k => channels[k]) || 'twitter',
        score: 85 - (i * 10),
        reason: `Optimal posting time based on global peak hours`
      });
    }
    return reminders;
  };

  const scheduleReminders = async (recommendations) => {
    try {
      await axios.post(`${API_BASE}/schedule-reminder`, {
        user_id: 'demo-user-1',
        content: selectedIdea,
        recommendations
      });
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  };

  const loadTrends = async () => {
    setTrendsLoading(true);
    try {
      const category = trendsCategory !== 'all' ? trendsCategory : '';
      const url = `${API_BASE}/trends${category ? `?category=${category}` : ''}`;
      const response = await axios.get(url).catch(() => ({ data: { trends: [] } }));
      setTrends(response.data.trends || []);
    } catch (error) {
      console.error('Error loading trends:', error);
      setTrends([]);
    } finally {
      setTrendsLoading(false);
    }
  };

  const handleGenerateFromTrend = async (trend) => {
    // Pre-fill content generation with trend topic
    const trendWebhook = N8N_WEBHOOK.replace('generate-hungarian-content', 'journalist-content');
    try {
      const response = await axios.post(trendWebhook, {
        keyword: trend.topic,
        topics: [trend.topic],
        region: trend.region || 'HU',
        channels: ['twitter']
      });
      
      if (response.data.ideas) {
        setIdeas(response.data.ideas);
        setActiveTab('ideas');
        alert(`Generated ${response.data.ideas.length} content ideas from trend: ${trend.topic}`);
      }
    } catch (error) {
      console.error('Error generating from trend:', error);
      alert('Failed to generate content from trend');
    }
  };

  const handleSchedule = async () => {
    if (!selectedIdea || !scheduleTime) {
      alert('Please select an idea and set a schedule time');
      return;
    }

    const selectedChannels = Object.entries(channels)
      .filter(([_, selected]) => selected)
      .map(([channel]) => channel);

    if (selectedChannels.length === 0) {
      alert('Please select at least one channel');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        webhookUrl: N8N_WEBHOOK,
        payload: {
          keyword: selectedIdea.keyword || 'content',
          ideas: [selectedIdea],
          content: editedContent || selectedIdea.hook,
        },
        channels: selectedChannels,
        scheduledTime: scheduleTime,
      };

      await axios.post(`${API_BASE}/schedule`, payload);
      alert('Post scheduled successfully!');
      loadScheduledPosts();
      setSelectedIdea(null);
      setScheduleTime('');
      setChannels({
        twitter: false,
        linkedin: false,
        mastodon: false,
        newsletter: false,
      });
    } catch (error) {
      console.error('Error scheduling post:', error);
      if (error.code === 'ERR_NETWORK' || error.message.includes('ECONNREFUSED')) {
        alert('Scheduler service is not running. Please start it:\n\ncd scheduler && npm start\n\nOr run: npm run dev');
      } else {
        alert('Failed to schedule post: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (jobId) => {
    try {
      await axios.delete(`${API_BASE}/schedule/${jobId}`);
      alert('Scheduled post cancelled');
      loadScheduledPosts();
    } catch (error) {
      console.error('Error cancelling post:', error);
      alert('Failed to cancel post');
    }
  };

  // Mock data for demo - in production, fetch from n8n/Supabase
  const mockIdeas = [
    {
      id: 1,
      hook: 'Magyarország gazdasági növekedése 2024-ben',
      concept: 'Rövid videó a gazdasági mutatókról',
      summary: 'Összefoglaló a magyar gazdaság teljesítményéről',
      sentiment: 'positive',
      headlines: {
        clickbait: 'Ez a szám megdöbbentő!',
        neutral: 'Magyarország gazdasági mutatói 2024',
        formal: 'Hivatalos gazdasági jelentés',
      },
    },
    {
      id: 2,
      hook: 'Egészségügyi reform - Mi változott?',
      concept: 'Q&A formátumú videó',
      summary: 'Válaszok a gyakori kérdésekre',
      sentiment: 'neutral',
      headlines: {
        clickbait: 'Ezt mindenkinek tudnia kell!',
        neutral: 'Egészségügyi változások 2024',
        formal: 'Egészségügyi reform összefoglaló',
      },
    },
  ];

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 Viral n8n Content Dashboard</h1>
        <p>Review, edit, and schedule your content</p>
      </header>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'ideas' ? 'active' : ''}`}
            onClick={() => setActiveTab('ideas')}
          >
            💡 Content Ideas
          </button>
          <button
            className={`tab ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
          >
            ⏰ Reminders
          </button>
          <button
            className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            🔥 Trends
          </button>
        </div>

        <div className="main-content">
          {activeTab === 'ideas' && (
            <>
          <section className="ideas-section">
            <h2>Generated Content Ideas</h2>
            <div className="ideas-grid">
              {mockIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className={`idea-card ${selectedIdea?.id === idea.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedIdea(idea);
                    setEditedContent(idea.hook);
                  }}
                >
                  <h3>{idea.hook}</h3>
                  <p className="concept">{idea.concept}</p>
                  <div className="meta">
                    <span className={`sentiment ${idea.sentiment}`}>
                      {idea.sentiment}
                    </span>
                    {idea.summary && (
                      <span className="summary">{idea.summary}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {selectedIdea && (
            <section className="editor-section">
              <h2>Edit & Schedule</h2>
              <div className="editor">
                <label>Content</label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={4}
                  placeholder="Edit your content here..."
                />

                <label>Select Channels</label>
                <div className="channels">
                  <label>
                    <input
                      type="checkbox"
                      checked={channels.twitter}
                      onChange={(e) =>
                        setChannels({ ...channels, twitter: e.target.checked })
                      }
                    />
                    <span>Twitter/X</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={channels.linkedin}
                      onChange={(e) =>
                        setChannels({ ...channels, linkedin: e.target.checked })
                      }
                    />
                    <span>LinkedIn</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={channels.mastodon}
                      onChange={(e) =>
                        setChannels({ ...channels, mastodon: e.target.checked })
                      }
                    />
                    <span>Mastodon</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={channels.newsletter}
                      onChange={(e) =>
                        setChannels({
                          ...channels,
                          newsletter: e.target.checked,
                        })
                      }
                    />
                    <span>Newsletter</span>
                  </label>
                </div>

                <label>Schedule Time</label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />

                <button
                  className="schedule-btn"
                  onClick={handleSchedule}
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : '📅 Schedule Post'}
                </button>
              </div>
            </section>
          )}

          <section className="scheduled-section">
            <h2>Scheduled Posts</h2>
            {scheduledPosts.length === 0 ? (
              <p className="empty">No scheduled posts</p>
            ) : (
              <div className="scheduled-list">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="scheduled-item">
                    <div className="scheduled-info">
                      <strong>
                        {format(new Date(post.scheduledTime), 'PPpp')}
                      </strong>
                      <div className="channels-badge">
                        {post.channels.map((ch) => (
                          <span key={ch} className="channel-tag">
                            {ch}
                          </span>
                        ))}
                      </div>
                      <span className={`status ${post.status}`}>
                        {post.status}
                      </span>
                    </div>
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelSchedule(post.id)}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
          </>
          )}

          {activeTab === 'reminders' && (
            <RemindersTab
              reminders={reminders}
              selectedIdea={selectedIdea}
              channels={channels}
              onGetReminders={handleGetReminders}
              loading={loading}
              onRefresh={loadReminders}
            />
          )}

          {activeTab === 'trends' && (
            <TrendsTab
              trends={trends}
              loading={trendsLoading}
              category={trendsCategory}
              onCategoryChange={setTrendsCategory}
              onRefresh={loadTrends}
              onGenerate={handleGenerateFromTrend}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function RemindersTab({ reminders, selectedIdea, channels, onGetReminders, loading, onRefresh }) {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    // Generate heatmap data from reminders
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const heatmap = hours.map(hour => {
      const hourReminders = reminders.filter(r => {
        const time = new Date(r.scheduled_time || r.time);
        return time.getHours() === hour;
      });
      return {
        hour,
        count: hourReminders.length,
        avgScore: hourReminders.length > 0
          ? hourReminders.reduce((sum, r) => sum + (r.score || 0), 0) / hourReminders.length
          : 0
      };
    });
    
    setHeatmapData(heatmap);
  }, [reminders]);

  const upcomingReminders = reminders
    .filter(r => {
      const time = new Date(r.scheduled_time || r.time);
      return time > new Date();
    })
    .sort((a, b) => {
      const timeA = new Date(a.scheduled_time || a.time);
      const timeB = new Date(b.scheduled_time || b.time);
      return timeA - timeB;
    });

  return (
    <>
      <section className="reminders-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Smart Reminders</h2>
          <div>
            <button
              className="schedule-btn"
              onClick={onGetReminders}
              disabled={loading || !selectedIdea}
              style={{ marginRight: '0.5rem' }}
            >
              {loading ? 'Analyzing...' : '🔍 Get Optimal Times'}
            </button>
            <button className="secondary" onClick={onRefresh}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {!selectedIdea && (
          <div className="help-box">
            <p>💡 Select a content idea first, then click "Get Optimal Times" to receive AI-powered posting time recommendations!</p>
          </div>
        )}

        <div className="reminders-grid">
          <div className="heatmap-container">
            <h3>Engagement Heatmap</h3>
            <div className="heatmap">
              {heatmapData.map(({ hour, count, avgScore }) => (
                <div
                  key={hour}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: count > 0
                      ? `rgba(102, 126, 234, ${Math.min(0.3 + (avgScore / 100) * 0.7, 1)})`
                      : '#f3f4f6',
                    border: count > 0 ? '2px solid #667eea' : '1px solid #e5e7eb'
                  }}
                  title={`${hour}:00 - ${count} reminders, avg score: ${avgScore.toFixed(0)}`}
                >
                  <div className="heatmap-hour">{hour}</div>
                  {count > 0 && <div className="heatmap-count">{count}</div>}
                </div>
              ))}
            </div>
            <div className="heatmap-legend">
              <span>Low</span>
              <div className="legend-gradient"></div>
              <span>High</span>
            </div>
          </div>

          <div className="upcoming-reminders">
            <h3>Upcoming Reminders</h3>
            {upcomingReminders.length === 0 ? (
              <div className="empty-state">
                <p>No reminders scheduled yet.</p>
                <p>Get optimal posting times for your content!</p>
              </div>
            ) : (
              <div className="reminders-list">
                {upcomingReminders.map((reminder, idx) => {
                  const time = new Date(reminder.scheduled_time || reminder.time);
                  const isSoon = time - new Date() < 60 * 60 * 1000; // Within 1 hour
                  
                  return (
                    <div
                      key={idx}
                      className={`reminder-card ${isSoon ? 'soon' : ''}`}
                    >
                      <div className="reminder-header">
                        <span className="reminder-time">
                          {format(time, 'PPpp')}
                        </span>
                        <span className={`reminder-score score-${Math.floor((reminder.score || 0) / 20)}`}>
                          {reminder.score || 0}/100
                        </span>
                      </div>
                      <div className="reminder-details">
                        <span className="reminder-channel">{reminder.channel || 'twitter'}</span>
                        <p className="reminder-reason">{reminder.reason || 'Optimal posting time'}</p>
                      </div>
                      {isSoon && (
                        <div className="reminder-alert">
                          ⚡ Posting time is soon!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function TrendsTab({ trends, loading, category, onCategoryChange, onRefresh, onGenerate }) {
  const categories = ['all', 'tech', 'politics', 'finance', 'culture', 'sports', 'health', 'other'];

  return (
    <>
      <section className="trends-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>🔥 Trending Topics</h2>
          <button className="secondary" onClick={onRefresh} disabled={loading}>
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>

        <div className="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-filter ${category === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading trending topics...</p>
          </div>
        ) : trends.length === 0 ? (
          <div className="empty-state">
            <p>No trends found. Try a different category or check back later.</p>
          </div>
        ) : (
          <div className="trends-grid">
            {trends.map((trend) => {
              const temperature = trend.temperature || 'cool';
              const scoreColor = trend.score >= 80 ? '#10b981' : trend.score >= 60 ? '#f59e0b' : '#6b7280';
              
              return (
                <div key={trend.id} className="trend-card">
                  <div className="trend-header">
                    <h3 className="trend-topic">{trend.topic}</h3>
                    <div className="trend-badges">
                      <span className="trend-category">{trend.category}</span>
                      <span className="trend-temperature" data-temp={temperature}>
                        {temperature === 'hot' ? '🔥' : temperature === 'warm' ? '🌡️' : '❄️'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="trend-metrics">
                    <div className="metric">
                      <span className="metric-label">Score</span>
                      <span className="metric-value" style={{ color: scoreColor }}>
                        {trend.score}/100
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Velocity</span>
                      <span className="metric-value">{trend.velocity?.toFixed(1) || 0}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Sources</span>
                      <span className="metric-value">{trend.source_count || 1}</span>
                    </div>
                  </div>

                  <div className="trend-sources">
                    {trend.sources?.map((source, idx) => (
                      <span key={idx} className="source-tag">{source}</span>
                    ))}
                  </div>

                  <div className="trend-footer">
                    <span className="trend-region">📍 {trend.region}</span>
                    <span className="trend-time">
                      {format(new Date(trend.last_seen), 'MMM d, HH:mm')}
                    </span>
                  </div>

                  <button
                    className="generate-from-trend-btn"
                    onClick={() => onGenerate(trend)}
                  >
                    ✨ Generate Content
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default App;

