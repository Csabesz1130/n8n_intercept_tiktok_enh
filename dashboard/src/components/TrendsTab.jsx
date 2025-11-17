import React from 'react';
import { format } from 'date-fns';

const TrendsTab = ({ trends, loading, category, onCategoryChange, onRefresh, onGenerate }) => {
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
};

export default TrendsTab;
