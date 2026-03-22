import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Eye, 
  CheckCircle2,
  Globe,
  MoreVertical,
  ChevronRight,
  Layout
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function Docs() {
  const { projectId } = useParams();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!projectId) return;

    const q = query(collection(db, 'projects', projectId, 'docs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocs(docsData);
      setLoading(false);
      
      if (!selectedDoc && docsData.length > 0) {
        setSelectedDoc(docsData[0]);
      }
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleCreateDoc = async () => {
    if (!projectId || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'projects', projectId, 'docs'), {
        title: 'New Documentation',
        content: '# Documentation\nStart documenting your project...',
        status: 'draft',
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Doc created');
    } catch (error) {
      toast.error('Failed to create doc');
    }
  };

  const handleUpdateDoc = async (id: string, updates: any) => {
    if (!projectId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'projects', projectId, 'docs', id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      setSaving(false);
    } catch (error) {
      toast.error('Failed to save doc');
      setSaving(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!projectId) return;
    try {
      await deleteDoc(doc(db, 'projects', projectId, 'docs', id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
      toast.success('Doc deleted');
    } catch (error) {
      toast.error('Failed to delete doc');
    }
  };

  const filteredDocs = docs.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Doc List Sidebar */}
      <div className="w-80 border-r border-white/5 bg-[#0C0C1E] flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Documentation</h3>
            <button 
              onClick={handleCreateDoc}
              className="p-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={16} />
            <input 
              type="text" 
              placeholder="Search docs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#4F46E5] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredDocs.map((docItem) => (
            <button
              key={docItem.id}
              onClick={() => setSelectedDoc(docItem)}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all group relative",
                selectedDoc?.id === docItem.id ? "bg-white/5 border border-white/10" : "hover:bg-white/5 border border-transparent"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className={cn("font-bold truncate", selectedDoc?.id === docItem.id ? "text-[#4F46E5]" : "text-white")}>
                  {docItem.title}
                </h4>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                  docItem.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-[var(--dark-grey)]"
                )}>
                  {docItem.status}
                </span>
              </div>
              <p className="text-xs text-[var(--dark-grey)] line-clamp-1">{docItem.content.replace(/[#*`]/g, '')}</p>
              <p className="text-[10px] text-[var(--dark-grey)] mt-2">{docItem.updatedAt ? formatDate(docItem.updatedAt.toDate()) : 'Recently'}</p>
            </button>
          ))}
          {filteredDocs.length === 0 && !loading && (
            <div className="py-20 text-center space-y-2 px-4">
              <FileText size={32} className="mx-auto text-[var(--dark-grey)] opacity-20" />
              <p className="text-sm text-[var(--dark-grey)]">No documentation found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-[#060714] overflow-hidden">
        {selectedDoc ? (
          <>
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0C0C1E]/50 backdrop-blur-xl">
              <div className="flex items-center gap-4 flex-1">
                <input 
                  type="text" 
                  value={selectedDoc.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setSelectedDoc({ ...selectedDoc, title: newTitle });
                    handleUpdateDoc(selectedDoc.id, { title: newTitle });
                  }}
                  className="bg-transparent text-xl font-bold text-white focus:outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-[var(--dark-grey)]">
                  {saving ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 border-t-2 border-b-2 border-[#4F46E5] rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 size={14} />
                      <span>Saved</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleUpdateDoc(selectedDoc.id, { status: selectedDoc.status === 'published' ? 'draft' : 'published' })}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    selectedDoc.status === 'published' ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-[var(--dark-grey)] hover:text-white"
                  )}
                >
                  <Globe size={14} />
                  {selectedDoc.status === 'published' ? 'Published' : 'Draft'}
                </button>
                <button 
                  onClick={() => handleDeleteDoc(selectedDoc.id)}
                  className="p-2 text-[var(--dark-grey)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8" data-color-mode="dark">
              <MDEditor
                value={selectedDoc.content}
                onChange={(val) => {
                  setSelectedDoc({ ...selectedDoc, content: val || '' });
                  handleUpdateDoc(selectedDoc.id, { content: val || '' });
                }}
                preview="edit"
                height="100%"
                className="bg-transparent border-none"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-[var(--dark-grey)]">
              <FileText size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Select a document to edit</h3>
              <p className="text-[var(--dark-grey)]">Or create a new one to start documenting.</p>
            </div>
            <button 
              onClick={handleCreateDoc}
              className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-all"
            >
              <Plus size={20} />
              Create New Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
