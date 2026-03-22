import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  File, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Trash2, 
  Search,
  UploadCloud,
  X,
  Loader2
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function Files() {
  const { projectId } = useParams();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!projectId) return;

    fetchFiles();

    const channel = supabase
      .channel(`files_${projectId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'files',
        filter: `project_id=eq.${projectId}`
      }, () => {
        fetchFiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const fetchFiles = async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch files');
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!projectId) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    for (const file of acceptedFiles) {
      try {
        const filePath = `${projectId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-files')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('files')
          .insert([{
            name: file.name,
            size: file.size,
            type: file.type,
            url: publicUrl,
            path: filePath,
            project_id: projectId,
            uploaded_by: user.id
          }]);

        if (dbError) throw dbError;

        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        console.error(error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
  }, [projectId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDelete = async (file: any) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([file.path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      toast.success('File deleted');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Project Files</h2>
          <p className="text-[var(--dark-grey)]">Securely store and share project assets.</p>
        </div>
      </header>

      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer",
          isDragActive ? "border-[#4F46E5] bg-[#4F46E5]/5" : "border-white/5 bg-[#0C0C1E] hover:border-white/10"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#4F46E5]" size={48} />
            <p className="text-white font-medium">Uploading files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-[var(--dark-grey)]">
              <UploadCloud size={32} />
            </div>
            <div>
              <p className="text-white font-medium">Drag & drop files here, or click to select</p>
              <p className="text-xs text-[var(--dark-grey)] mt-1">Max file size: 50MB</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dark-grey)]" size={18} />
          <input 
            type="text" 
            placeholder="Search files..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0C0C1E] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[#4F46E5] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-[#0C0C1E] border border-white/5 p-4 rounded-2xl group hover:border-white/10 transition-all">
            <div className="aspect-square bg-[#060714] rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
              {file.type.startsWith('image/') ? (
                <img src={file.url} alt={file.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              ) : (
                <FileText size={48} className="text-[var(--dark-grey)]" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white text-black rounded-lg hover:scale-110 transition-transform"
                >
                  <Download size={18} />
                </a>
                <button 
                  onClick={() => handleDelete(file)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-white truncate text-sm">{file.name}</p>
              <div className="flex items-center justify-between text-[10px] text-[var(--dark-grey)]">
                <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                <span>{file.created_at ? formatDate(new Date(file.created_at)) : 'Recently'}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredFiles.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-2">
            <File size={48} className="mx-auto text-[var(--dark-grey)] opacity-20" />
            <p className="text-[var(--dark-grey)]">No files uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
