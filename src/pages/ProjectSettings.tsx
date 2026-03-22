import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { 
  Settings, 
  Trash2, 
  Save, 
  AlertTriangle, 
  Shield, 
  Users, 
  Copy, 
  CheckCircle2,
  Share2,
  ExternalLink,
  UserPlus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function ProjectSettings() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    client_name: '',
    client_email: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
      if (data) {
        setProject(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          status: data.status || 'active',
          client_name: data.client_name || '',
          client_email: data.client_email || ''
        });
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;
      toast.success('Project settings updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update project settings');
    } finally {
      setSaving(false);
    }
  };

  const generateInvite = async () => {
    if (!projectId) return;
    setInviting(true);
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase
        .from('project_invites')
        .insert([{
          id: token,
          project_id: projectId,
          project_name: project.name,
          role: 'client',
          email: formData.client_email,
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

  const handleDelete = async () => {
    if (!projectId || deleteInput !== project?.name) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete project');
    }
  };

  const copyPortalLink = () => {
    const url = `${window.location.origin}/portal/${projectId}`;
    navigator.clipboard.writeText(url);
    toast.success('Portal link copied to clipboard');
  };

  if (loading) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
          <Settings className="text-[#4F46E5]" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Project Settings</h2>
          <p className="text-sm text-[var(--dark-grey)]">Manage project details, client access, and visibility.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield size={18} className="text-[#4F46E5]" />
            General Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Project Name</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all appearance-none"
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all resize-none"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-[#4F46E5]" />
            Client Access
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Client Name</label>
              <input 
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Client Email</label>
              <input 
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={generateInvite}
              disabled={inviting || !formData.client_email}
              className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {inviting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              Generate Invitation Link
            </button>

            {inviteLink && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Invitation Link Ready</p>
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
          </div>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Client Portal Link</p>
              <p className="text-xs text-[var(--dark-grey)]">Share this link with your client for direct access.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={copyPortalLink}
                className="p-2 hover:bg-white/5 rounded-lg text-[var(--dark-grey)] hover:text-white transition-all"
              >
                <Copy size={18} />
              </button>
              <a 
                href={`/portal/${projectId}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 hover:bg-white/5 rounded-lg text-[var(--dark-grey)] hover:text-white transition-all"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 space-y-6">
        <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
          <AlertTriangle size={18} />
          Danger Zone
        </h3>
        <p className="text-sm text-[var(--dark-grey)]">
          Once you delete a project, there is no going back. Please be certain.
        </p>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 size={18} />
            Delete Project
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-red-500 font-bold uppercase tracking-wider">
              Type <span className="underline">{project?.name}</span> to confirm deletion:
            </p>
            <div className="flex gap-4">
              <input 
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="flex-1 bg-white/5 border border-red-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all"
                placeholder={project?.name}
              />
              <button 
                onClick={handleDelete}
                disabled={deleteInput !== project?.name}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Delete
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput('');
                }}
                className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
