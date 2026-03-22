import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  StickyNote, 
  Trash2, 
  Eye, 
  Save, 
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Globe
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function Notes() {
  const { projectId } = useParams();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!projectId) return;

    fetchNotes();

    const channel = supabase
      .channel(`notes_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notes',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchNotes = async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch notes');
    } else {
      setNotes(data || []);
      if (!selectedNote && data && data.length > 0) {
        setSelectedNote(data[0]);
      }
    }
    setLoading(false);
  };

  const handleCreateNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!projectId || !user) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title: 'Untitled Note',
          content: '# New Note\nStart writing here...',
          visible_to_client: false,
          project_id: projectId,
          author_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      setSelectedNote(data);
      toast.success('Note created');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (id: string, updates: any) => {
    if (!projectId) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaving(true);
    
    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('notes')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) throw error;
        setSaving(false);
      } catch (error) {
        toast.error('Failed to save note');
        setSaving(false);
      }
    }, 1000);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      if (selectedNote?.id === id) setSelectedNote(null);
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Note List Sidebar */}
      <div className="w-80 border-r border-white/5 bg-[#0C0C1E] flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Project Notes</h3>
            <button 
              onClick={handleCreateNote}
              className="p-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={16} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#060714] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-[#4F46E5] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all group relative",
                selectedNote?.id === note.id ? "bg-white/5 border border-white/10" : "hover:bg-white/5 border border-transparent"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className={cn("font-bold truncate", selectedNote?.id === note.id ? "text-[#4F46E5]" : "text-white")}>
                  {note.title}
                </h4>
                {note.visible_to_client && (
                  <Globe size={12} className="text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-[var(--dark-grey)] line-clamp-1">{note.content.replace(/[#*`]/g, '')}</p>
              <p className="text-[10px] text-[var(--dark-grey)] mt-2">{note.updated_at ? formatDate(new Date(note.updated_at)) : 'Recently'}</p>
            </button>
          ))}
          {filteredNotes.length === 0 && !loading && (
            <div className="py-20 text-center space-y-2 px-4">
              <StickyNote size={32} className="mx-auto text-[var(--dark-grey)] opacity-20" />
              <p className="text-sm text-[var(--dark-grey)]">No notes found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-[#060714] overflow-hidden">
        {selectedNote ? (
          <>
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0C0C1E]/50 backdrop-blur-xl">
              <div className="flex items-center gap-4 flex-1">
                <input 
                  type="text" 
                  value={selectedNote.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setSelectedNote({ ...selectedNote, title: newTitle });
                    handleUpdateNote(selectedNote.id, { title: newTitle });
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
                  onClick={() => handleUpdateNote(selectedNote.id, { visible_to_client: !selectedNote.visible_to_client })}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    selectedNote.visible_to_client ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-[var(--dark-grey)] hover:text-white"
                  )}
                >
                  <Globe size={14} />
                  {selectedNote.visible_to_client ? 'Visible to Client' : 'Private'}
                </button>
                <button 
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="p-2 text-[var(--dark-grey)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8" data-color-mode="dark">
              <MDEditor
                value={selectedNote.content}
                onChange={(val) => {
                  setSelectedNote({ ...selectedNote, content: val || '' });
                  handleUpdateNote(selectedNote.id, { content: val || '' });
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
              <StickyNote size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Select a note to edit</h3>
              <p className="text-[var(--dark-grey)]">Or create a new one to start loopin'.</p>
            </div>
            <button 
              onClick={handleCreateNote}
              className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-all"
            >
              <Plus size={20} />
              Create New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
