import ExcelJS from "exceljs";
import { formatISTDateTime, formatPeriodLabel } from "./schedule";

const IST_OFFSET_MS = 330 * 60 * 1000;
const BRAND = "FF9BE749";
const FORMATS = {
  date: "dd-mmm-yyyy",
  datetime: "dd-mmm-yyyy hh:mm",
  inr: '"₹"#,##0',
};

// Excel has no timezone: shift to IST wall-clock so cells show Indian time.
const toExcelDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getTime() + IST_OFFSET_MS);
};
const yesNo = (v) => (v ? "Yes" : "No");

function styleHeader(sheet) {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FF111827" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
  header.alignment = { vertical: "middle", wrapText: true };
  header.height = 30;
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

/**
 * columns: [{ header, key, width, type?: "date"|"datetime"|"inr"|"bool", value?: (row) => any }]
 */
function addTableSheet(workbook, name, columns, rows, emptyText = "No records for this period") {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width || 16 }));

  for (const row of rows) {
    const values = {};
    for (const c of columns) {
      const raw = c.value ? c.value(row) : row[c.key];
      if (c.type === "date" || c.type === "datetime") values[c.key] = toExcelDate(raw);
      else if (c.type === "bool") values[c.key] = yesNo(raw);
      else values[c.key] = raw ?? "";
    }
    sheet.addRow(values);
  }

  columns.forEach((c, i) => {
    if (FORMATS[c.type]) sheet.getColumn(i + 1).numFmt = FORMATS[c.type];
  });
  styleHeader(sheet);

  if (rows.length) {
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  } else {
    sheet.addRow([emptyText]).font = { italic: true, color: { argb: "FF6B7280" } };
  }
  return sheet;
}

function addSummarySheet(workbook, report) {
  const { summary: s, period, previous, generatedAt } = report;
  const sheet = workbook.addWorksheet("Summary");
  sheet.columns = [
    { header: "Metric", key: "metric", width: 42 },
    { header: "This period", key: "current", width: 18 },
    { header: "Previous period", key: "previous", width: 18 },
  ];

  const rows = [
    ["Report period", formatPeriodLabel(period), formatPeriodLabel(previous)],
    ["Generated at (IST)", formatISTDateTime(generatedAt), ""],
    [],
    ["CLIENTS & SUBSCRIPTIONS"],
    ["Total paid clients", s.totalClients],
    ["Active subscriptions", s.activeClients],
    ["Expiring in next 7 days", s.expiringSoon],
    ["Expired subscriptions", s.expiredClients],
    ["Total registered users", s.totalUsers],
    ["New signups", s.newUsers],
    [],
    ["PAYMENTS & REVENUE"],
    ["Payments received", s.paymentsCount, s.previousPaymentsCount],
    ["Revenue – base (excl. GST)", s.revenueBase],
    ["Revenue – GST (18%)", s.revenueGst],
    ["Revenue – total", s.revenueTotal, s.previousRevenueTotal],
    [],
    ["DOCUMENTS"],
    ["Agreements signed", s.agreementsSigned],
    ["Invoices issued", s.invoicesIssued],
    ["Active clients – agreement not mailed", s.agreementsNotMailed],
    ["Active clients – no signed agreement", s.clientsWithoutAgreement],
    ["Active clients – invoice not mailed", s.invoicesNotMailed],
    [],
    ["COMPLAINTS"],
    ["Complaints / messages received", s.complaintsReceived],
    ["Open complaints (pending + in progress)", s.complaintsOpen],
  ];
  const sectionRows = [];
  rows.forEach((r) => {
    const row = sheet.addRow(r);
    if (r.length === 1) sectionRows.push(row);
  });
  sectionRows.forEach((row) => {
    row.font = { bold: true, color: { argb: "FF4D7C0F" } };
  });
  for (const label of ["Revenue – base (excl. GST)", "Revenue – GST (18%)", "Revenue – total"]) {
    const row = sheet.getColumn(1).values.indexOf(label);
    if (row > 0) {
      sheet.getCell(row, 2).numFmt = FORMATS.inr;
      sheet.getCell(row, 3).numFmt = FORMATS.inr;
    }
  }
  styleHeader(sheet);
}

/** Builds the .xlsx workbook and returns it as a Buffer. */
export async function buildAdminReportWorkbook(report) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Trademilaan";
  workbook.created = report.generatedAt;

  addSummarySheet(workbook, report);

  addTableSheet(
    workbook,
    "Clients",
    [
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 14 },
      { header: "PAN", key: "pan", width: 13 },
      { header: "DOB", key: "dob", width: 12 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "State", key: "state", width: 16 },
      { header: "Signed up", key: "signupDate", type: "date", width: 13 },
      { header: "Last login", key: "lastLogin", type: "datetime", width: 17 },
      { header: "Plan", key: "planName", width: 24 },
      { header: "Plan type", key: "planType", width: 11 },
      { header: "Duration (days)", key: "planDuration", width: 10 },
      { header: "Amount paid", key: "amount", type: "inr", width: 12 },
      { header: "Coupon", key: "coupon", width: 12 },
      { header: "Paid on", key: "paidAt", type: "date", width: 13 },
      { header: "Valid from", key: "validFrom", type: "date", width: 13 },
      { header: "Valid to", key: "validTo", type: "date", width: 13 },
      { header: "Days remaining", key: "daysRemaining", width: 10 },
      { header: "Status", key: "status", width: 14 },
      { header: "No. of purchases", key: "purchases", width: 10 },
      { header: "Total paid (all time)", key: "totalPaid", type: "inr", width: 14 },
      { header: "Agreement signed on", key: "agreementSignedAt", type: "date", width: 14 },
      { header: "Agreement mailed", key: "agreementMailed", type: "bool", width: 10 },
      { header: "Invoice no. (Razorpay ID)", key: "invoiceNo", width: 22 },
      { header: "Invoice mailed", key: "invoiceMailed", type: "bool", width: 10 },
      { header: "Complaints (total)", key: "complaintsTotal", width: 10 },
      { header: "Complaints (open)", key: "complaintsOpen", width: 10 },
      { header: "Risk profile done", key: "riskProfileDone", type: "bool", width: 10 },
    ],
    report.clients,
    "No paid clients yet",
  );

  addTableSheet(
    workbook,
    "Payments",
    [
      { header: "Paid on", key: "paidAt", type: "datetime", width: 17 },
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 14 },
      { header: "PAN", key: "pan", width: 13 },
      { header: "Plan", key: "planName", width: 24 },
      { header: "Base", key: "base", type: "inr", width: 11 },
      { header: "GST", key: "gst", type: "inr", width: 10 },
      { header: "Total", key: "total", type: "inr", width: 11 },
      { header: "Coupon", key: "coupon", width: 12 },
      { header: "Razorpay payment ID", key: "paymentId", width: 22 },
      { header: "Razorpay order ID", key: "orderId", width: 22 },
      { header: "Valid from", key: "validFrom", type: "date", width: 13 },
      { header: "Valid to", key: "validTo", type: "date", width: 13 },
    ],
    report.payments,
  );

  addTableSheet(
    workbook,
    "Agreements",
    [
      { header: "Signed at", key: "signedAt", type: "datetime", width: 17 },
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 14 },
      { header: "PAN", key: "pan", width: 13 },
      { header: "Plan", key: "planName", width: 24 },
      { header: "Plan type", key: "planType", width: 11 },
      { header: "IP address", key: "ipAddress", width: 16 },
      { header: "Status", key: "status", width: 10 },
      { header: "Mailed to client", key: "mailed", type: "bool", width: 10 },
      { header: "Mailed at", key: "mailedAt", type: "datetime", width: 17 },
      { header: "Downloads", key: "downloads", width: 10 },
    ],
    report.agreements,
  );

  addTableSheet(
    workbook,
    "Invoices",
    [
      { header: "Invoice date", key: "date", type: "datetime", width: 17 },
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "PAN", key: "pan", width: 13 },
      { header: "Plan", key: "planName", width: 24 },
      { header: "Base", key: "base", type: "inr", width: 11 },
      { header: "GST", key: "gst", type: "inr", width: 10 },
      { header: "Total", key: "total", type: "inr", width: 11 },
      { header: "Valid from", key: "validFrom", type: "date", width: 13 },
      { header: "Valid to", key: "validTo", type: "date", width: 13 },
      { header: "Razorpay payment ID", key: "paymentId", width: 22 },
      { header: "Mailed to client", key: "mailed", type: "bool", width: 10 },
    ],
    report.invoices,
  );

  addTableSheet(
    workbook,
    "Expiring & Expired",
    [
      { header: "Status", key: "status", width: 14 },
      { header: "Days remaining", key: "daysRemaining", width: 10 },
      { header: "Valid to", key: "validTo", type: "date", width: 13 },
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 14 },
      { header: "Plan", key: "planName", width: 24 },
      { header: "Amount paid", key: "amount", type: "inr", width: 12 },
    ],
    report.expiring,
    "No subscriptions expiring in the next 7 days or expired in this period",
  );

  addTableSheet(
    workbook,
    "New Users",
    [
      { header: "Signed up", key: "createdAt", type: "datetime", width: 17 },
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 14 },
      { header: "Signup method", key: "provider", width: 12 },
      { header: "Email verified", key: "emailVerified", type: "bool", width: 10 },
      { header: "PAN", key: "pan", width: 13 },
      { header: "Has paid", key: "hasPaid", type: "bool", width: 10 },
    ],
    report.newUsers,
  );

  addTableSheet(
    workbook,
    "Complaints",
    [
      { header: "Reference ID", key: "referenceId", width: 18 },
      { header: "Received", key: "createdAt", type: "datetime", width: 17 },
      { header: "Name", key: "name", width: 22 },
      { header: "Email", key: "email", width: 28 },
      { header: "Phone", key: "phone", width: 14 },
      { header: "Subject", key: "subject", width: 34 },
      { header: "Status", key: "status", width: 12 },
      { header: "Priority", key: "priority", width: 10 },
      { header: "Assigned to", key: "assignedTo", width: 16 },
      { header: "Age (days)", key: "ageDays", width: 10 },
      { header: "Received in this period", key: "inPeriod", type: "bool", width: 12 },
    ],
    report.complaints,
    "No complaints received and none open",
  );

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
