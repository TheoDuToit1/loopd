import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Bug, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function BugTracker() {
  const { projectId } = useParams();
  const [bugs, setBugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newBug, setNewBug] = useState({ title: '', description: '', severity: 'medium', status: 'open' });

  useEffect(() => {
    if (!projectId) return;

    const q = query(collection(db, 'projects', projectId, 'bugs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bugsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBugs(bugsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleCreateBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !projectId) return;

    try {
      await addDoc(collection(db, 'projects', projectId, 'bugs'), {
        ...newBug,
        reporterId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setShowNewModal(false);
      setNewBug({ title: '', description: '', severity: 'medium', status: 'open' });
      toast.success('Bug reported successfully');
    } catch (error) {
      toast.error('Failed to report bug');
    }
  };

  const handleUpdateStatus = async (bugId: string, newStatus: string) => {
    if (!projectId) return;
    try {
      await updateDoc(doc(db, 'projects', projectId, 'bugs', bugId), {
        status: newStatus
      });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Bug Tracker</h2>
          <p className="text-[var(--dark-grey)]">Track and resolve issues in your loop.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Report Bug
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BugStat label="Open" value={bugs.filter(b => b.status === 'open').length} color="text-red-500" />
        <BugStat label="Investigating" value={bugs.filter(b => b.status === 'investigating').length} color="text-orange-500" />
        <BugStat label="Fixing" value={bugs.filter(b => b.status === 'fixing').length} color="text-yellow-500" />
        <BugStat label="Resolved" value={bugs.filter(b => b.status === 'resolved').length} color="text-emerald-500" />
      </div>

      {/* Bug List */}
      <div className="bg-[#0C0C1E] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">
              <th className="px-6 py-4">Bug</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Reported</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bugs.map((bug) => (
              <tr key={bug.id} className="hover:bg-white/5 transition-all group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", 
                      bug.severity === 'critical' ? 'bg-red-500 animate-pulse' : 
                      bug.severity === 'high' ? 'bg-orange-500' : 
                      bug.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    )}></div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-[#4F46E5] transition-colors">{bug.title}</p>
                      <p className="text-xs text-[var(--dark-grey)] truncate max-w-[200px]">{bug.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("priority-badge", 
                    bug.severity === 'critical' ? 'urgent' : 
                    bug.severity === 'high' ? 'high' : 
                    bug.severity === 'medium' ? 'medium' : 'low'
                  )}>
                    {bug.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={bug.status}
                    onChange={(e) => handleUpdateStatus(bug.id, e.target.value)}
                    className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="fixing">Fixing</option>
                    <option value="testing">Testing</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--dark-grey)]">
                  {bug.createdAt ? formatDate(bug.createdAt.toDate()) : 'Recently'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[var(--dark-grey)] hover:text-white">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bugs.length === 0 && !loading && (
          <div className="py-20 text-center space-y-2">
            <Bug size={48} className="mx-auto text-[var(--dark-grey)] opacity-20" />
            <p className="text-[var(--dark-grey)]">No bugs reported yet. Great work!</p>
          </div>
        )}
      </div>

      {/* New Bug Modal */}
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
                <h3 className="text-xl font-bold text-white">Report New Bug</h3>
                <button onClick={() => setShowNewModal(false)} className="text-[var(--dark-grey)] hover:text-white transition-colors">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateBug} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Bug Title</label>
                  <input 
                    required
                    type="text" 
                    value={newBug.title}
                    onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                    placeholder="e.g. Login button not working"
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Description</label>
                  <textarea 
                    value={newBug.description}
                    onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                    placeholder="Steps to reproduce, expected vs actual behavior..."
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--dark-grey)]">Severity</label>
                    <select 
                      value={newBug.severity}
                      onChange={(e) => setNewBug({ ...newBug, severity: e.target.value })}
                      className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Report Bug
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

function BugStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-[#0C0C1E] border border-white/5 p-4 rounded-xl flex items-center justify-between">
      <span className="text-sm text-[var(--dark-grey)] font-medium">{label}</span>
      <span className={cn("text-xl font-bold", color)}>{value}</span>
    </div>
  );
}
