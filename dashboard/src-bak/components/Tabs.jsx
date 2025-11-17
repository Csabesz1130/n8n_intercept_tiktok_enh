import React from 'react';
import { NavLink } from 'react-router-dom';

const Tabs = () => {
  return (
    <div className="tabs">
      <NavLink to="/" className="tab" activeClassName="active">
        💡 Content Ideas
      </NavLink>
      <NavLink to="/reminders" className="tab" activeClassName="active">
        ⏰ Reminders
      </NavLink>
      <NavLink to="/trends" className="tab" activeClassName="active">
        🔥 Trends
      </NavLink>
      <NavLink to="/analytics" className="tab" activeClassName="active">
        📊 Analytics
      </NavLink>
    </div>
  );
};

export default Tabs;
