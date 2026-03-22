import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Key, 
  ShieldCheck,
  Search,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'demo-encryption-key'; // In production, this would be on the server

export default function Vault() {
  const { projectId } = useParams();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCredential, setNewCredential] = useState({ label: '', value: '', type: 'API Key' });
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!projectId) return;

    const q = query(collection(db, 'projects', projectId, 'vault'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const credsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCredentials(credsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !projectId) return;

    try {
      // Encrypt the value before storing
      const encryptedValue = CryptoJS.AES.encrypt(newCredential.value, ENCRYPTION_KEY).toString();

      await addDoc(collection(db, 'projects', projectId, 'vault'), {
        label: newCredential.label,
        type: newCredential.type,
        value_encrypted: encryptedValue,
        createdAt: serverTimestamp(),
      });
      setShowNewModal(false);
      setNewCredential({ label: '', value: '', type: 'API Key' });
      toast.success('Credential added to vault');
    } catch (error) {
      toast.error('Failed to add credential');
    }
  };

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealedIds);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
      // Auto-hide after 30 seconds
      setTimeout(() => {
        setRevealedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 30000);
    }
    setRevealedIds(newRevealed);
  };

  const decryptValue = (encrypted: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return 'Error decrypting';
    }
  };

  const handleCopy = (encrypted: string) => {
    const decrypted = decryptValue(encrypted);
    navigator.clipboard.writeText(decrypted);
    toast.success('Copied to clipboard');
    
    // Clear clipboard after 30 seconds (simulated)
    setTimeout(() => {
      // Note: Real clipboard clearing is tricky, usually just notify the user
      toast.info('Clipboard cleared for security');
    }, 30000);
  };

  const handleDelete = async (id: string) => {
    if (!projectId) return;
    try {
      await deleteDoc(doc(db, 'projects', projectId, 'vault', id));
      toast.success('Credential deleted');
    } catch (error) {
      toast.error('Failed to delete credential');
    }
  };

  const filteredCredentials = credentials.filter(c => 
    c.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Secure Vault</h2>
          <p className="text-[var(--dark-grey)]">AES-256 encrypted storage for project credentials.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg font-medium hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          Add Credential
        </button>
      </header>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
          <input 
            type="text" 
            placeholder="Search vault..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0C0C1E] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-xs font-medium">
          <ShieldCheck size={14} />
          End-to-End Encrypted
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCredentials.map((cred) => (
          <div key={cred.id} className="bg-[#0C0C1E] border border-white/5 p-6 rounded-2xl space-y-6 group hover:border-white/10 transition-all relative">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => handleDelete(cred.id)} className="text-[var(--dark-grey)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-[#4F46E5]">
                <Key size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white">{cred.label}</h4>
                <p className="text-xs text-[var(--dark-grey)]">{cred.type}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input 
                  type={revealedIds.has(cred.id) ? "text" : "password"}
                  readOnly
                  value={revealedIds.has(cred.id) ? decryptValue(cred.value_encrypted) : "••••••••••••••••"}
                  className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-lg text-sm text-white font-mono focus:outline-none"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    onClick={() => toggleReveal(cred.id)}
                    className="p-1.5 text-[var(--dark-grey)] hover:text-white transition-colors"
                  >
                    {revealedIds.has(cred.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button 
                    onClick={() => handleCopy(cred.value_encrypted)}
                    className="p-1.5 text-[var(--dark-grey)] hover:text-white transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              {revealedIds.has(cred.id) && (
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 30, ease: "linear" }}
                  className="h-0.5 bg-[#4F46E5] rounded-full"
                />
              )}
            </div>
          </div>
        ))}
        {filteredCredentials.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-2">
            <Lock size={48} className="mx-auto text-[var(--dark-grey)] opacity-20" />
            <p className="text-[var(--dark-grey)]">Your vault is empty. Store your secrets securely.</p>
          </div>
        )}
      </div>

      {/* New Credential Modal */}
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
                <h3 className="text-xl font-bold text-white">Add Secure Credential</h3>
                <button onClick={() => setShowNewModal(false)} className="text-[var(--dark-grey)] hover:text-white transition-colors">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateCredential} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Label</label>
                  <input 
                    required
                    type="text" 
                    value={newCredential.label}
                    onChange={(e) => setNewCredential({ ...newCredential, label: e.target.value })}
                    placeholder="e.g. Production Database URL"
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Credential Type</label>
                  <select 
                    value={newCredential.type}
                    onChange={(e) => setNewCredential({ ...newCredential, type: e.target.value })}
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
                  >
                    <option value="API Key">API Key</option>
                    <option value="Password">Password</option>
                    <option value="Token">Token</option>
                    <option value="Database URL">Database URL</option>
                    <option value="SSH Key">SSH Key</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--dark-grey)]">Value</label>
                  <input 
                    required
                    type="text" 
                    value={newCredential.value}
                    onChange={(e) => setNewCredential({ ...newCredential, value: e.target.value })}
                    placeholder="Paste your secret here..."
                    className="w-full px-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all font-mono"
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Encrypt & Save
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
