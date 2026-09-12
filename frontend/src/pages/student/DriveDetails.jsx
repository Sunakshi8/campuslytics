import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Briefcase, IndianRupee } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { studentApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';

const TABS = ['Overview', 'Eligibility', 'Roles & Responsibilities', 'About Company'];

export default function DriveDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    studentApi.getDrive(id).then((res) => setData(res.data));
  };

  useEffect(() => { load(); }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setError('');
    setMessage('');
    try {
      await studentApi.apply(id);
      setMessage('Application submitted successfully!');
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    await studentApi.toggleSave(id);
    load();
  };

  if (!data) {
    return (
      <DashboardLayout role="student" title="Drive Details">
        <Spinner />
      </DashboardLayout>
    );
  }

  const { drive, eligible, reasons, matchScore, hasApplied, applicationStatus, isSaved } = data;

  return (
    <DashboardLayout role="student" title="Drive Details">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-ink-800">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card mb-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink-900">{drive.company?.companyName}</h2>
            <p className="text-gray-500">{drive.title}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={14} /> {drive.location}</span>
              <span className="flex items-center gap-1"><IndianRupee size={14} /> {drive.packageMin}-{drive.packageMax} LPA</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Apply by {new Date(drive.applyBy).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className={`mb-2 text-sm font-semibold ${eligible ? 'text-green-600' : 'text-amber-600'}`}>
              {eligible ? 'You are eligible' : 'Not currently eligible'}
            </p>
            <p className="text-xs text-gray-400">Resume match: {matchScore}%</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition ${
              tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-ink-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card mb-6 p-6">
        {tab === 'Overview' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{drive.description}</p>
            <div className="grid grid-cols-3 gap-4">
              <InfoBlock icon={Briefcase} label="Batch" value={drive.batch || 'N/A'} />
              <InfoBlock icon={Briefcase} label="Job Type" value={drive.jobType} />
              <InfoBlock icon={IndianRupee} label="Stipend" value={drive.stipend ? `₹${drive.stipend}/mo` : 'N/A'} />
            </div>
          </div>
        )}
        {tab === 'Eligibility' && (
          <div className="space-y-2 text-sm">
            <p><b>Min CGPA:</b> {drive.eligibility?.minCgpa ?? 'None'}</p>
            <p><b>Eligible branches:</b> {drive.eligibility?.branches?.length ? drive.eligibility.branches.join(', ') : 'All branches'}</p>
            <p><b>Eligible years:</b> {drive.eligibility?.years?.length ? drive.eligibility.years.join(', ') : 'All years'}</p>
            <p><b>Max backlogs:</b> {drive.eligibility?.maxBacklogs ?? 0}</p>
            <p><b>Required skills:</b> {drive.eligibility?.requiredSkills?.join(', ') || 'None'}</p>
            {!eligible && reasons?.length > 0 && (
              <div className="mt-4 rounded-lg bg-amber-50 p-3 text-amber-700">
                <p className="mb-1 font-semibold">Why you're not eligible:</p>
                <ul className="list-disc space-y-1 pl-5">
                  {reasons.map((r, i) => <li key={i}>{r.message}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
        {tab === 'Roles & Responsibilities' && (
          <p className="text-sm text-gray-600">{drive.rolesResponsibilities || 'Not specified.'}</p>
        )}
        {tab === 'About Company' && (
          <div className="space-y-2 text-sm text-gray-600">
            <p>{drive.company?.description || 'No description provided.'}</p>
            {drive.company?.website && (
              <a href={drive.company.website} target="_blank" rel="noreferrer" className="font-semibold text-brand-600 hover:underline">
                Visit website
              </a>
            )}
          </div>
        )}
      </div>

      {message && <p className="mb-3 text-sm text-green-600">{message}</p>}
      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        {hasApplied ? (
          <Button variant="outline" disabled className="cursor-default">
            Application Status: {applicationStatus}
          </Button>
        ) : (
          <Button onClick={handleApply} loading={applying} disabled={!eligible}>
            Apply Now
          </Button>
        )}
        <Button variant="outline" onClick={handleSave}>
          {isSaved ? 'Saved ✓' : 'Save'}
        </Button>
      </div>
    </DashboardLayout>
  );
}

function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs text-gray-400"><Icon size={12} /> {label}</p>
      <p className="font-semibold text-ink-800">{value}</p>
    </div>
  );
}
