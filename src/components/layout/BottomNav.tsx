import { NavLink } from 'react-router-dom';
import { Home, Route, Zap, Brain, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
  onQuickAdd: () => void;
}

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/journey', icon: Route, label: 'Journey' },
  { path: '#add', icon: Plus, label: 'Add', isCenter: true },
  { path: '/skills', icon: Zap, label: 'Skills' },
  { path: '/insights', icon: Brain, label: 'Insights' },
];

export function BottomNav({ onQuickAdd }: BottomNavProps) {
  return (
    <nav className="bottom-nav lg:hidden flex items-center justify-around px-2">
      {navItems.map((item) => {
        if (item.isCenter) {
          return (
            <motion.button
              key="add"
              className="quick-add-btn"
              onClick={onQuickAdd}
              whileTap={{ scale: 0.9 }}
              aria-label="Quick add"
            >
              <Plus size={24} strokeWidth={2.5} />
            </motion.button>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl ${
                isActive ? 'active' : ''
              }`
            }
            end={item.path === '/'}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1 : 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{
                      color: isActive
                        ? 'hsl(262, 83%, 58%)'
                        : 'hsl(215, 15%, 45%)',
                    }}
                  />
                </motion.div>
                <span
                  className="text-[10px] font-medium"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: isActive
                      ? 'hsl(262, 83%, 58%)'
                      : 'hsl(215, 15%, 45%)',
                  }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: 'hsl(262, 83%, 58%)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
