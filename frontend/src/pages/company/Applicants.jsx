import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import { companyApi } from '../../api/endpoints';

const STATUSES = ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Selected'];
const TABS = ['All', ...STATUSES];

export default function Applicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    setLoading(true);
    companyApi.applicants(id, { status: tab }).then((res) => {
      setDrive(res.data.drive);
      setApplications(res.data.applications);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id, tab]);

  const handleStatusChange = async (appId, status) => {
    setUpdatingId(appId);
    try {
      await companyApi.updateApplicationStatus(appId, { status });
      load();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout role="company" title={drive ? `Applicants - ${drive.title}` : 'Applicants'}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-ink-800">
          <ArrowLeft size={16} /> Back to My Drives
        </button>
        <button
          onClick={() => navigate(`/company/ai-copilot?driveId=${id}`)}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-500 transition"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          Open in AI Recruiter Copilot
        </button>
      </div>

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
        <EmptyState title="No applicants" description="No students have applied under this filter yet." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Branch / Year</th>
                <th className="px-5 py-3">CGPA</th>
                <th className="px-5 py-3">Match</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink-800">{a.student?.user?.name}</p>
                    <p className="text-xs text-gray-500">{a.student?.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{a.student?.branch} · {a.student?.year}</td>
                  <td className="px-5 py-3 text-gray-600">{a.student?.cgpa}</td>
                  <td className="px-5 py-3 text-gray-600">{a.matchScore}%</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3">
                    <select
                      disabled={updatingId === a._id}
                      value={a.status}
                      onChange={(e) => handleStatusChange(a._id, e.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand-500"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
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
