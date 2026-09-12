import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckSquare, Bookmark, Users2, Award } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { studentApi } from '../../api/endpoints';

export default function StudentDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    Promise.all([studentApi.getProfile(), studentApi.applications(), studentApi.savedDrives()])
      .then(([p, a, s]) => {
        setProfile(p.data.profile);
        setApplications(a.data.applications);
        setSaved(s.data.saved);
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    applied: applications.length,
    shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
    interview: applications.filter((a) => a.status === 'Interview').length,
    selected: applications.filter((a) => a.status === 'Selected').length,
  };

  const upcomingInterviews = applications.filter((a) => a.status === 'Interview').slice(0, 3);

  return (
    <DashboardLayout role="student" title={`Good Morning, ${user?.name?.split(' ')[0] || ''}! 👋`} subtitle="Here's what's happening with your placements today.">
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon={CheckSquare} label="Applied" value={counts.applied} />
              <StatCard icon={Bookmark} label="Shortlisted" value={counts.shortlisted} />
              <StatCard icon={Users2} label="Interview" value={counts.interview} />
              <StatCard icon={Award} label="Selected" value={counts.selected} />
            </div>

            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-ink-900">Upcoming Interviews</h3>
                <Link to="/student/applications" className="text-sm font-semibold text-brand-600 hover:underline">
                  View All
                </Link>
              </div>
              {upcomingInterviews.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">No interviews scheduled yet.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingInterviews.map((a) => (
                    <div key={a._id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                      <div>
                        <p className="font-semibold text-ink-800">{a.drive?.company?.companyName}</p>
                        <p className="text-xs text-gray-500">{a.drive?.title} · {a.interview?.round || 'Interview Round'}</p>
                      </div>
                      <p className="text-xs font-medium text-gray-500">
                        {a.interview?.scheduledAt ? new Date(a.interview.scheduledAt).toLocaleString() : 'TBD'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-ink-900">Saved Drives</h3>
                <Link to="/student/saved-drives" className="text-sm font-semibold text-brand-600 hover:underline">
                  View All
                </Link>
              </div>
              {saved.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">You haven't saved any drives yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {saved.slice(0, 4).map((s) => (
                    <Link
                      to={`/student/drives/${s.drive._id}`}
                      key={s._id}
                      className="rounded-xl border border-gray-100 p-3 hover:border-brand-200"
                    >
                      <p className="font-semibold text-ink-800">{s.drive?.company?.companyName}</p>
                      <p className="text-xs text-gray-500">{s.drive?.title}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="mb-3 font-bold text-ink-900">Profile Completion</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
                  <svg className="absolute h-20 w-20 -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="#f5e6dc" strokeWidth="8" fill="none" />
                    <circle
                      cx="40" cy="40" r="34" stroke="#e85d25" strokeWidth="8" fill="none"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - (profile?.profileCompletion || 0) / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-lg font-bold text-brand-600">{profile?.profileCompletion || 0}%</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Complete your profile to get better opportunities.</p>
                  <Link to="/student/profile" className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline">
                    Complete Now →
                  </Link>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden bg-gradient-to-br from-ink-900 to-ink-800 p-6 text-white">
              <p className="text-sm text-gray-300">Small steps today,</p>
              <p className="text-xl font-bold">big dreams tomorrow.</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-lg font-bold text-ink-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
