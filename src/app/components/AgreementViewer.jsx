"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState, useRef } from "react";

// Worker file required for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function AgreementViewer({ fileUrl, onScrollEnd }) {
  const viewerRef = useRef(null);
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleScroll = () => {
    const el = viewerRef.current;
    if (!el) return;

    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 10) {
      onScrollEnd();
    }
  };

  return (
    <div
      ref={viewerRef}
      onScroll={handleScroll}
      style={{ height: "80vh", overflowY: "auto", border: "1px solid #ccc" }}
    >
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from({ length: numPages }, (_, i) => (
          <Page key={i} pageNumber={i + 1} />
        ))}
      </Document>
    </div>
  );
}
