import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitPullRequest, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function ClientRequests() {
  const { projectId } = useParams();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (!projectId) return;

    fetchRequests();

    const channel = supabase
      .channel(`requests_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'change_requests',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchRequests = async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from('change_requests')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (data) setRequests(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('change_requests')
        .insert([{
          ...newRequest,
          project_id: projectId,
          status: 'submitted'
        }]);

      if (error) throw error;

      toast.success('Change request submitted successfully');
      setShowAddModal(false);
      setNewRequest({ title: '', description: '', priority: 'medium' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit change request');
    }
  };

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'in-progress': return <Clock size={16} className="text-blue-500" />;
      case 'testing': return <AlertCircle size={16} className="text-amber-500" />;
      default: return <GitPullRequest size={16} className="text-[var(--dark-grey)]" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Change Requests</h2>
          <p className="text-sm text-[var(--dark-grey)]">Request new features, design changes, or improvements.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
          New Request
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
        <input 
          type="text"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#4F46E5] transition-all"
        />
      </div>

      <div className="space-y-4">
        {filteredRequests.map((request, i) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                    request.priority === 'high' ? "bg-red-500/10 text-red-500" :
                    request.priority === 'medium' ? "bg-amber-500/10 text-amber-500" :
                    "bg-blue-500/10 text-blue-500"
                  )}>
                    {request.priority}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#4F46E5] transition-colors">
                    {request.title}
                  </h3>
                </div>
                <p className="text-sm text-[var(--dark-grey)] line-clamp-2">
                  {request.description}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--dark-grey)]">
                    <Clock size={14} />
                    {request.created_at ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true }) : 'Recently'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--dark-grey)]">
                    <MessageSquare size={14} />
                    0 comments
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  {getStatusIcon(request.status)}
                  <span className="text-xs font-bold text-white capitalize">{request.status.replace('-', ' ')}</span>
                </div>
                <ChevronRight size={20} className="text-[var(--dark-grey)] group-hover:text-white transition-all" />
              </div>
            </div>
          </motion.div>
        ))}

        {filteredRequests.length === 0 && !loading && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
              <GitPullRequest size={32} className="text-[var(--dark-grey)] opacity-20" />
            </div>
            <p className="text-[var(--dark-grey)]">No change requests found.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0C0C1E] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">New Change Request</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Title</label>
                  <input 
                    type="text"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                    placeholder="Brief summary of the request"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Description</label>
                  <textarea 
                    value={newRequest.description}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all resize-none"
                    placeholder="Detailed explanation of what you'd like to change..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Priority</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewRequest(prev => ({ ...prev, priority: p }))}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                          newRequest.priority === p 
                            ? "bg-[#4F46E5] border-[#4F46E5] text-white" 
                            : "bg-white/5 border-white/10 text-[var(--dark-grey)] hover:bg-white/10"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Submit Request
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
