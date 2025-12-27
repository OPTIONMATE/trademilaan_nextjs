export default function VisionMission() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-center text-2xl font-bold mb-10">
        Vision and Mission Statements for investors
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow shadow-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500 flex items-center justify-center text-2xl text-white">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/></svg>
          </div>
          

          <h3 className="text-xl font-semibold mb-3">Vision</h3>
          <p className="text-gray-600">
            Invest with knowledge and safety to secure your financial future.
            Make informed decisions, minimize risks, and grow your wealth
            confidently with expert guidance and smart strategies.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow shadow-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500 flex items-center justify-center text-2xl text-white">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-80q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170t-170 70Zm0-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Z"/></svg>
          </div>
          <h3 className="text-xl font-semibold mb-3">Mission</h3>
          <p className="text-gray-600">
            Every investor should be able to invest in right investment products
            based on their needs, manage and monitor them to meet their goals,
            access reports and enjoy financial wellness.
          </p>
        </div>
      </div>
    </div>
  );
}
