import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap } from 'lucide-react';
import { studentSignup } from '../../app/features/authSlice';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function StudentSignup() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', branch: '', year: '', rollNumber: '',
  });
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const result = await dispatch(studentSignup(form));
    if (studentSignup.fulfilled.match(result)) {
      navigate('/student/dashboard');
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
        <h1 className="text-xl font-bold text-ink-900">Create your student account</h1>
        <p className="mt-1 text-sm text-gray-500">Start applying to internships and placement drives.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TextInput
            label="Full Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextInput
            label="Email"
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextInput
              label="Branch"
              placeholder="Computer Science"
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
            />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-800">Year</span>
              <select
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              >
                <option value="">Select</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
          </div>
          <TextInput
            label="Roll Number"
            value={form.rollNumber}
            onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
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
          Hiring, not studying?{' '}
          <Link to="/signup/company" className="font-semibold text-brand-600 hover:underline">Sign up as a company</Link>
        </p>
      </div>
    </div>
  );
}
