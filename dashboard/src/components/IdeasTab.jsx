import React from 'react';
import { format } from 'date-fns';

const IdeasTab = ({
  mockIdeas,
  selectedIdea,
  setSelectedIdea,
  setEditedContent,
  editedContent,
  channels,
  setChannels,
  scheduleTime,
  setScheduleTime,
  handleSchedule,
  loading,
  scheduledPosts,
  handleCancelSchedule,
}) => {
  return (
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
              <label>
                <input
                  type="checkbox"
                  checked={channels.instagram}
                  onChange={(e) =>
                    setChannels({ ...channels, instagram: e.target.checked })
                  }
                />
                <span>Instagram</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={channels.facebook}
                  onChange={(e) =>
                    setChannels({ ...channels, facebook: e.target.checked })
                  }
                />
                <span>Facebook</span>
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
  );
};

export default IdeasTab;
