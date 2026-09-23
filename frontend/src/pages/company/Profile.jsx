import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';
import { companyApi } from '../../api/endpoints';

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    companyApi.getProfile().then((res) => setProfile(res.data.profile)).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await companyApi.updateProfile(profile);
    setProfile(res.data.profile);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading || !profile) {
    return (
      <DashboardLayout role="company" title="Company Profile">
        <Spinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="company" title="Company Profile">
      <form onSubmit={handleSave} className="card max-w-2xl space-y-4 p-6">
        <TextInput label="Company Name" value={profile.companyName || ''} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Industry" value={profile.industry || ''} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} />
          <TextInput label="Location" value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
        </div>
        <TextInput label="Website" value={profile.website || ''} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-800">Description</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            value={profile.description || ''}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          />
        </label>
        <Button type="submit" loading={saving}>Save Changes</Button>
        {saved && <p className="text-sm text-green-600">Profile updated.</p>}
      </form>
    </DashboardLayout>
  );
}
