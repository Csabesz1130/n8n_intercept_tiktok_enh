import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const Scheduler = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/scheduled`);
      setJobs(response.data.posts || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <section className="scheduler-page">
      <header>
        <h2>Scheduler Queue</h2>
        <button className="secondary" onClick={loadJobs} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      {jobs.length === 0 && !loading && (
        <div className="empty-state">
          <p>No scheduled jobs pending.</p>
        </div>
      )}

      <div className="jobs-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div>
              <strong>Job #{job.id}</strong>
              <p>Scheduled: {new Date(job.scheduledTime).toLocaleString()}</p>
            </div>
            <div>
              <span className="status">{job.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Scheduler;

