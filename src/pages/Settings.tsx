import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Mail,
  CheckCircle2,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const { accentColor, setAccentColor } = useTheme();

  const accentColors = [
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Violet', value: '#7C3AED' },
    { name: 'Teal', value: '#0D9488' },
    { name: 'Rose', value: '#E11D48' },
    { name: 'Amber', value: '#D97706' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Sky', value: '#0284C7' },
    { name: 'Pink', value: '#DB2777' },
  ];

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'profiles', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (updates: any) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'profiles', auth.currentUser.uid), updates);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
  ];

  if (loading) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[var(--dark-grey)]">Manage your account and preferences.</p>
      </header>

      <div className="flex gap-8">
        {/* Settings Navigation */}
        <div className="w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                activeTab === tab.id 
                  ? "bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color-glow)]" 
                  : "text-[var(--dark-grey)] hover:text-white hover:bg-white/5"
              )}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-[#0C0C1E] border border-white/5 rounded-2xl p-8 space-y-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white">
                  {profile?.displayName?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{profile?.displayName}</h3>
                  <p className="text-[var(--dark-grey)]">{profile?.email}</p>
                  <button className="mt-2 text-sm text-[var(--accent-color)] hover:underline">Change avatar</button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Display Name</label>
                  <input 
                    type="text" 
                    defaultValue={profile?.displayName}
                    onBlur={(e) => handleUpdateProfile({ displayName: e.target.value })}
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[var(--accent-color)] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Email Address</label>
                  <input 
                    type="email" 
                    disabled
                    value={profile?.email}
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-[var(--dark-grey)] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Theme Preference</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleUpdateProfile({ theme: 'light' })}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
                      profile?.theme === 'light' ? "border-[var(--accent-color)] bg-[var(--accent-color)]/5 text-white" : "border-white/5 text-[var(--dark-grey)] hover:bg-white/5"
                    )}
                  >
                    <Sun size={24} />
                    <span className="font-medium">Light Mode</span>
                  </button>
                  <button 
                    onClick={() => handleUpdateProfile({ theme: 'dark' })}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
                      profile?.theme === 'dark' ? "border-[var(--accent-color)] bg-[var(--accent-color)]/5 text-white" : "border-white/5 text-[var(--dark-grey)] hover:bg-white/5"
                    )}
                  >
                    <Moon size={24} />
                    <span className="font-medium">Dark Mode</span>
                  </button>
                </div>
              </div>

              {profile?.theme === 'dark' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Accent Color</h3>
                  <p className="text-sm text-[var(--dark-grey)]">Customize the primary color for your dashboard.</p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setAccentColor(color.value)}
                        className={cn(
                          "w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center group",
                          accentColor === color.value 
                            ? "border-white scale-110 shadow-lg" 
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {accentColor === color.value && (
                          <CheckCircle2 size={16} className="text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Email Notifications</h3>
              <div className="space-y-4">
                <NotificationToggle label="New change requests" description="Get notified when a client submits a new request." defaultChecked />
                <NotificationToggle label="Critical bug alerts" description="Immediate alerts for high-priority issues." defaultChecked />
                <NotificationToggle label="Project updates" description="Weekly summaries of project progress." />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({ label, description, defaultChecked = false }: { label: string, description: string, defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 bg-[#060714] rounded-xl border border-white/5">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-xs text-[var(--dark-grey)]">{description}</p>
      </div>
      <button 
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative",
          checked ? "bg-[var(--accent-color)]" : "bg-white/10"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
          checked ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
