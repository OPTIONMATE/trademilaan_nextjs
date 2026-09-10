"use client";

import { useState } from "react";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

export default function SignedAgreementsSection({ data }) {
  const [searchEmail, setSearchEmail] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  // Filter agreements by email
  const filteredData =
    !searchEmail || !data
      ? data
      : data.filter((a) =>
          (a.clientEmail || "").toLowerCase().includes(searchEmail.toLowerCase())
        );

  const handleDownload = async (agreementId, clientEmail) => {
    setDownloadingId(agreementId);
    setDownloadError(null);

    try {
      const response = await fetchWithCsrf(
        "/api/admin/signed-agreements/download-pdf",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agreementId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `agreement-${clientEmail || "unknown"}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setDownloadError(error.message);
    } finally {
      setDownloadingId(null);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-neutral-500 bg-white">
        <p className="text-lg">No signed agreements found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Box */}
      <div className="border rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Search by Email
        </label>
        <input
          type="email"
          placeholder="Enter client email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900"
        />
        {searchEmail && (
          <p className="text-xs text-neutral-500 mt-2">
            Found {filteredData?.length || 0} agreement(s)
          </p>
        )}
      </div>

      {/* Download Error Alert */}
      {downloadError && (
        <div className="border border-red-300 rounded-lg p-4 bg-red-50">
          <p className="text-sm text-red-700">Error: {downloadError}</p>
        </div>
      )}

      {/* Agreements List */}
      {filteredData && filteredData.length > 0 ? (
        <div className="space-y-3">
          {filteredData.map((a) => (
            <div
              key={a._id}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold">Agreement #{a._id?.substring(0, 8)}</div>
                  <div className="text-xs text-neutral-500">
                    {a.clientEmail || a.userId}
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {a.status || "Signed"}
                </span>
              </div>

              <div className="text-sm text-neutral-600 mb-3">
                <div>Client: {a.clientName || "Not Provided"}</div>
                <div>
                  Signed:{" "}
                  {a.signedTimestamp
                    ? new Date(a.signedTimestamp).toLocaleDateString()
                    : "-"}
                </div>
                {a.signedName && <div>Signature Name: {a.signedName}</div>}
              </div>

              <button
                type="button"
                onClick={() => handleDownload(a._id, a.clientEmail)}
                disabled={downloadingId === a._id}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {downloadingId === a._id ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Downloading...
                  </span>
                ) : (
                  <span>📥 Download PDF</span>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center text-neutral-500 bg-white">
          <p className="text-lg">No agreements match your search</p>
        </div>
      )}
    </div>
  );
}
