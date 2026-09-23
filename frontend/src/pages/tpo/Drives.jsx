import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { tpoApi } from '../../api/endpoints';
import api from '../../api/client';

export default function TpoDrives() {
  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    tpoApi.drives().then((res) => setDrives(res.data.drives)).finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    const res = await api.get('/tpo/export/applications', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campuslytics-applications-report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <DashboardLayout role="tpo" title="All Placement Drives">
      <div className="mb-5 flex justify-end">
        <Button variant="outline" onClick={handleExport}>
          <Download size={16} /> Export Applications CSV
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : drives.length === 0 ? (
        <EmptyState title="No drives posted yet" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Package</th>
                <th className="px-5 py-3">Apply By</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drives.map((d) => (
                <tr key={d._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-ink-800">{d.company?.companyName}</td>
                  <td className="px-5 py-3 text-gray-600">{d.title}</td>
                  <td className="px-5 py-3 text-gray-600">₹{d.packageMin}-{d.packageMax} LPA</td>
                  <td className="px-5 py-3 text-gray-600">{new Date(d.applyBy).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${d.status === 'open' ? 'badge-selected' : 'badge-rejected'}`}>{d.status}</span>
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
