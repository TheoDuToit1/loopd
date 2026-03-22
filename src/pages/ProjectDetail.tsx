import { useState, useEffect } from 'react';
import { useParams, Outlet, NavLink, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Bug, 
  GitPullRequest, 
  Lock, 
  FileText, 
  Settings, 
  ChevronLeft,
  ExternalLink,
  Share2,
  StickyNote
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = onSnapshot(doc(db, 'projects', projectId), (doc) => {
      if (doc.exists()) {
        setProject({ id: doc.id, ...doc.data() });
      } else {
        toast.error('Project not found');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'bugs', label: 'Bugs', icon: <Bug size={18} /> },
    { id: 'requests', label: 'Requests', icon: <GitPullRequest size={18} /> },
    { id: 'vault', label: 'Vault', icon: <Lock size={18} /> },
    { id: 'files', label: 'Files', icon: <FileText size={18} /> },
    { id: 'notes', label: 'Notes', icon: <StickyNote size={18} /> },
    { id: 'docs', label: 'Docs', icon: <FileText size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#060714]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Project Header */}
      <header className="bg-[#0C0C1E] border-b border-white/5 px-8 pt-8 pb-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/projects" className="p-2 hover:bg-white/5 rounded-lg text-[var(--dark-grey)] hover:text-white transition-all">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
                <span className={cn(
                  "status text-[10px] px-2 py-0.5",
                  project.status === 'completed' ? 'completed' : project.status === 'development' ? 'process' : 'pending'
                )}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-[var(--dark-grey)]">{project.description || 'No description provided.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to={`/portal/${projectId}`} 
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg font-medium hover:bg-white/10 transition-all text-sm"
            >
              <ExternalLink size={16} />
              Client Portal
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-all text-sm shadow-lg shadow-indigo-500/20">
              <Share2 size={16} />
              Invite Client
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              to={tab.id}
              className={({ isActive }) => cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative",
                isActive 
                  ? "text-white" 
                  : "text-[var(--dark-grey)] hover:text-white hover:bg-white/5 rounded-t-xl"
              )}
            >
              {({ isActive }) => (
                <>
                  {tab.icon}
                  {tab.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-[#060714]">
        <Outlet />
      </div>
    </div>
  );
}
