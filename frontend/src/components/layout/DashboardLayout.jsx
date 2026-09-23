import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useState } from 'react';

export default function DashboardLayout({ role, title, subtitle, showSearch, onSearch, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f5f2]">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          title={title}
          subtitle={subtitle}
          showSearch={showSearch}
          onSearch={onSearch}
          onMenu={() => setSidebarOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
