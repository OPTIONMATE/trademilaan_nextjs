import nodemailer from "nodemailer";

console.log("MAILER FILE LOADED");

const port = Number(process.env.MAIL_PORT) || 465;

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port,
  secure: port === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  logger: true,
  debug: true,
});

// Verify SMTP
transporter
  .verify()
  .then(() => console.log("SMTP READY — transporter verified"))
  .catch((err) => console.error("SMTP VERIFY FAILED ❌", err));

export async function sendTermsAndConditionsMail(email) {
  if (!email) throw new Error("Recipient email missing");

  const baseUrl = (
    process.env.APP_URL ||
    process.env.PUBLIC_BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const termsUrl = `${baseUrl}/terms-and-condition`;

  const from =
    process.env.MAIL_FROM ||
    process.env.MAIL_USER ||
    "trademilaan.data@gmail.com";

  // ---------- HTML EMAIL ----------
  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px;font-family:Arial,sans-serif;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:20px;text-align:center;">
              <h1 style="color:#22c55e;margin:0;font-size:22px;">TradeMilaan</h1>
              <p style="color:#cbd5e1;margin:4px 0 0;font-size:13px;">
                SEBI Registered Research Analyst
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;color:#111827;">
              <p style="font-size:15px;margin-top:0;">
                Thank you for signing up with <strong>TradeMilaan</strong>.
              </p>

              <p style="font-size:14px;">
                Before using our services, please review and understand our
                <strong>Terms & Conditions</strong> as mandated by SEBI.
              </p>

              <!-- Button -->
              <div style="text-align:center;margin:24px 0;">
                <a href="${termsUrl}" target="_blank"
                  style="background:#22c55e;color:#ffffff;
                  padding:12px 20px;text-decoration:none;
                  border-radius:6px;font-weight:bold;font-size:14px;">
                  View Terms & Conditions
                </a>
              </div>

              <!-- Highlights -->
              <ul style="font-size:14px;color:#374151;padding-left:18px;">
                <li>Research-only platform — no trade execution or fund handling</li>
                <li>Market risks apply; returns are not assured</li>
                <li>AI-based research may involve inherent limitations</li>
              </ul>

              <p style="font-size:13px;color:#4b5563;">
                For grievances, contact
                <a href="mailto:spkumar.researchanalyst@gmail.com">
                  spkumar.researchanalyst@gmail.com
                </a>
                or approach SEBI via SCORES.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px;font-size:11px;color:#6b7280;">
              <p style="margin:0;">
                <strong>Disclaimer:</strong> SEBI registration and NISM certification
                do not guarantee performance or assured returns.
                Investments are subject to market risks.
              </p>
              <p style="margin:8px 0 0;">
                © ${new Date().getFullYear()} TradeMilaan. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  `;

  try {
    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "TradeMilaan – Terms & Conditions",
      html,
      replyTo: "trademilaan.data@gmail.com",
    });

    console.log("MAIL SENT ✅", info.messageId);
  } catch (err) {
    console.error("MAIL SEND FAILED ❌", err);
  }
}

export { transporter };
