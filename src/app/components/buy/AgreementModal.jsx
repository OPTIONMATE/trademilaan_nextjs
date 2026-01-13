"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ESignModal from "@/app/components/ESignModal";

// Load AgreementViewer only in browser
const AgreementViewer = dynamic(
  () => import("@/app/components/AgreementViewer"),
  { ssr: false }
);

export default function AgreementModal({ onClose, onSuccess }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [checked, setChecked] = useState(false);
  const [showSign, setShowSign] = useState(false);

  // Fetch latest agreement PDF uploaded by admin
  useEffect(() => {
    fetch("/api/agreement")
      .then(res => res.json())
      .then(data => setFileUrl(data.fileUrl))
      .catch(err => console.error("PDF Load Failed:", err));
  }, []);

  const handleSubmit = async () => {
    await fetch("/api/agreement/accept", {
      method: "POST"
    });

    setShowSign(true);
  };

  const handleSigned = (signedPdfUrl) => {
    console.log("Signed PDF URL:", signedPdfUrl);
    
    // Force download with proper filename
    const link = document.createElement("a");
    link.href = signedPdfUrl;
    link.download = `signed-agreement-${Date.now()}.pdf`;
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowSign(false);
    onSuccess();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl text-slate-500 hover:text-slate-700"
          >
            ×
          </button>

          <div className="p-8 max-h-[82vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">User Agreement</h2>

            {/* PDF Loader Status */}
            {!fileUrl && <p className="text-slate-600">Loading PDF...</p>}

            {/* PDF Viewer */}
            {fileUrl && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6">
                <AgreementViewer fileUrl={fileUrl} />
              </div>
            )}

            {/* Checkbox + Submit */}
            {fileUrl && (
              <div className="mt-4">
                <label className="flex items-center gap-3 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  I have read and understood the agreement and will E-Sign it.
                </label>

                <button
                  disabled={!checked}
                  onClick={handleSubmit}
                  className={`mt-6 px-4 py-3 rounded-lg font-semibold transition ${
                    checked
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Submit & Continue to E-Sign
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* E-Sign Modal */}
      {showSign && (
        <ESignModal
          pdfUrl={fileUrl}
          onClose={() => setShowSign(false)}
          onSaved={handleSigned}
        />
      )}
    </>
  );
}
