import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { tpoApi } from '../../api/endpoints';

export default function TpoCompanies() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    tpoApi.companies().then((res) => setCompanies(res.data.companies)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="tpo" title="Companies">
      {loading ? (
        <Spinner />
      ) : companies.length === 0 ? (
        <EmptyState title="No companies registered yet" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((c) => (
            <div key={c._id} className="card p-5">
              <p className="font-bold text-ink-900">{c.companyName}</p>
              <p className="text-sm text-gray-500">{c.industry} · {c.location}</p>
              <p className="mt-2 text-xs text-gray-400">{c.user?.email}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
