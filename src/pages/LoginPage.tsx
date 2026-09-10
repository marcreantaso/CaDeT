import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate('/');
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(222, 47%, 11%)' }}>
                Email
              </label>
              <input
                id="email"
                autoComplete="email"
                type="email"
                className="input-light"
                placeholder="you@example.com"
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

            <button
              type="submit"
              className="btn-auth"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
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
