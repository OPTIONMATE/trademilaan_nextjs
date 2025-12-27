const conflicts = [
  "SASIKUMAR PEYYALA: INH000019327” or its research analysts or his/her relative or associate don’t have any direct or indirect financial interest in the subject company",
  "SASIKUMAR PEYYALA: INH000019327” or its research analysts, or his/her relative or associate don’t have any other material conflict of interest at the time of publication of the research report.",
  "SASIKUMAR PEYYALA: INH000019327” or its research analysts, or his/her relative or associates don’t have actual ownership of 1% or more securities of the subject company",
  "SASIKUMAR PEYYALA: INH000019327” or its associates have received any compensation from the subject company in the past twelve months",
  "SASIKUMAR PEYYALA: INH000019327” or its associates have managed or co-managed public offering of securities for the subject in the past twelve months",
  "SASIKUMAR PEYYALA: INH000019327” or its associates have received any compensation for investment banking or merchant banking or brokerage services from the subject company in the past twelve months",
  "SASIKUMAR PEYYALA: INH000019327” or its associates have received any compensation for products or services other than investment banking or merchant banking or brokerage services from the subject company in the past twelve months",
  "SASIKUMAR PEYYALA: INH000019327” or its associates have received any compensation or other benefits from the subject company or third party in connection with the research report The research analyst has not served as an officer, director, and employee of the subject company",
  "SASIKUMAR PEYYALA: INH000019327” or its research analyst has been engaged in the market-making activity for the subject company",
  "SASIKUMAR PEYYALA: INH000019327” or its associates have received any compensation from the subject company in the past twelve months:"
];


export default function OwnershipConflicts() {
  return (
    <div className="bg-gray-900 py-12 px-4">
      <h2 className="text-center text-white text-2xl font-bold mb-8">
      Disclosures with regard to ownership and material conflicts of interest:
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {conflicts.map((text, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 shadow text-purple-600 text-sm"
          >
            {i + 1}. {text}
          </div>
        ))}
      </div>
    </div>
  );
}
