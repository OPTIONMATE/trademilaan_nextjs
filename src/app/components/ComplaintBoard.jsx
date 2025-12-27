import Image from "next/image";

export default function ComplaintBoard() {
  return (
    <div className="w-full bg-white">
      {/* ===== Hero Banner ===== */}
      <div className="relative h-[260px] w-full flex items-center justify-center">
        <Image
          src="/complaint-banner.jpg" // put banner image in public/
          alt="Complaint Board"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <h1 className="relative z-10 text-white text-4xl md:text-5xl font-bold">
          Complaint Board
        </h1>
      </div>

      {/* ===== Content ===== */}
      <div className="max-w-5xl mx-auto px-6 py-14 space-y-8 text-gray-800 leading-relaxed">
        <p>
          At <b>Trademilaan</b>, we are committed to providing transparent and
          professional research services. If you have any concerns, issues, or
          complaints regarding our services, you may raise them through this
          Complaint Board.
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-3">How to Raise a Complaint</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Email your grievance with complete details to our designated
              Grievance Officer.
            </li>
            <li>
              Mention your registered name, contact details, and subscription
              ID (if applicable).
            </li>
            <li>
              Clearly describe the issue and attach supporting documents, if
              any.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Grievance Officer Details</h2>
          <p>
            <b>Name:</b> SASIKUMAR PEYYALA
          </p>
          <p>
            <b>Email:</b>{" "}
            <a
              href="mailto:spkumar.researchanalyst@gmail.com"
              className="text-blue-600 underline"
            >
              spkumar.researchanalyst@gmail.com
            </a>
          </p>
          <p>
            Complaints should be raised within <b>7 business days</b> from the
            date of the issue.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Resolution Timeline</h2>
          <p>
            We endeavor to acknowledge your complaint within 2 working days and
            resolve it within <b>7 working days</b> or such timelines as
            prescribed by SEBI from time to time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Escalation Mechanism</h2>
          <p>
            If you are not satisfied with our resolution, you may escalate your
            complaint to SEBI through the SCORES portal or use any other dispute
            resolution mechanism prescribed by SEBI.
          </p>
          <p className="mt-2">
            SCORES Portal:{" "}
            <a
              href="https://scores.sebi.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              https://scores.sebi.gov.in
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Our Commitment</h2>
          <p>
            Trademilaan is committed to fair practices and investor protection.
            All complaints are handled with confidentiality and in compliance
            with SEBI regulations.
          </p>
        </section>
      </div>
    </div>
  );
}
