import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const RemindersTab = ({ reminders, selectedIdea, onGetReminders, loading, onRefresh }) => {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    // Generate heatmap data from reminders
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
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
};

export default RemindersTab;
