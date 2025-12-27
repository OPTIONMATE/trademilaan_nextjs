export default function ReportSection() {
  return (
    <div className="bg-gray-100 py-12 px-4">
      <h2 className="text-center text-xl md:text-2xl font-semibold mb-8">
        Report any unethical practices to our support/compliance team or SEBI.
      </h2>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-8 shadow border text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500"></div>
          <h3 className="font-semibold text-lg">Email</h3>
          <p className="mt-2 text-sm">SPKUMAR.RESEARCHANALYST@GMAIL.COM</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow border text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500"></div>
          <h3 className="font-semibold text-lg">Contact Number</h3>
          <p className="mt-2 text-sm">+91 770 226 2206</p>
        </div>
      </div>
    </div>
  );
}
