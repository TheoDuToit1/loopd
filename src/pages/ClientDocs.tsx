import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  ChevronRight, 
  Clock, 
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import Markdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';

export default function ClientDocs() {
  const { projectId } = useParams();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!projectId) return;

    fetchDocs();

    const channel = supabase
      .channel(`docs_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'docs',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchDocs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchDocs = async () => {
    if (!projectId) return;
    const { data } = await supabase
      .from('docs')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'published')
      .order('updated_at', { ascending: false });
    
    if (data) setDocs(data);
    setLoading(false);
  };

  const filteredDocs = docs.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedDoc) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => setSelectedDoc(null)}
          className="flex items-center gap-2 text-[var(--dark-grey)] hover:text-white transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Documentation
        </button>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">{selectedDoc.title}</h1>
          <div className="flex items-center gap-4 text-xs text-[var(--dark-grey)]">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              Last updated {selectedDoc.updated_at ? formatDistanceToNow(new Date(selectedDoc.updated_at), { addSuffix: true }) : 'Recently'}
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen size={14} />
              Documentation
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10 w-full" />

        <div className="prose prose-invert prose-indigo max-w-none">
          <div className="markdown-body">
            <Markdown>{selectedDoc.content}</Markdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Documentation</h2>
        <p className="text-sm text-[var(--dark-grey)]">Project guides, technical specs, and helpful resources.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
        <input 
          type="text"
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#4F46E5] transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((docItem, i) => (
          <motion.div
            key={docItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedDoc(docItem)}
            className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#4F46E5] transition-all">
              <FileText size={24} className="text-[#4F46E5] group-hover:text-white transition-all" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-white group-hover:text-[#4F46E5] transition-colors">
                {docItem.title}
              </h3>
              <p className="text-sm text-[var(--dark-grey)] line-clamp-2">
                {docItem.content.replace(/[#*`]/g, '')}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--dark-grey)] pt-2 uppercase tracking-wider font-bold">
                <Clock size={12} />
                {docItem.updated_at ? formatDistanceToNow(new Date(docItem.updated_at), { addSuffix: true }) : 'Recently'}
              </div>
            </div>
            <ChevronRight size={20} className="text-[var(--dark-grey)] group-hover:text-white transition-all self-center" />
          </motion.div>
        ))}

        {filteredDocs.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
              <FileText size={32} className="text-[var(--dark-grey)] opacity-20" />
            </div>
            <p className="text-[var(--dark-grey)]">No documentation found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
