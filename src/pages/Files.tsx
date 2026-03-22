import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage, auth } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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

    const q = query(collection(db, 'projects', projectId, 'files'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFiles(filesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!projectId || !auth.currentUser) return;
    
    setUploading(true);
    for (const file of acceptedFiles) {
      try {
        const fileRef = ref(storage, `projects/${projectId}/files/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, 'projects', projectId, 'files'), {
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadURL,
          path: fileRef.fullPath,
          uploadedBy: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
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
    if (!projectId) return;
    try {
      const fileRef = ref(storage, file.path);
      await deleteObject(fileRef);
      await deleteDoc(doc(db, 'projects', projectId, 'files', file.id));
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
                <span>{file.createdAt ? formatDate(file.createdAt.toDate()) : 'Recently'}</span>
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
