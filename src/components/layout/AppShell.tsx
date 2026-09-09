import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { QuickAddModal } from './QuickAddModal';

export function AppShell() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'hsl(222, 47%, 6%)' }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:ml-[260px]">
        <TopBar />

        <main
          className="pb-24 lg:pb-8 pt-4 px-4 md:px-6 lg:px-8"
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav onQuickAdd={() => setQuickAddOpen(true)} />

      {/* Quick Add Modal */}
      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
}
