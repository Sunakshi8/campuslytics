import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  GraduationCap, LayoutDashboard, User, Search, FileText, Bookmark, Bell, Settings,
  Building2, ClipboardList, Users, BarChart3, LogOut, Sparkles,
  X,
} from 'lucide-react';
import { logout } from '../../app/features/authSlice';

const STUDENT_LINKS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/ai-skill-gap', label: 'AI Skill Gap & Roadmap', icon: Sparkles },
  { to: '/student/profile', label: 'My Profile', icon: User },
  { to: '/student/drives', label: 'Browse Drives', icon: Search },
  { to: '/student/applications', label: 'My Applications', icon: FileText },
  { to: '/student/saved-drives', label: 'Saved Drives', icon: Bookmark },
  { to: '/student/simulator', label: 'Eligibility Simulator', icon: BarChart3 },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
];

const COMPANY_LINKS = [
  { to: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/company/ai-copilot', label: 'AI Recruiter Copilot', icon: Sparkles },
  { to: '/company/profile', label: 'Company Profile', icon: Building2 },
  { to: '/company/drives', label: 'My Drives', icon: ClipboardList },
];

const TPO_LINKS = [
  { to: '/tpo/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tpo/ai-copilot', label: 'AI Placement Intel', icon: Sparkles },
  { to: '/tpo/students', label: 'Students', icon: Users },
  { to: '/tpo/companies', label: 'Companies', icon: Building2 },
  { to: '/tpo/drives', label: 'Drives', icon: ClipboardList },
  { to: '/tpo/analytics', label: 'Analytics', icon: BarChart3 },
];

const LINKS_BY_ROLE = { student: STUDENT_LINKS, company: COMPANY_LINKS, tpo: TPO_LINKS };

export default function Sidebar({ role, open = false, onClose }) {
  const links = LINKS_BY_ROLE[role] || [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {open && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-ink-900/50 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex h-screen w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-ink-900 text-gray-300 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-2 px-5 py-5">
        <GraduationCap className="h-6 w-6 text-brand-400" />
        <span className="text-lg font-bold text-white">Campuslytics</span>
        <button aria-label="Close navigation" onClick={onClose} className="ml-auto rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white md:hidden">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand-500 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 px-3 py-3">
        <NavLink
          to={`/${role}/settings`}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-brand-500 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
