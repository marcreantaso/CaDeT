import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { navigationItems } from './navigation';

export function TopBar() {
  const { profile, logout } = useAuth();
  const { pathname } = useLocation();
  const page = navigationItems.find(item => item.path === pathname)?.label || 'Workspace';
  const firstName = profile?.fullName?.trim().split(/\s+/)[0] || 'User';

  return (
    <header className="top-bar">
      <div className="top-bar-location">
        <Link to="/" className="top-bar-brand">CaDeT</Link>
        <span className="top-bar-divider" aria-hidden="true">/</span>
        <span className="truncate">{page}</span>
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className="account-trigger" aria-label="Account menu">
            <span className="profile-avatar" aria-hidden="true">{firstName[0]}</span>
            <span className="account-name">{firstName}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="account-menu" align="end" sideOffset={8} collisionPadding={16}>
            <DropdownMenu.Label className="account-menu-label">{profile?.fullName || 'Your account'}</DropdownMenu.Label>
            <DropdownMenu.Separator className="account-menu-separator" />
            <DropdownMenu.Item className="account-menu-item" onSelect={() => { void logout(); }}>
              <LogOut size={16} aria-hidden="true" />Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  );
}
