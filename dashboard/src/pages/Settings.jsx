import { useState } from 'react';

const Settings = () => {
  const [quietHours, setQuietHours] = useState({ start: '22:00', end: '06:00' });
  const [timezone, setTimezone] = useState('Europe/Budapest');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved (mock). Connect to Supabase to persist.');
  };

  return (
    <section className="settings-page">
      <h2>Workspace Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Quiet hours</label>
          <div className="quiet-hours">
            <input
              type="time"
              value={quietHours.start}
              onChange={(e) => setQuietHours((prev) => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input
              type="time"
              value={quietHours.end}
              onChange={(e) => setQuietHours((prev) => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
        <div className="form-row">
          <label htmlFor="timezone">Timezone</label>
          <select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option value="Europe/Budapest">Europe/Budapest</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
          </select>
        </div>
        <button type="submit">Save settings</button>
      </form>
    </section>
  );
};

export default Settings;

