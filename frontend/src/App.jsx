import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import StudentSignup from './pages/auth/StudentSignup';
import CompanySignup from './pages/auth/CompanySignup';

import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import BrowseDrives from './pages/student/BrowseDrives';
import DriveDetails from './pages/student/DriveDetails';
import StudentApplications from './pages/student/Applications';
import SavedDrives from './pages/student/SavedDrives';
import EligibilitySimulator from './pages/student/EligibilitySimulator';
import Notifications from './pages/student/Notifications';
import Settings from './pages/student/Settings';

import CompanyDashboard from './pages/company/Dashboard';
import CompanyProfile from './pages/company/Profile';
import MyDrives from './pages/company/MyDrives';
import Applicants from './pages/company/Applicants';

import TpoDashboard from './pages/tpo/Dashboard';
import TpoStudents from './pages/tpo/Students';
import TpoCompanies from './pages/tpo/Companies';
import TpoDrives from './pages/tpo/Drives';
import TpoAnalytics from './pages/tpo/Analytics';

import ProtectedRoute from './routes/ProtectedRoute';

function RootRedirect() {
  const { user, token } = useSelector((s) => s.auth);
  if (token && user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <Landing />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/student" element={<StudentSignup />} />
        <Route path="/signup/company" element={<CompanySignup />} />

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/drives" element={<BrowseDrives />} />
          <Route path="/student/drives/:id" element={<DriveDetails />} />
          <Route path="/student/applications" element={<StudentApplications />} />
          <Route path="/student/saved-drives" element={<SavedDrives />} />
          <Route path="/student/simulator" element={<EligibilitySimulator />} />
          <Route path="/student/notifications" element={<Notifications />} />
          <Route path="/student/settings" element={<Settings />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['company']} />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
          <Route path="/company/drives" element={<MyDrives />} />
          <Route path="/company/drives/:id/applicants" element={<Applicants />} />
          <Route path="/company/notifications" element={<Notifications />} />
          <Route path="/company/settings" element={<Settings />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['tpo']} />}>
          <Route path="/tpo/dashboard" element={<TpoDashboard />} />
          <Route path="/tpo/students" element={<TpoStudents />} />
          <Route path="/tpo/companies" element={<TpoCompanies />} />
          <Route path="/tpo/drives" element={<TpoDrives />} />
          <Route path="/tpo/analytics" element={<TpoAnalytics />} />
          <Route path="/tpo/notifications" element={<Notifications />} />
          <Route path="/tpo/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
