const risks = [
  {
    title: "MARKET RISKS WARNING",
    desc: "Investment in securities market are subject to market risks. Read all the related documents carefully before investing",
  },
  {
    title: "LOSS POSSIBILITY",
    desc: "Market risks may result in partial or permanent loss of investments under certain market conditions.",
  },
  {
    title: "SEBI REGISTRATION",
    desc: "Registration granted by SEBI and certification from NISM do not guarantee the performance of intermediary returns to investors",
  },
  {
    title: "PAST PERFORMANCE",
    desc: "Past performance is not indicative of future results.",
  },
  {
    title: "NO WARRANTIES",
    desc: "search Analyst does not guarantee the accuracy, results, or reliability of content on its website, including merchantability, suitability, and non-infringement.",
  },
  {
    title: "EXERCISE CAUTION",
    desc: "We provide research analysis and specific securities but do not offer portfolio management services, personal account handling, profit sharing, or risk-profiling-based investment advisory services",
  },
  {
    title: "RISK ASSOCIATED IN OPEN POSITIONS",
    desc: "Our recommendations may stay open without stop-loss or target prices, possibly causing major portfolio losses in adverse markets.",
  },
  {
    title: "SEBI SPECIFIED MECHANISM FOR FEE COLLECTION",
    desc: "All research service fees must be paid online via SASIKUMAR PEYYALA account gateway or CeFCoM other payments aren’t valid",
  },
];

export default function RiskCards() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {risks.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-6 shadow border border-purple-300 text-center"
        >
          <h3 className="font-bold text-lg mb-3">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}
