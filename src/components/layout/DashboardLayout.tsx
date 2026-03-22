import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronRight,
  FolderOpen,
  Bell,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  CreditCard,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useTheme, hexToRgb, darkenColor } from '../../contexts/ThemeContext';

export default function DashboardLayout({ user }: { user: any }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { accentColor } = useTheme();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FolderOpen size={20} />, label: 'Projects', path: '/dashboard/projects' },
    { icon: <TrendingUp size={20} />, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: <Users size={20} />, label: 'Team', path: '/dashboard/team' },
    { icon: <Building2 size={20} />, label: 'Clients', path: '/dashboard/clients' },
    { icon: <Calendar size={20} />, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: <Clock size={20} />, label: 'Time Tracking', path: '/dashboard/time' },
    { icon: <CreditCard size={20} />, label: 'Billing', path: '/dashboard/billing' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
  ];

  const rgb = hexToRgb(accentColor);
  const themeStyles = {
    '--accent-color': accentColor,
    '--accent-color-hover': darkenColor(accentColor, 10),
    '--accent-color-glow': rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : 'rgba(79, 70, 229, 0.2)',
  } as React.CSSProperties;

  return (
    <div className="flex h-screen bg-[#060714] overflow-hidden" style={themeStyles}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className="bg-[#0C0C1E] border-r border-white/5 flex flex-col transition-all z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-color)] to-[#7C3AED] rounded-lg flex items-center justify-center shrink-0">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          {sidebarOpen && <span className="text-xl font-bold text-white tracking-tight">LoopD</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                location.pathname === item.path 
                  ? "bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color-glow)]" 
                  : "text-[var(--dark-grey)] hover:text-white hover:bg-white/5"
              )}
            >
              <div className={cn("shrink-0", location.pathname === item.path ? "text-white" : "group-hover:text-white")}>
                {item.icon}
              </div>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div className={cn("flex items-center gap-3 p-2 rounded-xl", sidebarOpen && "bg-white/5")}>
            <div className="w-10 h-10 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white font-bold shrink-0">
              {user.user_metadata?.display_name?.[0] || user.email?.[0] || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.user_metadata?.display_name || 'User'}</p>
                <p className="text-xs text-[var(--dark-grey)] truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-[var(--dark-grey)] hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0C0C1E]/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-[var(--dark-grey)]"
            >
              <ChevronRight className={cn("transition-transform", sidebarOpen && "rotate-180")} />
            </button>
            <h2 className="text-lg font-semibold text-white">
              {navItems.find(i => i.path === location.pathname)?.label || 'Project Workspace'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[var(--dark-grey)] hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
