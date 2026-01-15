"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ESignModal from "@/app/components/ESignModal";

const AgreementViewer = dynamic(
  () => import("@/app/components/AgreementViewer"),
  { ssr: false }
);

export default function AgreementModal({ onClose, onSuccess }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [checked, setChecked] = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [signedPdf, setSignedPdf] = useState(null);

  // Fetch agreement PDF
  useEffect(() => {
    const loadPDF = async () => {
      try {
        const res = await fetch("/api/agreement");
        if (!res.ok) throw new Error("Failed to fetch PDF");
        const data = await res.json();
        if (data.fileUrl) setFileUrl(data.fileUrl);
      } catch (err) {
        console.error("PDF Load Failed:", err);
      }
    };

    loadPDF();
  }, []);

  // Submitting agreement acceptance
  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/agreement/accept", { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept agreement");
      setShowSign(true);
    } catch (err) {
      console.error("ACCEPT ERROR:", err);
    }
  };

  // Called from ESignModal AFTER stamping
  const handleSigned = (signedUrl) => {
    setSignedPdf(signedUrl);  // store signed pdf url
    setShowSign(false);       // close signing modal
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
          >
            ✕
          </button>

          <div className="p-6 max-h-[80vh] overflow-y-auto">

            {/* ======================= SIGNED PREVIEW MODE ======================= */}
            {signedPdf ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Review Signed Agreement</h2>

                <iframe
                  src={signedPdf}
                  className="w-full h-[500px] border rounded-xl mb-4"
                />

                <div className="flex gap-4 justify-center">
                  <a
                    href={signedPdf}
                    target="_blank"
                    download="signed-agreement.pdf"
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
                  >
                    Download PDF
                  </a>

                  <button
                    onClick={() => onSuccess(signedPdf)}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Continue to Payment
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* ======================= NORMAL AGREEMENT VIEW ======================= */}
                <h2 className="text-xl font-semibold mb-4">User Agreement</h2>

                {!fileUrl && <p>Loading PDF...</p>}

                {fileUrl && (
                  <div className="border rounded-lg shadow mb-4">
                    <AgreementViewer fileUrl={fileUrl} />
                  </div>
                )}

                {fileUrl && (
                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                      />
                      I have read the Agreement and will proceed to E-Sign.
                    </label>

                    <button
                      onClick={handleSubmit}
                      disabled={!checked}
                      className={`mt-4 px-4 py-2 rounded-lg text-white ${
                        checked ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-400"
                      }`}
                    >
                      Submit & Continue
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================= SIGN MODAL ======================= */}
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
