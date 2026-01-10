"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/admin/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchDocuments();
        e.target.value = "";
      } else {
        const error = await res.json();
        alert(error.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, filename) => {
    if (!confirm(`Delete ${filename}?`)) return;

    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchDocuments();
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete document");
    }
  };

  if (loading || !user || user.role !== "admin") {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-lime-50/40 px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200/70 bg-white/80 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Welcome back, {user.username || user.email}. This space is reserved for administrators.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Email</p>
            <p className="text-base font-semibold text-neutral-900">{user.email}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Role</p>
            <p className="text-base font-semibold text-neutral-900">{user.role}</p>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Terms & Conditions Documents</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Upload PDF documents for terms, conditions, and regulatory compliance
              </p>
            </div>
          </div>

          {/* Upload Area */}
          <div className="relative">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="document-upload"
            />
            <label
              htmlFor="document-upload"
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition cursor-pointer ${
                uploading
                  ? "border-neutral-300 bg-neutral-50"
                  : "border-lime-300 bg-lime-50/50 hover:bg-lime-50 hover:border-lime-400"
              }`}
            >
              <svg
                className={`w-12 h-12 mb-3 ${uploading ? "text-neutral-400" : "text-lime-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm font-semibold text-neutral-900 mb-1">
                {uploading ? "Uploading..." : "Click to upload PDF"}
              </p>
              <p className="text-xs text-neutral-500">
                Upload or re-upload documents as regulations change
              </p>
            </label>
          </div>

          {/* Documents List */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Uploaded Documents</h3>
            {loadingDocs ? (
              <p className="text-sm text-neutral-500">Loading documents...</p>
            ) : documents.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 text-center">
                <p className="text-sm text-neutral-500">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-red-100 p-2">
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{doc.filename}</p>
                        <p className="text-xs text-neutral-500">
                          {doc.size} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id, doc.filename)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
