import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '' });
    try {
      await signInWithMagicLink(email);
      setStatus({
        loading: false,
        message: 'Magic link sent! Check your inbox.',
      });
      setEmail('');
    } catch (error) {
      setStatus({ loading: false, message: error.message });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign in to Viral n8n</h1>
        <p>Enter your email to receive a magic link.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <button type="submit" disabled={status.loading}>
            {status.loading ? 'Sending link...' : 'Send magic link'}
          </button>
        </form>
        {status.message && <p className="auth-message">{status.message}</p>}
      </div>
    </div>
  );
};

export default Login;

