import { Link } from 'react-router-dom';
import { GraduationCap, PlayCircle, Building2, Users, TrendingUp } from 'lucide-react';

const STATS = [
  { label: 'Companies', value: '500+' },
  { label: 'Students', value: '10K+' },
  { label: 'Placements', value: '500+' },
  { label: 'Success Rate', value: '95%' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-brand-500" />
          <span className="text-lg font-bold text-ink-900">Campuslytics</span>
        </div>
        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <a href="#features" className="hover:text-brand-600">Opportunities</a>
          <a href="#analytics" className="hover:text-brand-600">Analytics</a>
          <a href="#about" className="hover:text-brand-600">About</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-ink-800 hover:text-brand-600">
            Login
          </Link>
          <Link
            to="/signup/student"
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-8 py-16 md:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
            Your Campus. Your Career.
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-ink-900 md:text-5xl">
            Placement &amp; Internship Portal for a{' '}
            <span className="text-brand-500">Brighter Future</span>
          </h1>
          <p className="mt-5 max-w-md text-gray-600">
            Connect with top companies, discover opportunities, track your applications, and get
            insights — all in one place.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              to="/signup/student"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-brand-600"
            >
              Get Started &rarr;
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-ink-800 hover:bg-white">
              <PlayCircle size={18} /> Watch Demo
            </button>
          </div>
          <div className="mt-10 grid grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-extrabold text-ink-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-brand-100 to-brand-50 p-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card flex flex-col items-center gap-2 p-5 text-center">
              <Building2 className="text-brand-500" />
              <p className="text-sm font-semibold text-ink-800">For Companies</p>
              <p className="text-xs text-gray-500">Post drives, screen applicants automatically</p>
            </div>
            <div className="card flex flex-col items-center gap-2 p-5 text-center">
              <Users className="text-brand-500" />
              <p className="text-sm font-semibold text-ink-800">For Students</p>
              <p className="text-xs text-gray-500">Apply, track status, simulate eligibility</p>
            </div>
            <div className="card flex flex-col items-center gap-2 p-5 text-center">
              <TrendingUp className="text-brand-500" />
              <p className="text-sm font-semibold text-ink-800">For TPOs</p>
              <p className="text-xs text-gray-500">Manage placements, view live analytics</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Campuslytics. All rights reserved.
      </footer>
    </div>
  );
}
