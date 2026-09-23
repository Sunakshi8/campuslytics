import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ClipboardList, Users2, PlusCircle, Sparkles, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { companyApi } from '../../api/endpoints';

export default function CompanyDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    companyApi.listDrives().then((res) => setDrives(res.data.drives)).finally(() => setLoading(false));
  }, []);

  const totalApplicants = drives.reduce((sum, d) => sum + (d.applicantCount || 0), 0);
  const openDrives = drives.filter((d) => d.status === 'open').length;

  return (
    <DashboardLayout role="company" title={`Welcome, ${user?.name}`} subtitle="Manage your drives and applicants.">
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          {/* AI Recruiter Copilot Spotlight Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-teal-800 to-ink-900 p-6 text-white shadow-md">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/20 px-3 py-1 text-xs font-semibold text-teal-200 backdrop-blur-sm">
                  <Sparkles size={14} className="text-teal-300" />
                  AI Placement Intelligence
                </div>
                <h3 className="mt-2 text-xl font-bold">Recruiter AI Screening Assistant</h3>
                <p className="mt-1 text-xs text-teal-100 leading-relaxed">
                  Automate candidate resume screening against job descriptions. Review ranked match scores, candidate dimension comparison charts, and manage shortlists with full recruiter control.
                </p>
              </div>
              <Link
                to="/company/ai-copilot"
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-teal-900 shadow-sm transition hover:bg-teal-50"
              >
                Launch Recruiter Copilot <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={ClipboardList} label="Total Drives" value={drives.length} />
            <StatCard icon={ClipboardList} label="Open Drives" value={openDrives} />
            <StatCard icon={Users2} label="Total Applicants" value={totalApplicants} />
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-ink-900">Recent Drives</h3>
              <Link to="/company/drives">
                <Button><PlusCircle size={16} /> Post New Drive</Button>
              </Link>
            </div>
            {drives.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">You haven't posted any drives yet.</p>
            ) : (
              <div className="space-y-3">
                {drives.slice(0, 5).map((d) => (
                  <div key={d._id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                    <div>
                      <p className="font-semibold text-ink-800">{d.title}</p>
                      <p className="text-xs text-gray-500">{d.applicantCount} applicant(s) · Apply by {new Date(d.applyBy).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge ${d.status === 'open' ? 'badge-selected' : 'badge-rejected'}`}>{d.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="rounded-lg bg-brand-50 p-2 text-brand-600"><Icon size={18} /></div>
      <div>
        <p className="text-lg font-bold text-ink-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
