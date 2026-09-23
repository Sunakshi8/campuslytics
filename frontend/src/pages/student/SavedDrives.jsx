import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { studentApi } from '../../api/endpoints';
import { Bookmark } from 'lucide-react';

export default function SavedDrives() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState([]);

  const load = () => {
    setLoading(true);
    studentApi.savedDrives().then((res) => setSaved(res.data.saved)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUnsave = async (driveId) => {
    await studentApi.toggleSave(driveId);
    load();
  };

  return (
    <DashboardLayout role="student" title="Saved Drives">
      {loading ? (
        <Spinner />
      ) : saved.length === 0 ? (
        <EmptyState icon={Bookmark} title="No saved drives" description="Bookmark drives while browsing to find them here later." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {saved.map((s) => (
            <div key={s._id} className="card flex flex-col p-5">
              <p className="font-bold text-ink-900">{s.drive?.company?.companyName}</p>
              <p className="mb-3 text-sm text-gray-500">{s.drive?.title}</p>
              <div className="mt-auto flex gap-2">
                <Link to={`/student/drives/${s.drive?._id}`} className="flex-1">
                  <Button className="w-full">View</Button>
                </Link>
                <Button variant="outline" onClick={() => handleUnsave(s.drive?._id)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
