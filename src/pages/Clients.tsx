import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Building2, 
  MoreVertical, 
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ExternalLink,
  Globe,
  Loader2,
  Copy,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    fetchClients();
    fetchProjects();

    const channel = supabase
      .channel('public:profiles_clients')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles',
        filter: 'role=eq.client'
      }, () => {
        fetchClients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('full_name', { ascending: true });

    if (error) {
      toast.error('Failed to fetch clients');
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error('Failed to fetch projects');
    } else {
      setProjects(data || []);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }
    setInviting(true);
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const project = projects.find(p => p.id === selectedProjectId);

      const { error } = await supabase
        .from('project_invites')
        .insert([{
          token,
          project_id: selectedProjectId,
          project_name: project?.name || 'Unknown Project',
          role: 'client',
          email: inviteEmail,
          client_name: inviteName,
          accepted: false
        }]);

      if (error) throw error;

      const link = `${window.location.origin}/accept-invite?token=${token}`;
      setInviteLink(link);
      toast.success('Invitation link generated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate invitation');
    } finally {
      setInviting(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  const filteredClients = clients.filter(c => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
            <Building2 className="text-[#4F46E5]" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Client Management</h2>
            <p className="text-sm text-[var(--dark-grey)]">Manage your clients and their portal access.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20"
        >
          <UserPlus size={20} />
          Add Client
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
          <input 
            type="text"
            placeholder="Search clients by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#4F46E5] transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
          <Filter size={18} />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all">
              <button className="p-2 hover:bg-white/10 rounded-lg text-[var(--dark-grey)] hover:text-white">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                {client.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#4F46E5] transition-colors">
                  {client.full_name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[var(--dark-grey)]">
                  <Mail size={12} />
                  {client.email}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Active Portal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-bold uppercase">Connected</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all">
                  <Edit2 size={14} />
                  Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all">
                  <ExternalLink size={14} />
                  Portal
                </button>
              </div>
            </div>
          </motion.div>
        ))}
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
              <h3 className="text-2xl font-bold text-white mb-6">Invite New Client</h3>
              <form onSubmit={handleInvite} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                    placeholder="Jane Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                    placeholder="jane@company.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Assign to Project</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
                    <select 
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all appearance-none"
                      required
                    >
                      <option value="" disabled className="bg-[#0C0C1E]">Select a project...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id} className="bg-[#0C0C1E]">{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {inviteLink && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Invite Link Ready</p>
                      <p className="text-sm text-white truncate">{inviteLink}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={copyInviteLink}
                      className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-500 transition-all"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setInviteLink('');
                    }}
                    className="flex-1 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    Close
                  </button>
                  {!inviteLink && (
                    <button 
                      type="submit"
                      disabled={inviting}
                      className="flex-1 py-3 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all disabled:opacity-50"
                    >
                      {inviting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Generate Invite'}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
