import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { QuickAddModal } from './QuickAddModal';

export function AppShell() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const quickAddTrigger = useRef<HTMLElement | null>(null);
  const openQuickAdd = () => {
    quickAddTrigger.current = document.activeElement as HTMLElement | null;
    setQuickAddOpen(true);
  };

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Sidebar onQuickAdd={openQuickAdd} />
      <div className="app-workspace">
        <TopBar />
        <main id="main-content" tabIndex={-1} className="app-main">
          <div className="app-content"><Outlet /></div>
        </main>
      </div>
      <BottomNav onQuickAdd={openQuickAdd} />
      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)}
        onCloseAutoFocus={() => quickAddTrigger.current?.focus()} />
    </div>
  );
}
