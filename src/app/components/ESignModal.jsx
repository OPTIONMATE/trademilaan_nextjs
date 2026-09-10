"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { fetchWithCsrf } from "@/app/lib/csrfClient";

const SignaturePad = dynamic(() => import("react-signature-canvas"), {
  ssr: false,
});

export default function ESignModal({ onClose, onSaved, pdfUrl }) {
  const [tab, setTab] = useState("typed");
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("font1");
  const [uploadFile, setUploadFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const sigCanvas = useRef(null);

  const fonts = {
    font1: { fontFamily: "cursive" },
    font2: { fontFamily: "serif" },
    font3: { fontFamily: "monospace" },
  };

  const save = async () => {
    if (saving) return;

    let signatureUrl = null;
    let signedName = null;

    if (tab === "typed") {
      if (!typedName.trim()) return;
      signedName = typedName.trim();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 400;
      canvas.height = 100;
      ctx.font = `40px ${fonts[selectedFont].fontFamily}`;
      ctx.fillText(typedName, 10, 60);
      signatureUrl = canvas.toDataURL("image/png");
    }

    if (tab === "draw") {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;
      signatureUrl = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
    }

    if (tab === "upload" && uploadFile) {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetchWithCsrf("/api/signature/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      signatureUrl = data.url;
    }

    if (!signatureUrl) return;

    setSaving(true);

    // Return signed data with timestamp
    const signedTimestamp = new Date().toISOString();
    const signedData = {
      signatureUrl,
      signedName,
      signedTimestamp,
      signatureTab: tab,
    };

    setSaving(false);
    onSaved(signedData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-8 max-h-[82vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold text-center text-slate-900 mb-6">
            E-Sign Agreement
          </h2>
          <p className="text-center text-slate-700 mb-4">
            Please enter your full name as it appears in your official
            documents. This will be used as your digital signature on the
            agreement.
          </p>

          <div className="flex justify-center mb-6 border border-slate-200 rounded-lg overflow-hidden">
            {["typed", "draw", "upload"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                  tab === t
                    ? "bg-purple-600 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="max-w-xl mx-auto">
            {tab === "typed" && (
              <>
                <input
                  className="border border-slate-300 rounded-lg p-3 w-full mb-3 text-slate-900"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your full name"
                />
                {typedName.trim().length < 3 && (
                  <p className="text-xs text-red-600 mb-2">
                    Full name must be at least 3 characters.
                  </p>
                )}
              </>
            )}

            {tab === "draw" && (
              <SignaturePad
                ref={sigCanvas}
                canvasProps={{
                  className: "border border-slate-300 rounded-lg w-full h-48",
                }}
              />
            )}

            {tab === "upload" && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="text-sm text-slate-700"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={save}
              disabled={
                saving || (tab === "typed" && typedName.trim().length < 3)
              }
              className={`px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 ${
                saving || (tab === "typed" && typedName.trim().length < 3)
                  ? "opacity-80 cursor-not-allowed"
                  : ""
              }`}
            >
              {saving ? "Stamping..." : "Insert"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
