import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Play, 
  Square, 
  Plus, 
  History, 
  Calendar,
  Briefcase,
  Timer,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function TimeTracking() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const q = query(collection(db, 'projects'));
      const snap = await getDocs(q);
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchProjects();

    if (auth.currentUser) {
      const q = query(
        collection(db, 'time_logs'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setElapsed(0);
  };

  const stopTimer = async () => {
    if (!auth.currentUser || !startTime) return;
    
    try {
      await addDoc(collection(db, 'time_logs'), {
        userId: auth.currentUser.uid,
        projectId: selectedProject,
        description,
        duration: elapsed,
        startTime: startTime,
        endTime: new Date(),
        createdAt: serverTimestamp()
      });
      
      setIsTracking(false);
      setStartTime(null);
      setElapsed(0);
      setDescription('');
      toast.success('Time log saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save time log');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
          <Clock className="text-[#4F46E5]" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Time Tracking</h2>
          <p className="text-sm text-[var(--dark-grey)]">Track your work hours and productivity.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 w-full space-y-4">
            <input 
              type="text"
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg text-white focus:outline-none focus:border-[#4F46E5] transition-all"
            />
            <div className="flex gap-4">
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4F46E5] transition-all appearance-none"
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="text-4xl font-mono text-white flex items-center px-6 bg-white/5 rounded-xl border border-white/10">
                {formatTime(elapsed)}
              </div>
            </div>
          </div>
          
          <button 
            onClick={isTracking ? stopTimer : startTimer}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl",
              isTracking 
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                : "bg-[#4F46E5] hover:bg-[#4338CA] shadow-indigo-500/20"
            )}
          >
            {isTracking ? <Square size={32} className="text-white" fill="white" /> : <Play size={32} className="text-white ml-2" fill="white" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={18} className="text-[#4F46E5]" />
              Recent Logs
            </h3>
            <button className="text-xs text-[var(--dark-grey)] hover:text-white transition-all">View All</button>
          </div>

          <div className="space-y-4">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Timer size={24} className="text-[#4F46E5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{log.description || 'No description'}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-[var(--dark-grey)] uppercase tracking-wider">
                        <Briefcase size={12} />
                        {projects.find(p => p.id === log.projectId)?.name || 'General'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[var(--dark-grey)] uppercase tracking-wider">
                        <Calendar size={12} />
                        {log.createdAt ? format(log.createdAt.toDate(), 'MMM d') : 'Today'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-mono text-white">{formatTime(log.duration)}</div>
                    <div className="text-[10px] text-emerald-500 font-bold uppercase">Logged</div>
                  </div>
                  <button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-[var(--dark-grey)] hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white">Weekly Summary</h3>
            <div className="space-y-6">
              {[
                { label: 'Total Hours', value: '32h 45m', icon: Clock, color: 'text-blue-500' },
                { label: 'Billable', value: '28h 10m', icon: CheckCircle2, color: 'text-emerald-500' },
                { label: 'Productivity', value: '84%', icon: Timer, color: 'text-indigo-500' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <stat.icon size={18} className={stat.color} />
                    <span className="text-sm text-[var(--dark-grey)]">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
              ))}
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

// Helper to get docs since I used it in useEffect
import { getDocs } from 'firebase/firestore';
