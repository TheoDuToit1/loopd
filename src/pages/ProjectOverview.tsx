import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { 
  Users, 
  Bug, 
  GitPullRequest, 
  Clock, 
  Calendar,
  ExternalLink,
  Shield,
  FileText,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectOverview() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [stats, setStats] = useState({
    bugs: 0,
    requests: 0,
    files: 0,
    notes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    fetchProjectData();

    const projectChannel = supabase
      .channel(`project_overview_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'projects',
        filter: `id=eq.${projectId}`
      }, () => {
        fetchProjectData();
      })
      .subscribe();

    const bugsChannel = supabase
      .channel(`bugs_overview_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bugs',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchStats();
      })
      .subscribe();

    const requestsChannel = supabase
      .channel(`requests_overview_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'change_requests',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchStats();
      })
      .subscribe();

    const filesChannel = supabase
      .channel(`files_overview_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'files',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchStats();
      })
      .subscribe();

    const notesChannel = supabase
      .channel(`notes_overview_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notes',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(bugsChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(filesChannel);
      supabase.removeChannel(notesChannel);
    };
  }, [projectId]);

  const fetchProjectData = async () => {
    if (!projectId) return;
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (data) setProject(data);
    setLoading(false);
    fetchStats();
  };

  const fetchStats = async () => {
    if (!projectId) return;
    const [bugsRes, requestsRes, filesRes, notesRes] = await Promise.all([
      supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('change_requests').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('files').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('notes').select('*', { count: 'exact', head: true }).eq('project_id', projectId)
    ]);

    setStats({
      bugs: bugsRes.count || 0,
      requests: requestsRes.count || 0,
      files: filesRes.count || 0,
      notes: notesRes.count || 0
    });
  };

  if (loading) return null;

  const statCards = [
    { label: 'Open Bugs', value: stats.bugs, icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Change Requests', value: stats.requests, icon: GitPullRequest, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Project Files', value: stats.files, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Shared Notes', value: stats.notes, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">About this Project</h3>
            <p className="text-[var(--dark-grey)] leading-relaxed">
              {project?.description || 'No description provided for this project.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-[var(--dark-grey)] bg-white/5 px-3 py-1.5 rounded-full">
                <Calendar size={14} />
                Created {project?.created_at ? formatDistanceToNow(new Date(project.created_at), { addSuffix: true }) : 'Recently'}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--dark-grey)] bg-white/5 px-3 py-1.5 rounded-full">
                <Clock size={14} />
                Last updated {project?.updated_at ? formatDistanceToNow(new Date(project.updated_at), { addSuffix: true }) : 'Recently'}
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <Shield size={14} />
                {project?.status || 'Active'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3", stat.bg)}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-[var(--dark-grey)] uppercase tracking-wider font-bold mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Client Portal</h3>
            <p className="text-sm text-[var(--dark-grey)] mb-6">
              Share this link with your client to give them access to the project portal.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/portal/${projectId}`;
                  navigator.clipboard.writeText(url);
                }}
                className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
              >
                <span className="text-xs text-white font-mono truncate mr-2">/portal/{projectId}</span>
                <ExternalLink size={14} className="text-[var(--dark-grey)] group-hover:text-white" />
              </button>
              <p className="text-[10px] text-[var(--dark-grey)] text-center italic">
                Clients can view bugs, requests, and shared docs.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Team Members</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  JD
                </div>
                <div>
                  <p className="text-sm font-bold text-white">John Doe</p>
                  <p className="text-[10px] text-[var(--dark-grey)]">Project Owner</p>
                </div>
              </div>
              <button className="w-full py-2 border border-dashed border-white/10 rounded-xl text-xs text-[var(--dark-grey)] hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <Users size={14} />
                Manage Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
