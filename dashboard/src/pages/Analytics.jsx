import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_BASE}/analytics`);
        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>Could not load analytics.</div>;
  }

  return (
    <div className="analytics-container">
      <h1>Analytics Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h2>Total Posts</h2>
          <p>{analytics.totalPosts}</p>
        </div>
        <div className="stat-card">
          <h2>Total Likes</h2>
          <p>{analytics.totalLikes}k</p>
        </div>
        <div className="stat-card">
          <h2>Total Shares</h2>
          <p>{analytics.totalShares}</p>
        </div>
        <div className="stat-card">
          <h2>Engagement Rate</h2>
          <p>{(analytics.engagementRate * 100).toFixed(2)}%</p>
        </div>
      </div>
      {/* More charts will go here */}
    </div>
  );
};

export default Analytics;
