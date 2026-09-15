import React from "react";

/**
 * Service Provider (RA) signature — the single canonical representation of
 * Sasikumar Peyyala's signature.
 *
 * Canonical asset: /public/ra-signature.jpeg (same file that
 * generateCompletePDF.js reads from disk for the final PDF).
 *
 * This is NOT the client's signature. It is a fixed asset and must never be
 * derived from, or depend on, the client's signatureData / signatureTab
 * (draw | typed | upload) captured in ESignModal.
 */
export default function RASignature() {
  return (
    <img
      src="/ra-signature.jpeg"
      alt="RA Signature"
      style={{ maxWidth: 120, maxHeight: 60, objectFit: "contain" }}
    />
  );
}
