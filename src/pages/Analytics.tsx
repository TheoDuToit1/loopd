import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Bug, 
  GitPullRequest, 
  CheckCircle2, 
  Clock, 
  Activity,
  Users,
  LayoutDashboard
} from 'lucide-react';

import { cn } from '../lib/utils';

const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];

export default function Analytics() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalBugs: 0,
    totalRequests: 0,
    resolvedBugs: 0,
    completedRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const bugsSnap = await getDocs(collection(db, 'bugs'));
      const requestsSnap = await getDocs(collection(db, 'change_requests'));

      const bugs = bugsSnap.docs.map(d => d.data());
      const requests = requestsSnap.docs.map(d => d.data());

      setStats({
        totalProjects: projectsSnap.size,
        totalBugs: bugsSnap.size,
        totalRequests: requestsSnap.size,
        resolvedBugs: bugs.filter(b => b.status === 'resolved').length,
        completedRequests: requests.filter(r => r.status === 'completed').length
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const projectData = [
    { name: 'Mon', bugs: 4, requests: 2 },
    { name: 'Tue', bugs: 3, requests: 5 },
    { name: 'Wed', bugs: 2, requests: 3 },
    { name: 'Thu', bugs: 6, requests: 4 },
    { name: 'Fri', bugs: 8, requests: 6 },
    { name: 'Sat', bugs: 3, requests: 2 },
    { name: 'Sun', bugs: 1, requests: 1 },
  ];

  const distributionData = [
    { name: 'Open Bugs', value: stats.totalBugs - stats.resolvedBugs },
    { name: 'Resolved Bugs', value: stats.resolvedBugs },
    { name: 'Pending Requests', value: stats.totalRequests - stats.completedRequests },
    { name: 'Completed Requests', value: stats.completedRequests },
  ];

  if (loading) return null;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
          <TrendingUp className="text-[#4F46E5]" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Global Analytics</h2>
          <p className="text-sm text-[var(--dark-grey)]">Performance metrics across all your projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Projects', value: stats.totalProjects, icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Bugs', value: stats.totalBugs, icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Change Requests', value: stats.totalRequests, icon: GitPullRequest, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Completion Rate', value: `${Math.round(((stats.resolvedBugs + stats.completedRequests) / (stats.totalBugs + stats.totalRequests || 1)) * 100)}%`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <Activity size={16} className="text-[var(--dark-grey)] opacity-20" />
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-[var(--dark-grey)] uppercase tracking-wider font-bold mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-8">Weekly Activity</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0C0C1E', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="bugs" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="requests" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-white mb-8">Status Distribution</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0C0C1E', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {distributionData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs text-[var(--dark-grey)]">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
