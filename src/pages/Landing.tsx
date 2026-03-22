import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ChevronRight, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  Globe,
  MessageSquare,
  BarChart3,
  Bug,
  GitPullRequest
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#060714] text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#060714]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">LoopD</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--dark-grey)]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-white transition-colors">Log in</Link>
            <Link to="/register" className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-opacity-90 transition-all shadow-xl shadow-white/10">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-400"
            >
              <Zap size={16} />
              <span>The future of project management is here</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]"
            >
              Your Project, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">One Perfect Loop.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[var(--dark-grey)] max-w-2xl mx-auto leading-relaxed"
            >
              LoopD bridges the gap between developers and clients. Manage bugs, requests, files, and documentation in a single, unified workspace.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#4F46E5] text-white rounded-2xl font-bold text-lg hover:bg-[#4338CA] transition-all shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-2 group">
                Start Building for Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                View Demo
              </Link>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-24 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#060714] via-transparent to-transparent z-10" />
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-[#0C0C1E] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" 
                alt="Dashboard Preview" 
                className="w-full opacity-80"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-[#08091a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything you need to ship.</h2>
            <p className="text-[var(--dark-grey)] text-lg max-w-2xl mx-auto">
              Powerful tools designed for developers, simplified for clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Bug className="text-red-400" />}
              title="Bug Tracking"
              description="Report and resolve issues with a streamlined workflow that keeps everyone informed."
            />
            <FeatureCard 
              icon={<GitPullRequest className="text-amber-400" />}
              title="Change Requests"
              description="Manage client requests through a visual Kanban board. No more lost emails."
            />
            <FeatureCard 
              icon={<Shield className="text-emerald-400" />}
              title="Secure Vault"
              description="Store API keys, credentials, and sensitive data with AES-256 encryption."
            />
            <FeatureCard 
              icon={<Users className="text-blue-400" />}
              title="Client Portals"
              description="Give clients a dedicated, simplified view of their project's progress and health."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-purple-400" />}
              title="Advanced Analytics"
              description="Track productivity, bug resolution rates, and project velocity with real-time data."
            />
            <FeatureCard 
              icon={<Globe className="text-indigo-400" />}
              title="Global Access"
              description="Collaborate with team members and clients from anywhere in the world."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-xl">
            <h2 className="text-4xl font-bold tracking-tight leading-tight">Built for the modern development cycle.</h2>
            <p className="text-[var(--dark-grey)] text-lg">
              LoopD was created to solve the communication gap between technical teams and non-technical stakeholders.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <CheckCircle2 size={14} />
                </div>
                <span className="font-medium">99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <CheckCircle2 size={14} />
                </div>
                <span className="font-medium">Enterprise-grade Security</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <CheckCircle2 size={14} />
                </div>
                <span className="font-medium">Unlimited Projects & Clients</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full" />
            <div className="relative bg-[#0C0C1E] border border-white/10 p-8 rounded-[2rem] space-y-8 w-full max-w-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full" />
                <div>
                  <div className="h-4 w-32 bg-white/10 rounded-full mb-2" />
                  <div className="h-3 w-20 bg-white/5 rounded-full" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-white/5 rounded-full" />
                <div className="h-3 w-full bg-white/5 rounded-full" />
                <div className="h-3 w-2/3 bg-white/5 rounded-full" />
              </div>
              <div className="pt-4 flex items-center justify-between">
                <div className="h-8 w-24 bg-indigo-500/20 rounded-lg" />
                <div className="h-8 w-8 bg-white/5 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-[#060714]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-lg flex items-center justify-center">
                <LayoutDashboard className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tighter">LoopD</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-[var(--dark-grey)]">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="pt-12 text-center text-sm text-[var(--dark-grey)]">
            © 2026 LoopD Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 hover:bg-white/10 transition-all group">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-[var(--dark-grey)] leading-relaxed">{description}</p>
    </div>
  );
}
