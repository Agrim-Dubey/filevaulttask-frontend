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
  const [loading, setLoading] = useState(false);

  async function loadFiles() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/files`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setStatus("Unable to load files");
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

    try {
      setLoading(true);
      setStatus("Uploading file...");
      const res = await fetch(`${API_BASE}/files`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }

      setStatus("Upload complete");
      setSelectedFile(null);
      await loadFiles();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus("Upload failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this file?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/files/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Delete failed");
      }

      setStatus("File deleted");
      await loadFiles();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus("Delete failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">FileVault</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Simple file upload</h1>
            </div>
            <p className="text-sm text-slate-500">Connected to backend at <span className="font-medium text-slate-900">filevaulttask.onrender.com</span></p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Choose a file</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing..." : "Upload"}
              </button>
            </div>
            <p className="text-sm text-slate-500">{status}</p>
          </form>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Files</p>
              <h2 className="text-xl font-semibold text-slate-900">Uploaded items</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{files.length} files</span>
          </div>

          {loading && files.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">Loading files…</div>
          ) : files.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">No files uploaded yet.</div>
          ) : (
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{file.originalname}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                      <span>{formatSize(file.size)}</span>
                      <span>{new Date(file.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
                    <a
                      href={`${API_BASE}/uploads/${file.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(file._id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
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
