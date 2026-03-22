import { Outlet, Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  GitPullRequest, 
  FileText, 
  LogOut,
  HelpCircle,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { useTheme, hexToRgb, darkenColor } from '../../contexts/ThemeContext';

export default function PortalLayout() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { accentColor } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: `/portal/${projectId}` },
    { id: 'requests', label: 'My Requests', icon: GitPullRequest, path: `/portal/${projectId}/requests` },
    { id: 'docs', label: 'Guides & Docs', icon: FileText, path: `/portal/${projectId}/docs` },
  ];

  const rgb = hexToRgb(accentColor);
  const themeStyles = {
    '--accent-color': accentColor,
    '--accent-color-hover': darkenColor(accentColor, 10),
    '--accent-color-glow': rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : 'rgba(79, 70, 229, 0.2)',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-[#060714] flex flex-col" style={themeStyles}>
      {/* Top Header */}
      <header className="h-20 bg-[#0C0C1E] border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl bg-[#0C0C1E]/80">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-color)] to-[#7C3AED] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tighter">LoopD</span>
          </Link>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <span className="text-sm font-medium text-[var(--dark-grey)]">Client Portal</span>
        </div>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm text-[var(--dark-grey)] hover:text-white transition-colors">
            <HelpCircle size={18} />
            <span className="hidden sm:inline">Help Center</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 lg:p-12 gap-12">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0 space-y-8">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group",
                    isActive 
                      ? "bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color-glow)]" 
                      : "text-[var(--dark-grey)] hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-white"} />
                  {item.label}
                  {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 bg-gradient-to-br from-[var(--accent-color)]/10 to-purple-500/10 border border-white/5 rounded-2xl space-y-4">
            <div className="w-10 h-10 bg-[var(--accent-color)]/20 rounded-xl flex items-center justify-center text-[var(--accent-color)]">
              <MessageSquare size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Need Support?</h4>
              <p className="text-xs text-[var(--dark-grey)] leading-relaxed">Our team is here to help you with any questions.</p>
            </div>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all">
              Contact Team
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
