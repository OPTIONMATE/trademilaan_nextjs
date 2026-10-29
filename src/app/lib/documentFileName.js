// Shared (server + client) naming for agreement / invoice PDFs.
// Format: "<PAN>_<DocType>_<YYYY-MM-DD>.pdf", e.g. "ABCDE1234F_Invoice_2026-10-29.pdf".
// PAN is reduced to [A-Z0-9] so it is safe inside a Content-Disposition
// header and as a filesystem name. Missing PAN or invalid date drops that part.
// Date is the document's own date (signed / paid), rendered in IST so a
// UTC server and an Indian browser produce the same name.
export function buildDocumentFileName(pan, docType, date) {
  const safePan = String(pan || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
  const parsed = date ? new Date(date) : null;
  const datePart =
    parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
      : "";
  return [safePan, docType, datePart].filter(Boolean).join("_") + ".pdf";
}

// Reads the filename the server set in Content-Disposition so the browser
// download matches the server/email name. Falls back when the header is absent.
export function getFileNameFromResponse(response, fallback) {
  const header = response?.headers?.get("Content-Disposition") || "";
  const match = header.match(/filename="?([^";]+)"?/i);
  return match ? match[1].trim() : fallback;
}
