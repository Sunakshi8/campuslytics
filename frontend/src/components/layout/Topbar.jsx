import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { notificationApi } from '../../api/endpoints';

export default function Topbar({ title, subtitle, showSearch = false, onSearch }) {
  const { user } = useSelector((s) => s.auth);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    notificationApi
      .list()
      .then((res) => {
        if (mounted) setUnread(res.data.unreadCount || 0);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      <div>
        <h1 className="text-xl font-bold text-ink-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search drives, companies, roles..."
              className="w-72 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        )}
        <Link to={`/${user?.role}/notifications`} className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell size={20} className="text-ink-700" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
          )}
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-semibold text-ink-900 leading-tight">{user?.name}</p>
            <p className="text-xs capitalize text-gray-500 leading-tight">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
