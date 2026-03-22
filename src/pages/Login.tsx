import { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Mail, Lock, User, ArrowRight, Building2, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Login({ isRegister = false }: { isRegister?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'developer' | 'client'>('developer');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          email: user.email || '',
          role: role, // Use the selected role
          theme: 'dark',
          createdAt: new Date()
        });
      }

      toast.success(isRegister ? 'Registered successfully' : 'Logged in successfully');
      navigate(inviteToken ? `/accept-invite?token=${inviteToken}` : '/');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (isRegister) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
        await updateProfile(user, { displayName });
        
        await setDoc(doc(db, 'profiles', user.uid), {
          uid: user.uid,
          displayName,
          email,
          role,
          theme: 'dark',
          createdAt: new Date()
        });
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      }

      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      navigate(inviteToken ? `/accept-invite?token=${inviteToken}` : '/');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex bg-[#060714] overflow-hidden">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-[#0C0C1E] border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
        <div className="relative z-10 p-12 space-y-8 max-w-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <LayoutDashboard className="text-white w-8 h-8" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tighter text-white leading-tight">
              Manage your projects <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">in one perfect loop.</span>
            </h2>
            <p className="text-lg text-[var(--dark-grey)] leading-relaxed">
              Join thousands of developers and clients who use LoopD to bridge the gap between technical execution and business goals.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-sm text-[var(--dark-grey)]">Uptime Guaranteed</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-[var(--dark-grey)]">Expert Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-[var(--dark-grey)]">
              {isRegister ? 'Start your 14-day free trial today.' : 'Enter your details to access your dashboard.'}
            </p>
          </div>

          {/* Role Selection */}
          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('developer')}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                  role === 'developer' 
                    ? "bg-indigo-500/10 border-indigo-500 text-white" 
                    : "bg-white/5 border-white/5 text-[var(--dark-grey)] hover:bg-white/10"
                )}
              >
                <Terminal size={24} />
                <span className="text-sm font-bold">Developer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all",
                  role === 'client' 
                    ? "bg-emerald-500/10 border-emerald-500 text-white" 
                    : "bg-white/5 border-white/5 text-[var(--dark-grey)] hover:bg-white/10"
                )}
              >
                <Building2 size={24} />
                <span className="text-sm font-bold">Client</span>
              </button>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--dark-grey)] ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--dark-grey)] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
                <input
                  required
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-[var(--dark-grey)]">Password</label>
                {!isRegister && (
                  <button type="button" className="text-xs text-indigo-400 hover:underline">Forgot password?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#060714] px-4 text-[var(--dark-grey)]">Or continue with</span></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white p-0.5 rounded-full" alt="Google" />
            Google
          </button>

          <p className="text-center text-sm text-[var(--dark-grey)]">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link to={isRegister ? '/login' : '/register'} className="text-white font-bold hover:underline">
              {isRegister ? 'Sign in' : 'Create one for free'}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
