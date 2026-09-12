import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2, Pencil, Users2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import DriveForm from '../../components/company/DriveForm';
import { companyApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';

export default function MyDrives() {
  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    companyApi.listDrives().then((res) => setDrives(res.data.drives)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      if (editing) {
        await companyApi.updateDrive(editing._id, payload);
      } else {
        await companyApi.createDrive(payload);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this drive and all its applications?')) return;
    await companyApi.deleteDrive(id);
    load();
  };

  const toggleStatus = async (drive) => {
    await companyApi.updateDrive(drive._id, { status: drive.status === 'open' ? 'closed' : 'open' });
    load();
  };

  return (
    <DashboardLayout role="company" title="My Drives">
      <div className="mb-5 flex justify-end">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <PlusCircle size={16} /> Post New Drive
        </Button>
      </div>

      {showForm && (
        <div className="card mb-6 p-6">
          <h3 className="mb-4 font-bold text-ink-900">{editing ? 'Edit Drive' : 'Post a New Drive'}</h3>
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
          <DriveForm
            initial={editing}
            submitting={submitting}
            onSubmit={handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : drives.length === 0 ? (
        <EmptyState title="No drives posted yet" description="Click 'Post New Drive' to reach eligible students." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {drives.map((d) => (
            <div key={d._id} className="card p-5">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-bold text-ink-900">{d.title}</p>
                  <p className="text-xs text-gray-500">{d.jobType} · {d.location} · Apply by {new Date(d.applyBy).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${d.status === 'open' ? 'badge-selected' : 'badge-rejected'}`}>{d.status}</span>
              </div>
              <p className="mb-3 text-sm text-gray-500">₹{d.packageMin}-{d.packageMax} LPA · {d.applicantCount} applicant(s)</p>
              <div className="flex flex-wrap gap-2">
                <Link to={`/company/drives/${d._id}/applicants`}>
                  <Button variant="outline"><Users2 size={14} /> Applicants</Button>
                </Link>
                <Button variant="outline" onClick={() => { setEditing(d); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button variant="outline" onClick={() => toggleStatus(d)}>
                  {d.status === 'open' ? 'Close Drive' : 'Reopen'}
                </Button>
                <Button variant="danger" onClick={() => handleDelete(d._id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
