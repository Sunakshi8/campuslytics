import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';
import { studentApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function StudentProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfile = () => {
    studentApi.getProfile().then((res) => {
      setProfile(res.data.profile);
      setSkillsInput((res.data.profile.skills || []).join(', '));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await studentApi.updateProfile({ ...profile, skills });
      setProfile(res.data.profile);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await studentApi.uploadResume(formData);
      setProfile(res.data.profile);
      setSkillsInput((res.data.profile.skills || []).join(', '));
      setMessage(`Resume parsed - found ${res.data.parsed.extractedSkills.length} matching skill(s).`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student" title="My Profile">
        <Spinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="My Profile" subtitle="Keep your details up to date for better matches.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSave} className="card space-y-4 p-6 lg:col-span-2">
          <h3 className="font-bold text-ink-900">Academic Details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              label="Branch"
              value={profile.branch || ''}
              onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-800">Year</span>
              <select
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                value={profile.year || ''}
                onChange={(e) => setProfile({ ...profile, year: e.target.value })}
              >
                <option value="">Select</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <TextInput
              label="CGPA"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={profile.cgpa || 0}
              onChange={(e) => setProfile({ ...profile, cgpa: Number(e.target.value) })}
            />
            <TextInput
              label="Active Backlogs"
              type="number"
              min="0"
              value={profile.backlogs || 0}
              onChange={(e) => setProfile({ ...profile, backlogs: Number(e.target.value) })}
            />
            <TextInput
              label="Roll Number"
              value={profile.rollNumber || ''}
              onChange={(e) => setProfile({ ...profile, rollNumber: e.target.value })}
            />
            <TextInput
              label="Phone"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <TextInput
            label="Skills (comma separated)"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="Python, React, DSA, SQL"
          />

          {message && <p className="flex items-center gap-1.5 text-sm text-green-600"><CheckCircle2 size={16} /> {message}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={saving}>Save Changes</Button>
        </form>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-3 font-bold text-ink-900">Resume</h3>
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl.startsWith('http') ? profile.resumeUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${profile.resumeUrl}`}
                target="_blank"
                rel="noreferrer"
                className="mb-3 block truncate rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700"
              >
                View current resume
              </a>
            ) : (
              <p className="mb-3 text-sm text-gray-400">No resume uploaded yet.</p>
            )}
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-brand-400">
              <UploadCloud className="text-gray-400" />
              <span className="text-sm font-semibold text-ink-700">
                {uploading ? 'Uploading & parsing...' : 'Upload PDF resume'}
              </span>
              <span className="text-xs text-gray-400">We'll auto-extract your skills</span>
              <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} disabled={uploading} />
            </label>
          </div>

          {profile.resumeParsed?.rawText && (
            <div className="card p-6">
              <h3 className="mb-2 font-bold text-ink-900">Extracted from Resume</h3>
              <p className="mb-1 text-xs text-gray-500">Email: {profile.resumeParsed.extractedEmail || 'Not found'}</p>
              <p className="mb-2 text-xs text-gray-500">Phone: {profile.resumeParsed.extractedPhone || 'Not found'}</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.resumeParsed.extractedSkills?.map((s) => (
                  <span key={s} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
