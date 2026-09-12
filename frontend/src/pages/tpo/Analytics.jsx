import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { tpoApi } from '../../api/endpoints';

const COLORS = ['#e85d25', '#f17842', '#f69d6e', '#fac4a6', '#fde3d3', '#8f2d19'];

export default function TpoAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    tpoApi.analytics().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout role="tpo" title="Analytics Dashboard">
        <Spinner />
      </DashboardLayout>
    );
  }

  const { summary, departmentWise, companyParticipation, totalCompaniesParticipated } = data;

  return (
    <DashboardLayout role="tpo" title="Analytics Dashboard" subtitle="Placement Analytics">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Students" value={summary.totalStudents} />
        <MetricCard label="Placed Students" value={summary.placedStudents} />
        <MetricCard label="Total Drives" value={summary.totalDrives} />
        <MetricCard label="Highest Package" value={`₹${summary.highestPackage} LPA`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-bold text-ink-900">Department-wise Placement Rate</h3>
          {departmentWise.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No department data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentWise}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe4" />
                <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="placementRate" fill="#e85d25" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink-900">Company Participation</h3>
            <span className="text-sm text-gray-500">{totalCompaniesParticipated} companies</span>
          </div>
          {companyParticipation.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No applications recorded yet.</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={companyParticipation} dataKey="applications" nameKey="company" innerRadius={55} outerRadius={80}>
                    {companyParticipation.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 text-sm">
                {companyParticipation.slice(0, 6).map((c, i) => (
                  <div key={c.company} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-ink-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {c.company}
                    </span>
                    <span className="font-semibold text-ink-900">{c.sharePercent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h3 className="mb-4 font-bold text-ink-900">Average Package Insight</h3>
        <p className="text-sm text-gray-500">
          Average package across all selected students: <span className="font-bold text-ink-900">₹{summary.averagePackage} LPA</span>
        </p>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink-900">{value}</p>
    </div>
  );
}
