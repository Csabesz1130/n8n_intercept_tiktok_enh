import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Header from './components/Header';
import Tabs from './components/Tabs';
import IdeasTab from './components/IdeasTab';
import RemindersTab from './components/RemindersTab';
import TrendsTab from './components/TrendsTab';
import Login from './pages/Login';
import Analytics from './pages/Analytics';
import ProtectedRoute from './components/ProtectedRoute';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';
const N8N_WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK || 'https://your-n8n-instance.com/webhook/generate-hungarian-content';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function Dashboard() {
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
    instagram: false,
    facebook: false,
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
        instagram: false,
        facebook: false,
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
      <Header />
      <div className="container">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="main-content">
          {activeTab === 'ideas' && (
            <IdeasTab
              mockIdeas={mockIdeas}
              selectedIdea={selectedIdea}
              setSelectedIdea={setSelectedIdea}
              setEditedContent={setEditedContent}
              editedContent={editedContent}
              channels={channels}
              setChannels={setChannels}
              scheduleTime={scheduleTime}
              setScheduleTime={setScheduleTime}
              handleSchedule={handleSchedule}
              loading={loading}
              scheduledPosts={scheduledPosts}
              handleCancelSchedule={handleCancelSchedule}
            />
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

export default App;

