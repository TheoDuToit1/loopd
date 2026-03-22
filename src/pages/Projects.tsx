import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  FolderOpen, 
  Users, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'planning' });

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel('projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch projects');
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .insert([{
          name: newProject.name,
          description: newProject.description,
          status: newProject.status,
          owner_id: user.id
        }]);

      if (error) throw error;

      setShowNewModal(false);
      setNewProject({ name: '', description: '', status: 'planning' });
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-[var(--dark-grey)]">Manage all your active loops in one place.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          New Project
        </button>
      </header>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0C0C1E] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0C0C1E] border border-white/5 text-white rounded-xl hover:bg-white/5 transition-all">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-[#0C0C1E] animate-pulse rounded-2xl border border-white/5"></div>)}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-[var(--dark-grey)]">
            <FolderOpen size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No projects found</h3>
            <p className="text-[var(--dark-grey)]">Get started by creating your first loop.</p>
          </div>
          <button 
            onClick={() => setShowNewModal(true)}
            className="text-[#4F46E5] font-medium hover:underline"
          >
            Create a project
          </button>
        </div>
      )}

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0C0C1E] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Create New Project</h3>
                <button onClick={() => setShowNewModal(false)} className="text-[var(--dark-grey)] hover:text-white transition-colors">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Project Name</label>
                  <input 
                    required
                    type="text" 
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g. E-commerce Redesign"
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Description</label>
                  <textarea 
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Briefly describe the project scope..."
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--dark-grey)]">Initial Status</label>
                    <select 
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                      className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                    >
                      <option value="planning">Planning</option>
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="deployment">Deployment</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Link to={`/dashboard/projects/${project.id}`} className="bg-[#0C0C1E] border border-white/5 rounded-2xl p-6 hover:border-[#4F46E5]/50 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <button className="text-[var(--dark-grey)] hover:text-white">
          <MoreVertical size={20} />
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-[#4F46E5] group-hover:scale-110 transition-transform">
            <FolderOpen size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white group-hover:text-[#4F46E5] transition-colors">{project.name}</h4>
            <span className={cn(
              "status text-[10px] px-2 py-0.5",
              project.status === 'completed' ? 'completed' : project.status === 'development' ? 'process' : 'pending'
            )}>
              {project.status}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-[var(--dark-grey)] line-clamp-2 min-h-[40px]">
          {project.description || 'No description provided.'}
        </p>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[var(--dark-grey)]">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>1 member</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{project.created_at ? formatDate(new Date(project.created_at)) : 'Recently'}</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--dark-grey)] group-hover:text-white transition-colors" />
        </div>
      </div>
    </Link>
  );
}
