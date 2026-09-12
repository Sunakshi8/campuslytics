import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { notificationApi } from '../../api/endpoints';
import { Bell, CheckCheck } from 'lucide-react';

const TABS = ['All', 'application', 'interview', 'system'];
const TAB_LABELS = { All: 'All', application: 'Applications', interview: 'Interviews', system: 'System' };

export default function Notifications() {
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const load = () => {
    setLoading(true);
    notificationApi.list({ type: tab }).then((res) => setNotifications(res.data.notifications)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tab]);

  const handleMarkAll = async () => {
    await notificationApi.markAllRead();
    load();
  };

  return (
    <DashboardLayout role={user?.role} title="Notifications">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                tab === t ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={handleMarkAll}>
          <CheckCheck size={16} /> Mark all read
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="card divide-y divide-gray-100">
          {notifications.map((n) => (
            <div key={n._id} className={`flex items-start gap-3 p-4 ${!n.isRead ? 'bg-brand-50/40' : ''}`}>
              <div className="mt-1 rounded-full bg-brand-100 p-2 text-brand-600">
                <Bell size={14} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink-800">{n.title}</p>
                <p className="text-sm text-gray-500">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
