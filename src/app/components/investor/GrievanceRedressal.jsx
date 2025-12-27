export default function GrievanceRedressal() {
    return (
      <div className="bg-gray-50 py-12 px-4">
        <h2 className="text-center text-2xl font-bold mb-6">
          Details of grievance redressal mechanism and how to access it
        </h2>
  
        <div className="text-center max-w-3xl mx-auto mb-10 text-gray-600">
          <p className="font-bold">
            Investor can lodge complaint/grievance against Research Analyst in the following ways :
          </p>
  
          <p className="mt-4">
            In case of any grievance / complaint, an investor may approach the concerned
            Research Analyst who shall strive to redress the grievance immediately, but not
            later than 21 days of the receipt of the grievance.
          </p>
        </div>
  
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500" />
            <h3 className="font-semibold mb-3">
              Mode of filing the complaint on scores or with Research Analyst
            </h3>
            <p className="text-gray-600 text-sm">
              Administration and Supervisory Body (RAASB)
            </p>
            <p className="text-gray-600 text-sm mt-2">
              1) SCORES 2.0 (a web based centralized grievance redressal system of SEBI for facilitating effective grievance redressal in time-bound manner)
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Two level review for complaint/grievance against Research Analyst: i) First review done by designated body (RAASB) ii)Second review done by SEB
            </p>
          </div>
  
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500" />
            <h3 className="font-semibold mb-3">
              Email to designated email ID of RAASB
            </h3>
            <p className="text-gray-600 text-sm">
              If the Investor is not satisfied with the resolution provided by the Market Participants, then the Investor has the option to file the complaint/ grievance on SMARTODR platform for its resolution through online conciliation or arbitration.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              With regard to physical complaints, investors may send their complaints to:
              Office of Investor Assistance and Education, Securities and Exchange Board of India, SEBI Bhavan, Plot No. C4-A, ‘G’ Block, Bandra-Kurla Complex, Bandra (E), Mumbai - 400 051
            </p>
          </div>
        </div>
      </div>
    );
  }
  