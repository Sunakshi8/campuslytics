import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { studentApi } from '../../api/endpoints';

const TABS = ['All', 'Applied', 'Shortlisted', 'Interview', 'Rejected', 'Selected'];

export default function StudentApplications() {
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    setLoading(true);
    studentApi.applications({ status: tab }).then((res) => setApplications(res.data.applications)).finally(() => setLoading(false));
  }, [tab]);

  return (
    <DashboardLayout role="student" title="My Applications">
      <div className="mb-5 flex gap-2 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition ${
              tab === t ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : applications.length === 0 ? (
        <EmptyState title="No applications here yet" description="Browse drives and apply to see them here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-5 py-3">Drive / Company</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Applied On</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-ink-800">{a.drive?.company?.companyName}</td>
                  <td className="px-5 py-3 text-gray-600">{a.drive?.title}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/student/drives/${a.drive?._id}`} className="text-brand-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
