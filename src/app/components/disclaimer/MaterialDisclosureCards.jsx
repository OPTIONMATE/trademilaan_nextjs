const cards = [
  {
    title: "SASIKUMAR PEYYALA",
    desc: "Sasikumar Peyyala is engaged in the business of Research Analyst activities by providing Buy/Sell/Hold calls or other ratings defined to their clients.",
  },
  {
    title: "SEBI Registration",
    desc: "Sasikumar Peyyala is registered as a Research Analyst under SEBI (Research Analyst) Regulations, 2014. SEBI Reg. No. INH000019327",
  },
  {
    title: "Disciplinary History",
    desc: "No disciplinary actions, penalties, or regulatory issues have ever been levied against SASIKUMAR PEYYALA: INH000019327, partners, or associates",
  },
];

export default function MaterialDisclosureCards() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h2 className="text-center text-2xl font-bold mb-10">
        Disclosures of all material information SASIKUMAR PEYYALA: INH000019327
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow border p-6 text-center"
          >
            <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
            <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
            <p className="text-sm text-gray-600">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
