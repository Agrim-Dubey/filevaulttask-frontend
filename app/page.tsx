"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  File, 
  Shield, 
  Clock, 
  HardDrive,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = "https://filevaulttask.onrender.com";

type FileItem = {
  _id: string;
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
};

function formatSize(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("Ready to secure your files");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/files`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the vault.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (fileToUpload: File | null = selectedFile) => {
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append("file", fileToUpload);
    setError("");
    setStatus("Encrypting and uploading...");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/files`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Vault entry denied.");
      }

      setStatus("Upload successful.");
      setSelectedFile(null);
      await loadFiles();
      
      // Reset status after 3 seconds
      setTimeout(() => setStatus("Ready to secure your files"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setStatus("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleUpload();
  };

  const handleDelete = async (id: string) => {
    setError("");
    setStatus("Removing from vault...");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/files/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Purge failed.");
      }

      setStatus("File purged from vault.");
      await loadFiles();
      setTimeout(() => setStatus("Ready to secure your files"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setStatus("Action failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto upload on drop for better UX
      // handleUpload(file);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <header className="text-center space-y-4 animate-in">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider"
          >
            <Shield className="w-3 h-3" />
            FileVault Secure
          </motion.div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
            Store your files <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
              with absolute peace.
            </span>
          </h1>
          <p className="max-w-xl mx-auto text-slate-500 text-lg">
            A premium, high-security file storage solution. Simple, fast, and remarkably beautiful.
          </p>
        </header>

        {/* Upload Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-[40px] p-2 sm:p-4"
        >
          <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-slate-100">
            <form onSubmit={onFormSubmit} className="space-y-6">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative group cursor-pointer rounded-[24px] border-2 border-dashed transition-all duration-300 min-h-[220px] flex flex-col items-center justify-center p-8 text-center",
                  isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-slate-200 hover:border-primary/50 bg-slate-50/50"
                )}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
                
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500",
                  selectedFile ? "bg-green-500 text-white rotate-0" : "bg-white text-slate-400 group-hover:text-primary group-hover:scale-110 shadow-sm"
                )}>
                  {selectedFile ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-slate-900 font-bold text-lg max-w-xs truncate">{selectedFile.name}</p>
                    <p className="text-slate-500 text-sm">{formatSize(selectedFile.size)}</p>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="mt-2 text-rose-500 hover:text-rose-600 font-medium text-xs flex items-center gap-1 mx-auto"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-900 font-bold text-lg">Click or drag a file to upload</p>
                    <p className="text-slate-500 text-sm mt-1">Images, PDFs, or any document up to 10MB</p>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <div className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-colors",
                    error ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-slate-50 border-slate-100 text-slate-600"
                  )}>
                    {error ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0 text-primary" />}
                    <span className="text-sm font-medium truncate">{error || status}</span>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!selectedFile || loading}
                  className="w-full sm:w-auto h-[60px] px-10 rounded-2xl bg-slate-900 text-white font-bold text-base transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-slate-200"
                >
                  {loading ? "Processing..." : "Secure File"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Files List Section */}
        <section className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Your Secure Files</h2>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                {files.length} items stored in the cloud
              </p>
            </div>
            
            <button 
              onClick={loadFiles}
              className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400"
              title="Refresh"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {files.map((file, idx) => (
                <motion.div
                  key={file._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="group glass-card rounded-[32px] p-5 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-sm">
                      <File className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-900 font-bold text-base truncate pr-6" title={file.originalname}>
                        {file.originalname}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {formatSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <a
                      href={`${API_BASE}/uploads/${file.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(file._id)}
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && files.length === 0 && (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-[32px] bg-slate-100 animate-pulse border border-slate-200" />
              ))
            )}

            {!loading && files.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <File className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-xl">The vault is empty</p>
                  <p className="text-slate-400 text-sm mt-1">Upload your first file to get started.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 pb-8 text-center">
          <p className="text-slate-400 text-xs font-medium tracking-widest uppercase">
            Powered by FileVault Technology • 2024
          </p>
        </footer>
      </div>
    </main>
  );
}
