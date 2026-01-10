"use client";

import { useEffect, useState } from "react";
import AgreementViewer from "@/app/components/AgreementViewer";
import { useRouter } from "next/navigation";
import ESignModal from "@/app/components/ESignModal";

export default function AgreementPage() {
  const [fileUrl, setFileUrl] = useState(null);
  const [canAccept, setCanAccept] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showSign, setShowSign] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/agreement")
      .then(res => res.json())
      .then(data => setFileUrl(data.fileUrl));
  }, []);

  const handleSubmit = async () => {
    await fetch("/api/agreement/accept", { method: "POST" });
    setShowSign(true);
  };

  const handleSigned = (signedPdfUrl) => {
    console.log("Signed PDF:", signedPdfUrl);
    router.push("/dashboard");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>User Agreement</h2>

      {!fileUrl && <p>No PDF found.</p>}

      {fileUrl && (
        <AgreementViewer fileUrl={fileUrl} onScrollEnd={() => setCanAccept(true)} />
      )}

      {canAccept && (
        <div style={{ marginTop: 20 }}>
          <label>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />{" "}
            I have read and understood the agreement terms and will E-Sign it
          </label>

          <div style={{ marginTop: 15 }}>
            <button
              disabled={!checked}
              onClick={handleSubmit}
              style={{
                padding: "10px 20px",
                background: checked ? "#6a0dad" : "#aaa",
                color: "#fff",
                borderRadius: 6,
                cursor: checked ? "pointer" : "not-allowed"
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {showSign && (
        <ESignModal
          pdfUrl={fileUrl}
          onClose={() => setShowSign(false)}
          onSaved={handleSigned}
        />
      )}
    </div>
  );
}
