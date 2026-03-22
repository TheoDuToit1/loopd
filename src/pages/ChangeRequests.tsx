import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  PauseCircle, 
  ChevronRight,
  MoreVertical,
  Timer
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function ChangeRequests() {
  const { projectId } = useParams();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    if (!projectId) return;

    const q = query(collection(db, 'projects', projectId, 'change_requests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !projectId) return;

    try {
      await addDoc(collection(db, 'projects', projectId, 'change_requests'), {
        ...newRequest,
        status: 'submitted',
        clientId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setShowNewModal(false);
      setNewRequest({ title: '', description: '', priority: 'medium' });
      toast.success('Request submitted successfully');
    } catch (error) {
      toast.error('Failed to submit request');
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    if (!projectId) return;
    try {
      await updateDoc(doc(db, 'projects', projectId, 'change_requests', requestId), {
        status: newStatus
      });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    { id: 'submitted', label: 'Submitted', color: 'border-orange-500' },
    { id: 'accepted', label: 'Accepted', color: 'border-blue-500' },
    { id: 'in-progress', label: 'In Progress', color: 'border-yellow-500' },
    { id: 'testing', label: 'Testing', color: 'border-indigo-500' },
    { id: 'completed', label: 'Completed', color: 'border-emerald-500' },
  ];

  return (
    <div className="p-8 space-y-8 h-full flex flex-col">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Change Requests</h2>
          <p className="text-[var(--dark-grey)]">Manage client requests and track development time.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          New Request
        </button>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map((column) => (
            <div key={column.id} className="w-80 flex flex-col h-full">
              <div className={cn("flex items-center justify-between mb-4 p-3 bg-[#0C0C1E] rounded-xl border-l-4", column.color)}>
                <h3 className="font-bold text-white uppercase tracking-wider text-xs">{column.label}</h3>
                <span className="bg-white/5 text-[var(--dark-grey)] text-[10px] px-2 py-0.5 rounded-full">
                  {requests.filter(r => r.status === column.id).length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {requests
                  .filter(r => r.status === column.id)
                  .map((request) => (
                    <RequestCard 
                      key={request.id} 
                      request={request} 
                      onUpdateStatus={(status) => handleUpdateStatus(request.id, status)} 
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Request Modal */}
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
                <h3 className="text-xl font-bold text-white">New Change Request</h3>
                <button onClick={() => setShowNewModal(false)} className="text-[var(--dark-grey)] hover:text-white transition-colors">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Request Title</label>
                  <input 
                    required
                    type="text" 
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    placeholder="e.g. Add dark mode to dashboard"
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Description</label>
                  <textarea 
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Detailed requirements..."
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Priority</label>
                  <select 
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
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

function RequestCard({ request, onUpdateStatus }: { request: any, onUpdateStatus: (status: string) => void }) {
  return (
    <motion.div 
      layout
      className="bg-[#0C0C1E] border border-white/5 p-4 rounded-xl space-y-4 group hover:border-white/10 transition-all"
    >
      <div className="flex items-start justify-between">
        <span className={cn("priority-badge", 
          request.priority === 'urgent' ? 'urgent' : 
          request.priority === 'high' ? 'high' : 
          request.priority === 'medium' ? 'medium' : 'low'
        )}>
          {request.priority}
        </span>
        <button className="text-[var(--dark-grey)] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={16} />
        </button>
      </div>
      
      <div className="space-y-1">
        <h4 className="font-bold text-white group-hover:text-[#4F46E5] transition-colors">{request.title}</h4>
        <p className="text-xs text-[var(--dark-grey)] line-clamp-2">{request.description}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] text-[var(--dark-grey)]">
          <Timer size={12} />
          <span>00:00:00</span>
        </div>
        <div className="flex items-center gap-1">
          {request.status === 'submitted' && (
            <button 
              onClick={() => onUpdateStatus('accepted')}
              className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all"
              title="Accept Request"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
          {request.status === 'accepted' && (
            <button 
              onClick={() => onUpdateStatus('in-progress')}
              className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg hover:bg-yellow-500/20 transition-all"
              title="Start Work"
            >
              <PlayCircle size={14} />
            </button>
          )}
          {request.status === 'in-progress' && (
            <button 
              onClick={() => onUpdateStatus('testing')}
              className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20 transition-all"
              title="Send to Testing"
            >
              <PauseCircle size={14} />
            </button>
          )}
          {request.status === 'testing' && (
            <button 
              onClick={() => onUpdateStatus('completed')}
              className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all"
              title="Complete"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
          <button className="p-1.5 hover:bg-white/5 rounded-lg text-[var(--dark-grey)] hover:text-white transition-all">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
