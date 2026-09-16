import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try { await login(email, password); navigate('/'); } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); } finally { setBusy(false); }
  };

  return (
    <div className="theme-auth auth-bg flex items-center justify-center p-4" style={{ minHeight: '100vh' }}>
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold"
            style={{
              background: 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(262, 83%, 68%))',
              fontFamily: 'var(--font-heading)',
              boxShadow: '0 8px 24px hsl(262, 83%, 58%, 0.3)',
            }}
          >
            Cd
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'hsl(222, 47%, 11%)', fontFamily: 'var(--font-heading)' }}
          >
            Welcome to CaDeT
          </h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(215, 16%, 47%)' }}>
            Build the career you can prove.
          </p>
        </div>

        {/* Form */}
        <div className="auth-card p-5 sm:p-8">
          <p className="text-sm mb-4">Local device account. Data stays in this browser. Refreshing signs you out. Password recovery and cross-device accounts are not available.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(222, 47%, 11%)' }}>
                Username
              </label>
              <input
                id="email"
                autoComplete="username"
                type="text"
                className="input-light"
                placeholder="your_username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="current-password" className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(222, 47%, 11%)' }}>
                Password
              </label>
              <input
                id="current-password"
                autoComplete="current-password"
                type="password"
                className="input-light"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p role="alert">{error}</p>}
            <button
              type="submit"
              className="btn-auth"
              disabled={isLoading || busy}
            >
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'hsl(215, 16%, 47%)' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold" style={{ color: 'hsl(262, 83%, 58%)' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'hsl(215, 16%, 43%)' }}>
          Career Development Tracker — Your career intelligence OS
        </p>
      </motion.div>
    </div>
  );
}
