import { User } from 'firebase/auth';
import { motion } from 'motion/react';
import { 
  FileText, 
  Plus,
  ChevronRight,
  TrendingUp,
  Bug,
  GitPullRequest,
  Users,
  Building2,
  Calendar,
  Clock,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function DashboardHome({ user }: { user: User }) {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {user.displayName?.split(' ')[0]}!</h1>
          <p className="text-[var(--dark-grey)]">Here's what's happening in your loop today.</p>
        </div>
        <Link to="/dashboard/projects" className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-all">
          <Plus size={18} />
          New Project
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Active Projects" value="4" trend="+2 this month" icon={<TrendingUp size={20} className="text-emerald-500" />} />
        <StatCard label="Open Bugs" value="12" trend="3 critical" icon={<Bug size={20} className="text-red-500" />} />
        <StatCard label="Pending Requests" value="8" trend="5 urgent" icon={<GitPullRequest size={20} className="text-orange-500" />} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Analytics', icon: TrendingUp, path: '/dashboard/analytics', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Team', icon: Users, path: '/dashboard/team', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Clients', icon: Building2, path: '/dashboard/clients', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Calendar', icon: Calendar, path: '/dashboard/calendar', color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Time', icon: Clock, path: '/dashboard/time', color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Billing', icon: CreditCard, path: '/dashboard/billing', color: 'text-pink-500', bg: 'bg-pink-500/10' },
        ].map((action) => (
          <Link 
            key={action.label}
            to={action.path}
            className="flex flex-col items-center justify-center p-4 bg-[#0C0C1E] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", action.bg)}>
              <action.icon size={20} className={action.color} />
            </div>
            <span className="text-xs font-bold text-white tracking-tight">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-[#0C0C1E] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Projects</h3>
            <Link to="/dashboard/projects" className="text-sm text-[#4F46E5] hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            <ProjectRow name="E-commerce Redesign" status="In Progress" client="Shopify Inc." id="p1" />
            <ProjectRow name="Mobile App API" status="Completed" client="HealthTrack" id="p2" />
            <ProjectRow name="Dashboard UI" status="Testing" client="FinTech Solutions" id="p3" />
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-[#0C0C1E] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Activity Log</h3>
            <button className="text-sm text-[var(--dark-grey)] hover:text-white">Clear</button>
          </div>
          <div className="space-y-6">
            <ActivityItem 
              user="Theo" 
              action="resolved bug" 
              target="E-commerce Redesign" 
              time="2 hours ago" 
              color="bg-emerald-500" 
            />
            <ActivityItem 
              user="Client" 
              action="submitted request" 
              target="Mobile App API" 
              time="4 hours ago" 
              color="bg-orange-500" 
            />
            <ActivityItem 
              user="Theo" 
              action="updated vault" 
              target="Dashboard UI" 
              time="Yesterday" 
              color="bg-indigo-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, icon }: { label: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#0C0C1E] border border-white/5 p-6 rounded-2xl space-y-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-[var(--dark-grey)] font-medium">{label}</p>
        <h4 className="text-4xl font-bold text-white tracking-tight">{value}</h4>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{trend}</span>
      </div>
    </div>
  );
}

function ProjectRow({ name, status, client, id }: { name: string, status: string, client: string, id: string }) {
  return (
    <Link to={`/dashboard/projects/${id}`} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-white/5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#1e1e38] rounded-lg flex items-center justify-center text-[#4F46E5]">
          <FileText size={20} />
        </div>
        <div>
          <p className="font-semibold text-white group-hover:text-[#4F46E5] transition-colors">{name}</p>
          <p className="text-sm text-[var(--dark-grey)]">{client}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={cn(
          "status",
          status === 'Completed' ? 'completed' : status === 'In Progress' ? 'process' : 'pending'
        )}>
          {status}
        </span>
        <ChevronRight className="text-[var(--dark-grey)] group-hover:text-white transition-colors" size={18} />
      </div>
    </Link>
  );
}

function ActivityItem({ user, action, target, time, color }: { user: string, action: string, target: string, time: string, color: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", color)}></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">
          <span className="font-bold">{user}</span> {action} in <span className="text-[#4F46E5] font-medium">{target}</span>
        </p>
        <p className="text-xs text-[var(--dark-grey)] mt-1">{time}</p>
      </div>
    </div>
  );
}
