"use client";

import { useState, useRef } from "react";
// import SignaturePad from "react-signature-canvas";


import dynamic from "next/dynamic";

const SignaturePad = dynamic(() => import("react-signature-canvas"), {
  ssr: false,
});

export default function ESignModal({ onClose, onSaved, pdfUrl }) {
  const [tab, setTab] = useState("typed");
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("font1");
  const [uploadFile, setUploadFile] = useState(null);
  const sigCanvas = useRef(null);

  const fonts = {
    font1: { fontFamily: "cursive" },
    font2: { fontFamily: "serif" },
    font3: { fontFamily: "monospace" },
  };

  const save = async () => {
    let signatureUrl = null;

    if (tab === "typed") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 400;
      canvas.height = 100;
      ctx.font = `40px ${fonts[selectedFont].fontFamily}`;
      ctx.fillText(typedName, 10, 60);
      signatureUrl = canvas.toDataURL("image/png");
    }

    if (tab === "draw") {
      signatureUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    }

    if (tab === "upload" && uploadFile) {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch("/api/signature/upload", { method: "POST", body: formData });
      const data = await res.json();
      signatureUrl = data.url;
    }

    const stampRes = await fetch("/api/sign/stamp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfUrl, signatureUrl }),
    });

    const data = await stampRes.json();
    onSaved(data.signedPdfUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded w-[500px]">
        <h2 className="text-center font-semibold mb-4">Select Mode of Signature</h2>

        <div className="flex mb-4 border-b">
          {["typed", "draw", "upload"].map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-4 py-2">
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {tab === "typed" && (
          <input className="border p-2 w-full mb-3" value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="Type your name" />
        )}

        {tab === "draw" && (
          <SignaturePad ref={sigCanvas} canvasProps={{ className: "border w-full h-40" }} />
        )}

        {tab === "upload" && (
          <input type="file" accept="image/*" onChange={(e) => setUploadFile(e.target.files[0])} />
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose}>Cancel</button>
          <button onClick={save}>Insert</button>
        </div>
      </div>
    </div>
  );
}
