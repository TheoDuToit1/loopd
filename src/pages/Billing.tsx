import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Download, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Receipt,
  ArrowUpRight,
  Zap,
  Shield,
  LayoutDashboard
} from 'lucide-react';

export default function Billing() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'methods'>('overview');

  const invoices = [
    { id: 'INV-001', date: 'Mar 15, 2026', amount: '$499.00', status: 'paid', project: 'E-commerce Redesign' },
    { id: 'INV-002', date: 'Feb 15, 2026', amount: '$499.00', status: 'paid', project: 'E-commerce Redesign' },
    { id: 'INV-003', date: 'Jan 15, 2026', amount: '$499.00', status: 'paid', project: 'E-commerce Redesign' },
    { id: 'INV-004', date: 'Dec 15, 2025', amount: '$499.00', status: 'paid', project: 'E-commerce Redesign' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
            <CreditCard className="text-[#4F46E5]" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Billing & Subscriptions</h2>
            <p className="text-sm text-[var(--dark-grey)]">Manage your plan, payment methods, and invoices.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all">
            <Receipt size={18} />
            History
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20">
            <Plus size={20} />
            Add Method
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Zap size={120} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                  Current Plan
                </div>
                <div className="text-white/60 text-xs">Renews on Apr 15, 2026</div>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-white mb-2">Agency Pro</h3>
                <p className="text-white/80 text-sm">Unlimited projects, team members, and client portals.</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-white">$499</span>
                <span className="text-white/60 mb-2">/ month</span>
              </div>
              <div className="pt-4 flex gap-4">
                <button className="px-6 py-3 bg-white text-[#4F46E5] rounded-xl font-bold hover:bg-white/90 transition-all">
                  Upgrade Plan
                </button>
                <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/30 transition-all">
                  Manage Plan
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Recent Invoices</h3>
              <button className="text-xs text-[#4F46E5] font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-[var(--dark-grey)] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-white/5 transition-all">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-white">{invoice.id}</div>
                        <div className="text-[10px] text-[var(--dark-grey)]">{invoice.project}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--dark-grey)]">{invoice.date}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white">{invoice.amount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase">
                          <CheckCircle2 size={12} />
                          {invoice.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-[var(--dark-grey)] hover:text-white transition-all">
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white">Payment Method</h3>
            <div className="p-6 bg-gradient-to-br from-zinc-800 to-black rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                <Shield size={60} />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full -mr-2" />
                    <div className="w-8 h-8 bg-amber-500/20 rounded-full" />
                  </div>
                  <div className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Primary</div>
                </div>
                <div className="text-xl font-mono text-white tracking-widest">
                  •••• •••• •••• 4242
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Card Holder</div>
                    <div className="text-sm text-white font-bold">John Doe</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Expires</div>
                    <div className="text-sm text-white font-bold">12/28</div>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-sm text-[var(--dark-grey)] hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2">
              <Plus size={18} />
              Add New Card
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white">Usage Limits</h3>
            <div className="space-y-6">
              {[
                { label: 'Projects', current: 12, max: 20, color: 'bg-blue-500' },
                { label: 'Team Members', current: 8, max: 10, color: 'bg-indigo-500' },
                { label: 'Storage', current: 4.2, max: 10, unit: 'GB', color: 'bg-emerald-500' },
              ].map((limit) => (
                <div key={limit.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--dark-grey)] font-bold uppercase tracking-wider">{limit.label}</span>
                    <span className="text-white font-bold">{limit.current} / {limit.max} {limit.unit}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(limit.current / limit.max) * 100}%` }}
                      className={cn("h-full rounded-full", limit.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2">
                <ArrowUpRight size={14} />
                Upgrade Limits
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
