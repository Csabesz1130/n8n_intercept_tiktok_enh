import React from 'react';

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
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
  );
};

export default Tabs;
