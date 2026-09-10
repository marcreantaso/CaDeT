import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { navigationItems } from './navigation';

export function BottomNav({ onQuickAdd }: { onQuickAdd: () => void }) {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {navigationItems.map((item, index) => (
        <Fragment key={item.path}>
          {index === 2 && (
            <button type="button" className="mobile-add" onClick={onQuickAdd} aria-label="Quick add">
              <span><Plus size={22} aria-hidden="true" /></span>Add
            </button>
          )}
          <NavLink to={item.path} end={item.path === '/'}
            className={({ isActive }) => `mobile-link ${isActive ? 'is-active' : ''}`}>
            <item.icon size={21} aria-hidden="true" />
            <span>{item.shortLabel}</span>
          </NavLink>
        </Fragment>
      ))}
    </nav>
  );
}
