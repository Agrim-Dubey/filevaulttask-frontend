"use client";

import { FormEvent, useEffect, useState } from "react";

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
  const [status, setStatus] = useState("Ready to upload");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadFiles() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/files`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load files.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    setError("");
    setStatus("Uploading file...");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/files`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed.");
      }

      setStatus("Upload complete.");
      setSelectedFile(null);
      await loadFiles();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        setStatus("Upload failed.");
      } else {
        setError("Upload failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this file?")) return;

    setError("");
    setStatus("Deleting file...");

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/files/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Delete failed.");
      }

      setStatus("File deleted.");
      await loadFiles();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        setStatus("Delete failed.");
      } else {
        setError("Delete failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10">
        <div className="rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-sm shadow-slate-100 backdrop-blur-xl">
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">FileVault</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Upload files with confidence</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Minimal interface. Real backend connection to <span className="font-semibold text-slate-900">filevaulttask.onrender.com</span>.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <label className="flex min-h-[56px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-700 shadow-sm transition hover:border-slate-300">
                <span className="truncate text-sm text-slate-600">{selectedFile ? selectedFile.name : "No file chosen"}</span>
                <input
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>

              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="h-14 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <p className={error ? "text-rose-600" : "text-slate-500"}>{error || status}</p>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-600">{files.length} files</span>
            </div>
          </form>
        </div>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-100">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Files</p>
              <h2 className="text-lg font-semibold text-slate-900">Uploaded items</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{files.length}</span>
          </div>

          {loading && files.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">Loading files…</div>
          ) : files.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">No files uploaded yet.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {files.map((file) => (
                <div key={file._id} className="flex flex-col gap-4 border-b border-slate-100 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{file.originalname}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatSize(file.size)} · {new Date(file.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`${API_BASE}/uploads/${file.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(file._id)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
