import { useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';

export default function Settings() {
  const { user } = useSelector((s) => s.auth);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <DashboardLayout role={user?.role} title="Settings">
      <div className="max-w-lg space-y-6">
        <div className="card p-6">
          <h3 className="mb-4 font-bold text-ink-900">Account</h3>
          <div className="space-y-4">
            <TextInput label="Name" value={user?.name || ''} disabled />
            <TextInput label="Email" value={user?.email || ''} disabled />
            <TextInput label="Role" value={user?.role || ''} disabled className="capitalize" />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-bold text-ink-900">Notification Preferences</h3>
          <label className="flex items-center justify-between">
            <span className="text-sm text-ink-700">Email me about status changes &amp; deadlines</span>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="h-5 w-9 accent-brand-500"
            />
          </label>
        </div>

        <Button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          Save Preferences
        </Button>
        {saved && <p className="text-sm text-green-600">Preferences saved.</p>}
      </div>
    </DashboardLayout>
  );
}
