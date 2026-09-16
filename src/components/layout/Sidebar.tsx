import { BrandLogo } from "../shared/BrandLogo";
import { NavLink, Link } from 'react-router-dom';
import { Plus, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActor } from '../../contexts/ActorContext';
import { ACTOR_STAGE_META } from '../../types/actor';
import { navigationItems } from './navigation';

export function Sidebar({ onQuickAdd }: { onQuickAdd: () => void }) {
  const { profile, logout } = useAuth();
  const { currentStage } = useActor();
  const stageMeta = ACTOR_STAGE_META[currentStage];
  const initials = profile?.fullName?.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('') || 'U';

  return (
    <aside className="app-sidebar">
      <Link to="/" className="brand" aria-label="CaDeT dashboard">
        <span className="brand-mark" aria-hidden="true"><BrandLogo /></span>
        <span className="sidebar-copy"><strong>CaDeT</strong><small>Career tracker</small></span>
      </Link>
      <div className="sidebar-section-label sidebar-copy">Workspace</div>
      <nav aria-label="Main navigation" className="sidebar-navigation">
        {navigationItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            title={item.label} aria-label={item.label}
            className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}>
            <item.icon size={20} aria-hidden="true" />
            <span className="sidebar-copy">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button type="button" className="btn btn-primary sidebar-add" onClick={onQuickAdd} aria-label="Quick add" title="Quick add">
        <Plus size={20} aria-hidden="true" /><span className="sidebar-copy">Quick add</span>
      </button>
      <div className="sidebar-stage sidebar-copy">
        <p className="eyebrow">Your current stage</p>
        <strong style={{ color: stageMeta.color }}>{stageMeta.label}</strong>
        <p>{stageMeta.description}</p>
      </div>
      <div className="sidebar-account">
        <div className="sidebar-profile">
          <span className="profile-avatar" aria-hidden="true">{initials}</span>
          <div className="sidebar-copy min-w-0">
            <p className="truncate">{profile?.fullName || 'User'}</p>
            <small className="block truncate">{profile?.headline || 'Your career workspace'}</small>
          </div>
        </div>
        <button type="button" onClick={logout} className="sidebar-link" aria-label="Sign out" title="Sign out">
          <LogOut size={18} aria-hidden="true" /><span className="sidebar-copy">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
