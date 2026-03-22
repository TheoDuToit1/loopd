import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AlertTriangle } from 'lucide-react';

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
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    try {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      }).catch(err => {
        if (err.message.includes('Missing Supabase environment variables')) {
          setIsConfigured(false);
          setLoading(false);
        }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } catch (err: any) {
      if (err.message.includes('Missing Supabase environment variables')) {
        setIsConfigured(false);
        setLoading(false);
      } else {
        console.error('App initialization error:', err);
        setLoading(false);
      }
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#060714]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#060714] p-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Configuration Required</h1>
            <p className="text-[var(--dark-grey)]">
              Supabase environment variables are missing. Please configure <code className="text-indigo-400">VITE_SUPABASE_URL</code> and <code className="text-indigo-400">VITE_SUPABASE_ANON_KEY</code> in the AI Studio settings.
            </p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left text-xs font-mono text-[var(--dark-grey)]">
            1. Go to Settings menu<br/>
            2. Add VITE_SUPABASE_URL<br/>
            3. Add VITE_SUPABASE_ANON_KEY<br/>
            4. Restart the application
          </div>
        </div>
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
