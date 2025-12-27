const points = [
    "To publish research report based on the research activities of the RA",
    "To provide an independent unbiased view on securities.",
    "To offer unbiased recommendation, disclosing the financial interests in recommended securities.",
    "To provide research recommendation, based on analysis of publicly available information and known observations.",
    "To conduct audit annually",
    "To ensure that all advertisements are in adherence to the provisions of the Advertisement Code for Research Analysts.",
    "To maintain records of interactions, with all clients including prospective clients (prior to onboarding), where any conversation related to the research services has taken place."
  ];
  
  export default function BusinessDetails() {
    return (
      <div className="bg-gray-900 py-12 px-4">
        <h2 className="text-center text-white text-2xl font-bold mb-10">
        Details of business transacted by the Research Analyst with respect to the investors
        </h2>
  
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {points.map((text, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 text-purple-600 shadow"
            >
              {i + 1}. {text}
            </div>
          ))}
        </div>
      </div>
    );
  }
  