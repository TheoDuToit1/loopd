import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { 
  FileText, 
  GitPullRequest, 
  ChevronRight, 
  Clock, 
  CheckCircle2,
  ExternalLink,
  StickyNote
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export default function ClientPortal() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    fetchProjectData();

    const projectChannel = supabase
      .channel(`project_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'projects',
        filter: `id=eq.${projectId}`
      }, () => {
        fetchProjectData();
      })
      .subscribe();

    const requestsChannel = supabase
      .channel(`requests_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'change_requests',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchProjectData();
      })
      .subscribe();

    const notesChannel = supabase
      .channel(`notes_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notes',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchProjectData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(notesChannel);
    };
  }, [projectId]);

  const fetchProjectData = async () => {
    if (!projectId) return;

    const [projectRes, requestsRes, notesRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('change_requests').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('notes').select('*').eq('project_id', projectId).eq('visible_to_client', true).order('updated_at', { ascending: false })
    ]);

    if (projectRes.data) setProject(projectRes.data);
    if (requestsRes.data) setRequests(requestsRes.data);
    if (notesRes.data) setNotes(notesRes.data);
    
    setLoading(false);
  };

  if (loading) return null;
  if (!project) return <div className="text-white">Project not found.</div>;

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">Welcome to the Loop!</h1>
          <span className={cn(
            "status text-xs px-3 py-1",
            project.status === 'completed' ? 'completed' : project.status === 'development' ? 'process' : 'pending'
          )}>
            {project.status}
          </span>
        </div>
        <p className="text-xl text-[var(--dark-grey)] max-w-2xl">
          {project.description || 'Your project is in progress. Stay loopd for updates.'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-12">
          {/* Recent Requests */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">My Requests</h3>
              <Link to="requests" className="text-[#4F46E5] hover:underline flex items-center gap-1 text-sm">
                View all <ChevronRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {requests.slice(0, 3).map((request) => (
                <div key={request.id} className="bg-[#0C0C1E] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                      <GitPullRequest size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{request.title}</h4>
                      <p className="text-xs text-[var(--dark-grey)]">{formatDate(request.created_at ? new Date(request.created_at) : new Date())}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "status text-[10px] px-2 py-0.5",
                    request.status === 'completed' ? 'completed' : request.status === 'in-progress' ? 'process' : 'pending'
                  )}>
                    {request.status}
                  </span>
                </div>
              ))}
              {requests.length === 0 && (
                <div className="bg-[#0C0C1E] border border-white/5 p-8 rounded-2xl text-center space-y-4">
                  <p className="text-[var(--dark-grey)]">No requests submitted yet.</p>
                  <Link to="requests" className="inline-block px-6 py-2 bg-[#4F46E5] text-white rounded-lg font-medium">Submit Request</Link>
                </div>
              )}
            </div>
          </section>

          {/* Shared Notes */}
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Developer Updates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="bg-[#0C0C1E] border border-white/5 p-6 rounded-2xl space-y-4 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3 text-[#4F46E5]">
                    <StickyNote size={20} />
                    <h4 className="font-bold text-white">{note.title}</h4>
                  </div>
                  <p className="text-sm text-[var(--dark-grey)] line-clamp-3">{note.content.replace(/[#*`]/g, '')}</p>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[var(--dark-grey)]">
                    <span>{formatDate(note.updated_at ? new Date(note.updated_at) : new Date())}</span>
                    <button className="text-[#4F46E5] hover:underline">Read more</button>
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="col-span-full bg-[#0C0C1E] border border-white/5 p-8 rounded-2xl text-center">
                  <p className="text-[var(--dark-grey)]">No public updates yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-12">
          {/* Documentation */}
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Documentation</h3>
            <div className="bg-[#0C0C1E] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/5">
                <p className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Published Guides</p>
              </div>
              <div className="divide-y divide-white/5">
                <DocLink title="Getting Started Guide" />
                <DocLink title="API Documentation" />
                <DocLink title="Brand Guidelines" />
              </div>
              <Link to="docs" className="block p-4 text-center text-sm text-[#4F46E5] hover:bg-white/5 transition-all">
                View all documentation
              </Link>
            </div>
          </section>

          {/* Project Stats */}
          <section className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl p-8 text-white space-y-6 shadow-2xl shadow-indigo-500/20">
            <h3 className="text-xl font-bold">Project Health</h3>
            <div className="space-y-4">
              <HealthStat label="Uptime" value="99.9%" />
              <HealthStat label="Active Users" value="1,240" />
              <HealthStat label="Avg Response" value="2.4h" />
            </div>
            <button className="w-full py-3 bg-white text-[#4F46E5] rounded-xl font-bold hover:bg-opacity-90 transition-all">
              Download Report
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function DocLink({ title }: { title: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all group">
      <div className="flex items-center gap-3">
        <FileText size={18} className="text-[var(--dark-grey)] group-hover:text-[#4F46E5]" />
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <ChevronRight size={16} className="text-[var(--dark-grey)]" />
    </button>
  );
}

function HealthStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/20 pb-2">
      <span className="text-sm opacity-80">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
