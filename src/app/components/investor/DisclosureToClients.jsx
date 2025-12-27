const items = ["To disclose, information that is material for the client to make an informed decision, including details of its business activity, disciplinary history, the terms and conditions of research services, details of associates, risks and conflicts of interest, if any",
  "To disclose the extent of use of Artificial Intelligence tools in providing research services",
  "To disclose, while distributing a third party research report, any material conflict of interest of such third party research provider or provide web address that directs a recipient to the relevant disclosures",
  "To disclose any conflict of interest of the activities of providing research services with other activities of the research analyst.",
  "To distribute research reports and recommendations to the clients without discrimination.",
  "To maintain confidentiality w.r.t publication of the research report until made available in the public domain.",
  "To respect data privacy rights of clients and take measures to protect unauthorized use of their confidential information",
  "To disclose the timelines for the services provided by the research analyst to clients and ensure adherence to the said timelines",
  "To provide clear guidance and adequate caution notice to clients when providing recommendations for dealing in complex and high-risk financial products/services",
  "To treat all clients with honesty and integrity",
  "To ensure confidentiality of information shared by clients unless such information is required to be provided in furtherance of discharging legal obligations or a client has provided specific consent to share such information."
];

  
  export default function DisclosureToClients() {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h2 className="text-center text-2xl font-bold mb-10">
          Disclosure to Clients
        </h2>
        
        <style>{`
          @keyframes textReveal {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes cardGlow {
            from {
              box-shadow: 0 0 0 rgba(59, 130, 246, 0);
            }
            to {
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            }
          }
          
          .disclosure-card {
            transition: all 0.3s ease;
          }
          
          .disclosure-card:hover {
            animation: cardGlow 0.3s ease forwards;
            transform: translateY(-5px);
          }
          
          .disclosure-card:hover p {
            animation: textReveal 0.5s ease forwards;
          }
        `}</style>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((text, i) => (
            <div
              key={i}
              className="disclosure-card relative h-48 bg-gray-800 rounded-xl text-white p-4 flex items-end cursor-pointer"
            >
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  