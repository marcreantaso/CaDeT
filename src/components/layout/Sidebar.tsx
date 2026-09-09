import { NavLink } from 'react-router-dom';
import { Home, Route, Zap, Brain, Settings, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useActor } from '../../contexts/ActorContext';
import { ACTOR_STAGE_META } from '../../types/actor';

const mainNavItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/journey', icon: Route, label: 'ACTOR Journey' },
  { path: '/skills', icon: Zap, label: 'Skills' },
  { path: '/insights', icon: Brain, label: 'Insights' },
];

export function Sidebar() {
  const { profile, logout } = useAuth();
  const { currentStage } = useActor();
  const stageMeta = ACTOR_STAGE_META[currentStage];

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] z-40"
      style={{
        background: 'hsl(222, 35%, 8%)',
        borderRight: '1px solid hsl(222, 25%, 14%)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{
            background: 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(262, 83%, 68%))',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Cd
        </div>
        <div>
          <h1
            className="text-base font-bold"
            style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
          >
            CaDeT
          </h1>
          <p
            className="text-[10px] tracking-wider uppercase"
            style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
          >
            Career Tracker
          </p>
        </div>
      </div>

      {/* ACTOR Status Mini */}
      <div
        className="mx-4 mb-4 p-3 rounded-xl"
        style={{
          background: 'hsl(222, 30%, 12%)',
          border: '1px solid hsl(222, 25%, 16%)',
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-2 h-2 rounded-full actor-pulse"
            style={{ background: stageMeta.color }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: stageMeta.color, fontFamily: 'var(--font-heading)' }}
          >
            {stageMeta.label} Stage
          </span>
        </div>
        <p className="text-[11px]" style={{ color: 'hsl(215, 20%, 65%)' }}>
          {stageMeta.description}
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className="block"
            >
              {({ isActive }) => (
                <motion.div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: isActive ? 'hsl(262, 83%, 58%, 0.1)' : 'transparent',
                    color: isActive ? 'hsl(262, 83%, 68%)' : 'hsl(215, 20%, 65%)',
                  }}
                  whileHover={{
                    backgroundColor: isActive
                      ? 'hsl(262, 83%, 58%, 0.12)'
                      : 'hsl(222, 30%, 14%)',
                  }}
                >
                  <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span
                    className="text-sm font-medium"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <ChevronRight size={14} className="ml-auto opacity-60" />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="px-3 pb-4 space-y-1">
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-colors"
          style={{ color: 'hsl(215, 20%, 65%)' }}
        >
          <Settings size={18} strokeWidth={1.8} />
          <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Settings</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-colors hover:opacity-80"
          style={{ color: 'hsl(0, 72%, 60%)' }}
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span className="text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Sign Out</span>
        </button>

        {/* Profile */}
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl mt-2"
          style={{
            background: 'hsl(222, 30%, 12%)',
            border: '1px solid hsl(222, 25%, 16%)',
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(172, 66%, 50%))',
              color: 'white',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {profile?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'hsl(210, 40%, 96%)' }}>
              {profile?.fullName || 'User'}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'hsl(215, 15%, 45%)' }}>
              {profile?.headline || 'Setting up...'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
