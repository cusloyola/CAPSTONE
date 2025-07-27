import React from "react";

const AdminDailyReportUI = () => {
  return (
    <div className="p-6 min-h-screen space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4zm0 4h10v2H4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Daily Site Reports</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
          <p className="text-sm text-gray-500">Reports Submitted</p>
          <h2 className="text-3xl font-bold text-gray-800">58</h2>
          <p className="text-green-600 text-sm">+12% from last week</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow space-y-2">
          <p className="text-sm text-gray-500">Unviewed Reports</p>
          <h2 className="text-3xl font-bold text-gray-800">6</h2>
          <p className="text-green-600 text-sm">Up to date</p>
        </div>
        <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow space-y-2 col-span-1 md:col-span-2 lg:col-span-2">
          <p className="text-sm text-gray-500">Site Activity Completion</p>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full" style={{ width: "65%" }}></div>
            <div className="bg-red-500 h-full" style={{ width: "15%" }}></div>
            <div className="bg-gray-400 h-full" style={{ width: "20%" }}></div>
          </div>
          <div className="text-sm text-gray-600 mt-1 flex justify-between">
            <span className="text-green-600">65% Viewed</span>
            <span className="text-red-600">15% Returned</span>
            <span className="text-gray-600">20% Unviewed</span>
          </div>
        </div>
      </div>

   <div className="flex flex-wrap items-center gap-2">
            <select className="border px-3 py-1 rounded-lg text-sm">
              <option value="">All Projects</option>
              <option value="Project A">Project A</option>
              <option value="Project B">Project B</option>
            </select>
            <select className="border px-3 py-1 rounded-lg text-sm">
              <option value="">All Statuses</option>
              <option value="Viewed">Viewed</option>
              <option value="Unviewed">Unviewed</option>
              <option value="Returned">Returned</option>
            </select>
          </div>


      {/* Filters & Export */}
      <div className="mt-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
          
        {/* Entries per page */}
        <div className="text-sm text-gray-700 mb-4">
          Show
          <select className="mx-2 px-2 py-1 border rounded">
            <option>5</option>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          entries
        </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search reports..."
              className="border px-3 py-1 rounded-lg text-sm"
            />
            <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
              Export PDF
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
              Export Excel
            </button>
          </div>
        </div>

        {/* Table */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[1, 2, 3].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">RPT-000{i + 1}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">2025-07-27</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Project X</td>
                  <td className="px-6 py-4 text-sm text-gray-700">Pending</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="relative inline-block text-left">
                      <button className="text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6-2a2 2 0 100 4 2 2 0 000-4zm6 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                      {/* Dropdown (static example) */}
                      {/* <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg">
                        <div className="py-1">
                          <button className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">View</button>
                          <button className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">Edit</button>
                        </div>
                      </div> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0 px-4 pb-4">
            <div className="text-sm text-gray-600">Showing 1 to 3 of 3 entries</div>
            <div className="space-x-2">
              <button className="px-3 py-1 border rounded bg-gray-200 text-gray-400">Previous</button>
              <button className="px-3 py-1 border rounded bg-white hover:bg-gray-100">Next</button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AdminDailyReportUI;
