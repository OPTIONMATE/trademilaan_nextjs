const donts = [
    "Do not provide funds for investment to the Research Analyst.",
    "Don’t fall prey to luring advertisements or market rumors.",
    "Do not get attracted to limited period discounts, incentives, gifts, etc. offered by Research Analyst.",
    "Do not share login credentials and password of your trading, demat or bank accounts with the Research Analyst.",
  ];
  
  export default function DontsSection() {
    return (
      <div className="w-full bg-gray-900 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {donts.map((text, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center flex flex-col items-center"
            >
              {/* Icon Placeholder */}
              <div className="w-12 h-12 rounded-full bg-teal-400 mb-4 flex items-center justify-center">
                <span className="text-white text-xl font-bold">✓</span>
              </div>
  
              <p className="text-gray-800 font-medium text-sm leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  