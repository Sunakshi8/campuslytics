import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, IndianRupee } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { studentApi } from '../../api/endpoints';

export default function BrowseDrives() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState('');
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const load = () => {
    setLoading(true);
    studentApi
      .browseDrives({ search, eligibleOnly: eligibleOnly ? 'true' : undefined })
      .then((res) => setResults(res.data.results))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, eligibleOnly]);

  const handleSave = async (id) => {
    await studentApi.toggleSave(id);
    load();
  };

  return (
    <DashboardLayout role="student" title="Browse Placement Drives" showSearch onSearch={setSearch}>
      <div className="mb-5 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
          <input type="checkbox" checked={eligibleOnly} onChange={(e) => setEligibleOnly(e.target.checked)} className="h-4 w-4 accent-brand-500" />
          Show only drives I'm eligible for
        </label>
        <p className="text-sm text-gray-500">{results.length} drive(s) found</p>
      </div>

      {loading ? (
        <Spinner />
      ) : results.length === 0 ? (
        <EmptyState title="No drives found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map(({ drive, eligible, matchScore }) => (
            <div key={drive._id} className="card flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-bold text-ink-900">{drive.company?.companyName}</p>
                  <p className="text-sm text-gray-500">{drive.title}</p>
                </div>
                <button onClick={() => handleSave(drive._id)} className="text-gray-300 hover:text-brand-500">
                  <Bookmark size={18} />
                </button>
              </div>
              <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={12} /> {drive.location || 'Remote'}</span>
                <span className="flex items-center gap-1"><IndianRupee size={12} /> {drive.packageMin}-{drive.packageMax} LPA</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {(drive.tags || []).slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{t}</span>
                ))}
              </div>
              <div className="mb-4 flex items-center justify-between text-xs">
                <span className={eligible ? 'font-semibold text-green-600' : 'font-semibold text-amber-600'}>
                  {eligible ? 'Eligible' : 'Not currently eligible'}
                </span>
                <span className="text-gray-400">Match: {matchScore}%</span>
              </div>
              <Link to={`/student/drives/${drive._id}`} className="mt-auto">
                <Button variant={eligible ? 'primary' : 'outline'} className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
