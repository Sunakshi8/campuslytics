import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GraduationCap } from 'lucide-react';
import { login } from '../../app/features/authSlice';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';

const ROLES = [
  { key: 'student', label: 'Student' },
  { key: 'company', label: 'Company' },
  { key: 'tpo', label: 'TPO / Admin' },
];

export default function Login() {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const result = await dispatch(login({ ...form, role }));
    if (login.fulfilled.match(result)) {
      navigate(`/${result.payload.user.role}/dashboard`);
    } else {
      setLocalError(result.payload || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-ink-900 p-10 text-white md:flex">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-brand-400" />
          <span className="text-lg font-bold">Campuslytics</span>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-300">Placement &amp; Internship Portal</p>
          <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight">
            "Opportunities don't happen, you create them."
          </h2>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Campuslytics</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#f7f5f2] px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold text-ink-900">Welcome Back! 👋</h1>
          <p className="mt-1 text-sm text-gray-500">Login to your account to continue.</p>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1">
            {ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`rounded-md py-2 text-xs font-semibold transition ${
                  role === r.key ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <TextInput
              label="Email or Registration Number"
              type="text"
              required
              placeholder="Enter your email or registration number"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextInput
              label="Password"
              type="password"
              required
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {localError && <p className="text-sm text-red-500">{localError}</p>}
            <Button type="submit" className="w-full" loading={status === 'loading'}>
              Login
            </Button>
          </form>

          {role !== 'tpo' && (
            <p className="mt-5 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to={`/signup/${role}`} className="font-semibold text-brand-600 hover:underline">
                Sign Up
              </Link>
            </p>
          )}

          <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-4 text-xs text-gray-500">
            <p className="mb-1 font-semibold text-ink-700">Demo accounts (password: Password@123)</p>
            <p>Student: student@campuslytics.com</p>
            <p>Company: google@campuslytics.com</p>
            <p>TPO: tpo@campuslytics.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
