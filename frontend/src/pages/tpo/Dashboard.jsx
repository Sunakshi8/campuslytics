import { useEffect, useState } from 'react';
import { Users, Building2, ClipboardList, Award } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { tpoApi } from '../../api/endpoints';

export default function TpoDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    tpoApi.analytics().then((res) => setAnalytics(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <DashboardLayout role="tpo" title="TPO Dashboard">
        <Spinner />
      </DashboardLayout>
    );
  }

  const { summary, totalCompaniesParticipated } = analytics;

  return (
    <DashboardLayout role="tpo" title="TPO Dashboard" subtitle="Overview of placements across campus.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Students" value={summary.totalStudents} />
        <StatCard icon={Award} label="Placed Students" value={summary.placedStudents} />
        <StatCard icon={ClipboardList} label="Total Drives" value={summary.totalDrives} />
        <StatCard icon={Building2} label="Companies Participated" value={totalCompaniesParticipated} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Highest Package</p>
          <p className="text-2xl font-bold text-ink-900">₹{summary.highestPackage} LPA</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Average Package</p>
          <p className="text-2xl font-bold text-ink-900">₹{summary.averagePackage} LPA</p>
        </div>
      </div>
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
