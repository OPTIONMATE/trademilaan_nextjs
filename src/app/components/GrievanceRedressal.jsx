import Image from "next/image";

export default function GrievanceRedressal() {
  return (
    <div className="w-full bg-white">
      {/* ===== Hero Banner ===== */}
      <div className="relative h-[260px] w-full flex items-center justify-center">
        <Image
          src="/grievance-banner.jpg" // place banner image in public/
          alt="Grievance Redressal"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <h1 className="relative z-10 text-white text-4xl md:text-5xl font-bold">
          Grievance Redressal
        </h1>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-6xl mx-auto px-6 py-14 space-y-10 text-gray-800 leading-relaxed">
        <p>
          At <b>Trademilaan</b>, we are committed to addressing investor concerns
          in a fair, transparent, and timely manner. Below are the details of
          our grievance redressal mechanism in accordance with SEBI guidelines.
        </p>

        {/* SEBI REGISTRATION DETAILS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">SEBI Registration Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><b>Registered Name:</b> SASIKUMAR PEYYALA</p>
            <p><b>Trade Name / Website:</b> www.trademilaan.com</p>
            <p><b>Type of Registration:</b> Research Analyst</p>
            <p><b>Registration No:</b> INH000019327</p>
            <p>
              <b>Validity:</b> Jan 07, 2025 – Perpetual
            </p>
            <p>
              <b>SEBI RA List:</b>{" "}
              <a
                href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Here
              </a>
            </p>
          </div>
        </section>

        {/* OFFICE ADDRESSES */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Office Addresses</h2>
          <p>
            <b>Registered Office:</b> 1-2/4, 29/4 Kummaripalem Center, Near DSM High
            School, Vidyadharapuram, Vijayawada, Andhra Pradesh – 520012
          </p>
          <p className="mt-2">
            <b>Correspondence Office:</b> 1-2/4, 29/4 Kummaripalem Center, Near DSM
            High School, Vidyadharapuram, Vijayawada, Andhra Pradesh – 520012
          </p>
        </section>

        {/* OFFICIAL CONTACTS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Key Officials & Contacts</h2>
          <div className="space-y-2">
            <p><b>CEO:</b> SASIKUMAR PEYYALA | 📞 +91 77022 62206 | ✉️ SPKUMAR.RESEARCHANALYST@GMAIL.COM</p>
            <p><b>Principal Officer:</b> SASIKUMAR PEYYALA | 📞 +91 77022 62206 | ✉️ SPKUMAR.RESEARCHANALYST@GMAIL.COM</p>
            <p><b>Compliance Officer:</b> SASIKUMAR PEYYALA | 📞 +91 77022 62206 | ✉️ SPKUMAR.RESEARCHANALYST@GMAIL.COM</p>
            <p><b>Head – Customer Support:</b> SASIKUMAR PEYYALA | 📞 +91 77022 62206 | ✉️ SPKUMAR.RESEARCHANALYST@GMAIL.COM</p>
          </div>
        </section>

        {/* WORKING HOURS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Working Hours</h2>
          <p>
            <b>Days:</b> Monday to Friday
          </p>
          <p>
            <b>Time:</b> 11:00 AM to 5:00 PM
          </p>
          <p className="mt-2">
            Support is unavailable on weekends and public holidays. You may still
            write to us at{" "}
            <a
              href="mailto:spkumar.researchanalyst@gmail.com"
              className="text-blue-600 underline"
            >
              SPKUMAR.RESEARCHANALYST@GMAIL.COM
            </a>.
          </p>
        </section>

        {/* IMPORTANT NOTICE */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Important Notice</h2>
          <p>
            If you are dissatisfied with our services, kindly raise your initial
            complaint to{" "}
            <a
              href="mailto:spkumar.researchanalyst@gmail.com"
              className="text-blue-600 underline"
            >
              SPKUMAR.RESEARCHANALYST@GMAIL.COM
            </a>{" "}
            or contact <b>+91 77022 62206</b>.
          </p>
          <p className="mt-2">
            If unresolved after 7 days, you may escalate to SEBI through:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              SCORES:{" "}
              <a
                href="https://scores.sebi.gov.in/"
                target="_blank"
                className="text-blue-600 underline"
              >
                https://scores.sebi.gov.in/
              </a>
            </li>
            <li>
              ODR:{" "}
              <a
                href="https://smartodr.in/"
                target="_blank"
                className="text-blue-600 underline"
              >
                https://smartodr.in/
              </a>
            </li>
            <li>
              Toll Free: <b>1800 22 7575 / 1800 266 7575</b>
            </li>
            <li>
              SEBI Offices:{" "}
              <a
                href="https://www.sebi.gov.in/contact-us.html"
                target="_blank"
                className="text-blue-600 underline"
              >
                Contact List
              </a>
            </li>
          </ul>
        </section>

        {/* INVESTOR AWARENESS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Investor Awareness</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              SEBI Investor Website:{" "}
              <a
                href="https://investor.sebi.gov.in/"
                target="_blank"
                className="text-blue-600 underline"
              >
                https://investor.sebi.gov.in/
              </a>
            </li>
            <li>
              SaarThi Android App:{" "}
              <a
                href="https://play.google.com/store/apps/details?id=com.sebi.invapp"
                target="_blank"
                className="text-blue-600 underline"
              >
                Download
              </a>
            </li>
            <li>
              SaarThi iOS App:{" "}
              <a
                href="https://apps.apple.com/in/app/saa%E2%82%B9thi/id1589426387"
                target="_blank"
                className="text-blue-600 underline"
              >
                Download
              </a>
            </li>
          </ul>
        </section>

        {/* FRAUD AWARENESS */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Important Advisory to Investors
          </h2>
          <p>
            Ensure that RA service fees are paid only to the bank account of the
            registered Research Analyst “SASIKUMAR PEYYALA” or through verified
            payment gateways / CeFCoM. Payments outside these channels will not
            be considered valid.
          </p>
          <p className="mt-2">
            Always request payment invoices from the RA’s registered email ID and
            report suspicious activity immediately.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>
              List of RAs:{" "}
              <a
                href="https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14"
                target="_blank"
                className="text-blue-600 underline"
              >
                View Here
              </a>
            </li>
            <li>
              BSE Media Releases:{" "}
              <a
                href="https://www.bseindia.com/markets/MarketInfo/MediaRelease.aspx"
                target="_blank"
                className="text-blue-600 underline"
              >
                View
              </a>
            </li>
            <li>
              BSE Investor Alerts:{" "}
              <a
                href="https://www.bseindia.com/attention_investors.aspx"
                target="_blank"
                className="text-blue-600 underline"
              >
                View
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
