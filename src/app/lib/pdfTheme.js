import { rgb } from "pdf-lib";

// Shared visual language for the server-generated PDFs (agreement and invoice).
// Used only by pdf-lib code in this folder.

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return rgb(
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  );
}

export const pdfColors = {
  primary: hexToRgb("#0052CC"),
  charcoal: hexToRgb("#1E293B"),
  lightGray: hexToRgb("#F8FAFC"),
  white: hexToRgb("#FFFFFF"),
  muted: hexToRgb("#64748B"),
  border: hexToRgb("#E2E8F0"),
};

const FOOTER_TEXT = "Trademilaan | SEBI RA: INH000019327";
const FOOTER_MARGIN = 50;

// Draws the repeating footer rule, brand/registration text and "Page X of Y"
// on every page. Must run after all content is drawn, when the page count is known.
export function drawPdfFooters(pdfDoc, font) {
  const pages = pdfDoc.getPages();
  pages.forEach((page, index) => {
    const { width } = page.getSize();
    page.drawLine({
      start: { x: FOOTER_MARGIN, y: 40 },
      end: { x: width - FOOTER_MARGIN, y: 40 },
      color: pdfColors.border,
      thickness: 0.8,
    });
    page.drawText(FOOTER_TEXT, {
      x: FOOTER_MARGIN,
      y: 26,
      size: 8,
      font,
      color: pdfColors.muted,
    });
    const pageLabel = `Page ${index + 1} of ${pages.length}`;
    page.drawText(pageLabel, {
      x: width - FOOTER_MARGIN - font.widthOfTextAtSize(pageLabel, 8),
      y: 26,
      size: 8,
      font,
      color: pdfColors.muted,
    });
  });
}
