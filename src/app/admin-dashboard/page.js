"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [agreements, setAgreements] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Redirect non-admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Fetch agreements on mount
  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch("/api/admin/agreement");
      if (!res.ok) throw new Error("Failed fetch");

      const data = await res.json();
      setAgreements(data.agreements || []);
    } catch (err) {
      console.error("Failed to fetch agreements:", err);
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
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/agreement", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Agreement uploaded successfully!");
        await fetchAgreements();
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading || !user || user.role !== "admin") return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-lime-50/40 px-6 py-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-neutral-200/70 bg-white/80 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur">

        {/* Header */}
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Welcome back, {user.username || user.email}.
        </p>

        {/* Upload Agreement */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">User Agreement Versions</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Upload new agreement versions. Latest version will be shown to users.
          </p>

          {/* Upload Box */}
          <div className="relative mt-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="agreement-upload"
            />
            <label
              htmlFor="agreement-upload"
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition ${
                uploading ? "border-neutral-300 bg-neutral-50" : "border-lime-300 bg-lime-50/50 hover:bg-lime-50 hover:border-lime-400"
              }`}
            >
              <p className="text-sm font-semibold text-neutral-900 mb-1">
                {uploading ? "Uploading..." : "Click to upload agreement PDF"}
              </p>
            </label>
          </div>

          {/* Agreements List */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Previous Versions</h3>

            {loadingDocs ? (
              <p className="text-sm text-neutral-500">Loading...</p>
            ) : agreements.length === 0 ? (
              <div className="border rounded-lg p-3 text-center text-neutral-500">
                No agreements uploaded yet
              </div>
            ) : (
              <div className="space-y-2">
                {agreements.map((ag) => (
                  <div
                    key={ag._id}
                    className="flex items-center justify-between rounded-lg border p-4 bg-white hover:shadow-sm transition"
                  >
                    <div>
                      <p className="font-semibold text-neutral-900">
                        Agreement v{ag.version}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Uploaded {new Date(ag.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <a
                      href={ag.pdfUrl}
                      target="_blank"
                      className="text-xs font-semibold border px-3 py-1.5 rounded-lg text-neutral-700 hover:bg-neutral-50"
                    >
                      View PDF
                    </a>
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
