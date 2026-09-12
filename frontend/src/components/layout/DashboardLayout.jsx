import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ role, title, subtitle, showSearch, onSearch, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f5f2]">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} showSearch={showSearch} onSearch={onSearch} />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
