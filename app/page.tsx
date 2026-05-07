"use client";

import { FormEvent, useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Trash2, Download, File, Shield, RefreshCw,
  HardDrive, AlertCircle, CheckCircle2, X, ImageIcon, Music,
  Video, Archive, Code, FileType, Lock, Zap, Cloud,
} from "lucide-react";

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

function getFileIcon(mimetype: string) {
  if (mimetype.startsWith("image/")) return { Icon: ImageIcon, cls: "icon-image" };
  if (mimetype.startsWith("video/")) return { Icon: Video, cls: "icon-video" };
  if (mimetype.startsWith("audio/")) return { Icon: Music, cls: "icon-audio" };
  if (mimetype === "application/pdf") return { Icon: FileType, cls: "icon-pdf" };
  if (mimetype.includes("zip") || mimetype.includes("tar") || mimetype.includes("rar"))
    return { Icon: Archive, cls: "icon-zip" };
  if (mimetype.includes("javascript") || mimetype.includes("typescript") || mimetype.includes("json") || mimetype.includes("html") || mimetype.includes("css"))
    return { Icon: Code, cls: "icon-code" };
  if (mimetype.includes("word") || mimetype.includes("document") || mimetype.includes("text"))
    return { Icon: FileText, cls: "icon-doc" };
  return { Icon: File, cls: "icon-other" };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dragCounter = useRef(0);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/files`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch {
      setError("Connection to vault failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleUpload = async (fileToUpload: File | null = selectedFile) => {
    if (!fileToUpload) return;
    setError("");
    setStatus("Uploading...");
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      // Fake progress ticks for UX
      const tick = setInterval(() => setUploadProgress(p => Math.min(p + 12, 85)), 200);
      const res = await fetch(`${API_BASE}/files`, { method: "POST", body: formData });
      clearInterval(tick);
      setUploadProgress(100);

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Upload failed.");
      }

      setStatus("File secured!");
      setSelectedFile(null);
      await loadFiles();
      setTimeout(() => { setStatus(""); setUploadProgress(0); }, 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/files/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      setFiles(prev => prev.filter(f => f._id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current++; setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false); };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <>
      {/* Aurora bg */}
      <div className="aurora" aria-hidden>
        <div className="aurora-mid" />
      </div>
      <div className="noise" aria-hidden />

      <main style={{ position: "relative", zIndex: 2, minHeight: "100vh", padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>

          {/* ── HEADER ── */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              style={{
                width: 64, height: 64, borderRadius: 20,
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(139,92,246,0.15)",
              }}
            >
              <Lock size={28} color="#fff" />
            </motion.div>

            <div className="badge">
              <Shield size={10} /> FileVault · End-to-End Secure
            </div>

            <h1 style={{
              fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#f0f0ff",
            }}>
              Your files,{" "}
              <span style={{
                background: "linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                safe forever.
              </span>
            </h1>

            <p style={{ color: "rgba(200,200,230,0.5)", fontSize: "1.05rem", maxWidth: 480, lineHeight: 1.6 }}>
              Drag-and-drop storage with a real backend. Beautiful, fast, and built to impress.
            </p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}
            >
              <div className="stat-pill"><HardDrive size={13} /> {files.length} files</div>
              <div className="stat-pill"><Cloud size={13} /> {formatSize(totalSize)} stored</div>
              <div className="stat-pill"><Zap size={13} /> Live sync</div>
            </motion.div>
          </motion.header>

          {/* ── UPLOAD CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 20 }}
          >
            <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleUpload(); }}>
              {/* Drop Zone */}
              <div
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onClick={() => document.getElementById("file-input")?.click()}
                style={{
                  position: "relative",
                  borderRadius: 24,
                  padding: isDragging ? 3 : 2,
                  background: isDragging
                    ? "linear-gradient(135deg, #8b5cf6, #06b6d4, #ec4899, #8b5cf6)"
                    : "transparent",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  style={{ display: "none" }}
                  onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                />

                <div
                  className="glass"
                  style={{
                    borderRadius: isDragging ? 22 : 22,
                    minHeight: 220,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    padding: "40px 32px",
                    textAlign: "center",
                    border: isDragging ? "none" : "1px dashed rgba(139,92,246,0.25)",
                    background: isDragging ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.03)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {selectedFile ? (
                      <motion.div key="selected" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 64, height: 64, borderRadius: 18,
                          background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))",
                          border: "1px solid rgba(16,185,129,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <CheckCircle2 size={30} color="#10b981" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "1rem", color: "#f0f0ff", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {selectedFile.name}
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "rgba(200,200,230,0.4)", marginTop: 4 }}>
                            {formatSize(selectedFile.size)} · Ready to upload
                          </p>
                        </div>
                        <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                          style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(244,63,94,0.7)", fontSize: "0.75rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                          <X size={12} /> Remove
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                        <motion.div
                          animate={{ y: isDragging ? -6 : [0, -4, 0] }}
                          transition={isDragging ? {} : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                          style={{
                            width: 64, height: 64, borderRadius: 18,
                            background: "rgba(139,92,246,0.1)",
                            border: "1px solid rgba(139,92,246,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Upload size={26} color="#a78bfa" />
                        </motion.div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f0f0ff" }}>
                            {isDragging ? "Drop it!" : "Drop a file or click to browse"}
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "rgba(200,200,230,0.35)", marginTop: 6 }}>
                            Any format · Up to 10MB
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Upload progress bar */}
              <AnimatePresence>
                {uploading && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: 12, paddingInline: 4 }}>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status + Button row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <AnimatePresence mode="wait">
                  {(status || error) && (
                    <motion.div key={error || status}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      style={{
                        flex: 1, minWidth: 0,
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 14px", borderRadius: 12,
                        background: error ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)",
                        border: `1px solid ${error ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"}`,
                        fontSize: "0.82rem", fontWeight: 600,
                        color: error ? "#f87171" : "#34d399",
                      }}>
                      {error
                        ? <AlertCircle size={14} style={{ flexShrink: 0 }} />
                        : <CheckCircle2 size={14} style={{ flexShrink: 0 }} />}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {error || status}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="btn-primary"
                  style={{ flexShrink: 0 }}
                >
                  {uploading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                        <RefreshCw size={16} />
                      </motion.div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> Secure Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* ── FILE VAULT ── */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em", color: "#f0f0ff" }}>
                  Vault Contents
                </h2>
                <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginTop: 2 }}>
                  {files.length === 0 ? "No files yet" : `${files.length} file${files.length !== 1 ? "s" : ""} · ${formatSize(totalSize)}`}
                </p>
              </div>
              <button
                className="btn-ghost"
                onClick={loadFiles}
                title="Refresh"
                disabled={loading}
              >
                <motion.div animate={loading ? { rotate: 360 } : {}} transition={{ duration: 0.8, repeat: loading ? Infinity : 0, ease: "linear" }}>
                  <RefreshCw size={14} />
                </motion.div>
                Refresh
              </button>
            </div>

            {/* Skeleton */}
            {loading && files.length === 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                    style={{ height: 140, borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && files.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: "80px 20px", gap: 16, textAlign: "center",
                }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 24,
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <HardDrive size={32} color="rgba(139,92,246,0.4)" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "rgba(200,200,230,0.6)" }}>Vault is empty</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", marginTop: 6 }}>Upload your first file to get started.</p>
                </div>
              </motion.div>
            )}

            {/* File grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              <AnimatePresence mode="popLayout">
                {files.map((file, idx) => {
                  const { Icon, cls } = getFileIcon(file.mimetype);
                  const isDeleting = deletingId === file._id;
                  return (
                    <motion.div
                      key={file._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: -10 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      whileHover={{ y: -3, scale: 1.01 }}
                      style={{
                        borderRadius: 20,
                        padding: 20,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(12px)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        cursor: "default",
                        opacity: isDeleting ? 0.4 : 1,
                        transition: "opacity 0.2s",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                      }}
                    >
                      {/* Icon + name */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Icon size={20} className={cls} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{
                            fontWeight: 700, fontSize: "0.88rem",
                            color: "#f0f0ff", overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }} title={file.originalname}>
                            {file.originalname}
                          </p>
                          <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 3 }}>
                            {formatSize(file.size)} · {timeAgo(file.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <a
                          href={`${API_BASE}/uploads/${file.filename}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            flex: 1, display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 6,
                            height: 38, borderRadius: 10,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            fontSize: "0.78rem", fontWeight: 700,
                            color: "rgba(200,200,230,0.7)",
                            textDecoration: "none",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)";
                            (e.currentTarget as HTMLElement).style.color = "#f0f0ff";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                            (e.currentTarget as HTMLElement).style.color = "rgba(200,200,230,0.7)";
                          }}
                        >
                          <Download size={13} /> Download
                        </a>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(file._id)}
                          disabled={isDeleting}
                          title="Delete"
                        >
                          {isDeleting
                            ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}><RefreshCw size={14} /></motion.div>
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>

          {/* Footer */}
          <footer style={{ textAlign: "center", paddingTop: 16 }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,200,230,0.2)" }}>
              FileVault · End-to-End Secured · 2025
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
