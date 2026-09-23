import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap } from 'lucide-react';
import { companySignup } from '../../app/features/authSlice';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';

export default function CompanySignup() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', companyName: '', industry: '', website: '', location: '',
  });
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const result = await dispatch(companySignup(form));
    if (companySignup.fulfilled.match(result)) {
      navigate('/company/dashboard');
    } else {
      setLocalError(result.payload || 'Signup failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f2] px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-brand-500" />
          <span className="text-lg font-bold text-ink-900">Campuslytics</span>
        </div>
        <h1 className="text-xl font-bold text-ink-900">Create your company account</h1>
        <p className="mt-1 text-sm text-gray-500">Post drives and hire straight from campus.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TextInput
            label="Recruiter Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextInput
            label="Company Name"
            required
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
          <TextInput
            label="Work Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextInput
            label="Password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Industry"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
            <TextInput
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <TextInput
            label="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          {localError && <p className="text-sm text-red-500">{localError}</p>}
          <Button type="submit" className="w-full" loading={status === 'loading'}>
            Create Account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">Login</Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          Looking for a job instead?{' '}
          <Link to="/signup/student" className="font-semibold text-brand-600 hover:underline">Sign up as a student</Link>
        </p>
      </div>
    </div>
  );
}
