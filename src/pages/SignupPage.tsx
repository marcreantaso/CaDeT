import { ThemeToggle } from "../components/shared/ThemeToggle";
import { BrandLogo } from "../components/shared/BrandLogo";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function SignupPage() {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [claimLegacy, setClaimLegacy] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try { await signup(email, password, fullName, claimLegacy); navigate('/'); } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); } finally { setBusy(false); }
  };

  return (
    <div className="theme-auth auth-bg flex items-center justify-center p-4" style={{ minHeight: '100vh' }}>
      <div className="auth-theme-control"><ThemeToggle /></div>
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
              background: 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(var(--accent-light)))',
              fontFamily: 'var(--font-heading)',
              boxShadow: '0 8px 24px hsl(262, 83%, 58%, 0.3)',
            }}
          >
            <BrandLogo />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'hsl(var(--text-primary))', fontFamily: 'var(--font-heading)' }}
          >
            Start Your Journey
          </h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--text-secondary))' }}>
            Build the career you can prove.
          </p>
        </div>

        {/* Form */}
        <div className="auth-card p-5 sm:p-8">
          <p className="text-sm mb-4">Local device account. Data stays in this browser. Refreshing signs you out. Password recovery and cross-device accounts are not available.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--text-primary))' }}>
                Full Name
              </label>
              <input
                id="name"
                autoComplete="name"
                type="text"
                className="input-light"
                placeholder="Your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--text-primary))' }}>
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
              <label htmlFor="new-password" className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--text-primary))' }}>
                Password
              </label>
              <input
                id="new-password"
                autoComplete="new-password"
                type="password"
                className="input-light"
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={12}
              />
            </div>

            <label className="flex gap-2 text-sm"><input type="checkbox" checked={claimLegacy} onChange={e => setClaimLegacy(e.target.checked)} />Use the previous unprotected workspace on this device. Only select this if it belongs to you.</label>
            {error && <p role="alert">{error}</p>}
            <button
              type="submit"
              className="btn-auth"
              disabled={isLoading || busy}
            >
              {busy ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'hsl(262, 83%, 58%)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
          Career Development Tracker — Powered by the ACTOR Framework
        </p>
      </motion.div>
    </div>
  );
}
