import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BrowserRouter, Routes, Route, Navigate, Link, useParams, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import PortalLayout from './components/layout/PortalLayout';

// Pages
import Login from './pages/Login';
import Landing from './pages/Landing';
import DashboardHome from './pages/DashboardHome';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import BugTracker from './pages/BugTracker';
import ChangeRequests from './pages/ChangeRequests';
import Vault from './pages/Vault';
import Files from './pages/Files';
import Notes from './pages/Notes';
import Docs from './pages/Docs';
import Settings from './pages/Settings';
import ClientPortal from './pages/ClientPortal';
import AcceptInvite from './pages/AcceptInvite';
import ProjectOverview from './pages/ProjectOverview';
import ProjectSettings from './pages/ProjectSettings';
import ClientRequests from './pages/ClientRequests';
import ClientDocs from './pages/ClientDocs';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Clients from './pages/Clients';
import Calendar from './pages/Calendar';
import Billing from './pages/Billing';
import TimeTracking from './pages/TimeTracking';

import { ThemeProvider } from './contexts/ThemeContext';
import CookieConsent from './components/CookieConsent';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }
        setUser(user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#060714]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-right" theme="dark" />
        <CookieConsent />
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Landing /> : <Navigate to={profile?.role === 'client' ? '/portal' : '/dashboard'} />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={<Login isRegister />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        {/* Developer Dashboard Routes */}
        <Route path="/dashboard" element={user && profile?.role !== 'client' ? <DashboardLayout user={user} /> : <Navigate to="/" />}>
          <Route index element={<DashboardHome user={user!} />} />
          <Route path="projects" element={<Projects />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="team" element={<Team />} />
          <Route path="clients" element={<Clients />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="billing" element={<Billing />} />
          <Route path="time" element={<TimeTracking />} />
          <Route path="projects/:projectId" element={<ProjectDetail />}>
            <Route index element={<Navigate to="overview" />} />
            <Route path="overview" element={<ProjectOverview />} />
            <Route path="bugs" element={<BugTracker />} />
            <Route path="requests" element={<ChangeRequests />} />
            <Route path="vault" element={<Vault />} />
            <Route path="files" element={<Files />} />
            <Route path="notes" element={<Notes />} />
            <Route path="docs" element={<Docs />} />
            <Route path="settings" element={<ProjectSettings />} />
          </Route>
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Client Portal Routes */}
        <Route path="/portal" element={user ? <PortalLayout /> : <Navigate to="/login" />}>
          <Route index element={<div className="p-8 text-white">Please select a project from your dashboard.</div>} />
          <Route path=":projectId" element={<ClientPortal />} />
          <Route path=":projectId/requests" element={<ClientRequests />} />
          <Route path=":projectId/docs" element={<ClientDocs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
  );
}
