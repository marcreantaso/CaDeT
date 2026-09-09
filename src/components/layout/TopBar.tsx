import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function TopBar() {
  const { profile } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 lg:px-8"
      style={{
        background: 'hsl(222, 47%, 6%, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid hsl(222, 25%, 14%)',
      }}
    >
      {/* Left: Greeting (mobile) / Breadcrumb area */}
      <div className="lg:hidden">
        <h2
          className="text-lg font-bold"
          style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
        >
          CaDeT
        </h2>
      </div>

      <div className="hidden lg:block">
        <p className="text-sm" style={{ color: 'hsl(215, 20%, 65%)' }}>
          Welcome back, <span className="font-semibold" style={{ color: 'hsl(210, 40%, 96%)' }}>{profile?.fullName?.split(' ')[0] || 'User'}</span>
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          className="btn-icon btn-ghost relative p-2 rounded-xl"
          style={{ color: 'hsl(215, 20%, 65%)' }}
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        <button
          className="btn-icon btn-ghost relative p-2 rounded-xl"
          style={{ color: 'hsl(215, 20%, 65%)' }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'hsl(0, 72%, 51%)' }}
          />
        </button>

        {/* Avatar (mobile only) */}
        <div className="lg:hidden">
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
        </div>
      </div>
    </header>
  );
}
