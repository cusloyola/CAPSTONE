import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";

const COLUMNS = [
  { key: "project_name", label: "Project Name" },
  { key: "urgency", label: "Urgency" },
  { key: "notes", label: "Additional Notes" },
  { key: "request_date", label: "Request Date", format: (dateString) => new Date(dateString).toLocaleDateString() },
  { key: "status", label: "Status", customRender: (req) => (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
        req.status === "approved"
          ? "bg-green-100 text-green-800"
          : req.status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {req.status}
    </span>
  )},
];

const ViewRequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [columns] = useState(COLUMNS);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [selectedRequests, setSelectedRequests] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Close the action menu if a user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(menuRefs.current).forEach(([id, ref]) => {
        if (openMenuId === id && ref && !ref.contains(event.target)) {
          setOpenMenuId(null);
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  // Handle actions like "view" or "edit" for a specific request
  const handleAction = (request, type) => {
    console.log(`Action: ${type} on request ${request.request_id}`);
    setOpenMenuId(null);
    // Add logic here to navigate to a new page, open a modal, etc.
  };

  // Fetch requested materials history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/resources/request-materials/history");
        if (!response.ok) throw new Error("Failed to fetch history");
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        setRequests([]);
      }
    };
    fetchHistory();
  }, []);

  // Filtering and sorting logic (search by project name or notes)
  const filteredRequests = requests
    .filter((r) => {
      const requestDate = new Date(r.request_date);
      const matchQuery =
        r.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      // You can add more filters if needed
      return matchQuery;
    })
    .sort((a, b) => new Date(b.request_date) - new Date(a.request_date));

  // Pagination logic
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Checkbox selection logic
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRequests([]);
    } else {
      const allIds = filteredRequests.map(r => r.request_id);
      setSelectedRequests(allIds);
    }
    setSelectAll(!selectAll);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-10 text-gray-800">
            Material Request History
          </h1>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
            {/* Total Requests */}
            <div className="bg-gradient-to-l from-blue-500 to-blue-800 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
              </div>
              <p className="text-md text-white font-semibold">Total Requests</p>
              <h2 className="text-4xl font-bold text-white">{requests.length}</h2>
            </div>
            {/* Pending Requests */}
            <div className="bg-gradient-to-l from-yellow-500 to-yellow-600 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock-fading-icon lucide-clock-fading"><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 6v6l4 2"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/></svg>
              </div>
              <p className="text-md text-white font-semibold">Pending Requests</p>
              <h2 className="text-4xl font-bold text-white">{requests.filter(r => r.status === "pending").length}</h2>
            </div>
            {/* Approved Requests */}
            <div className="bg-gradient-to-l from-green-500 to-green-600 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-check-icon lucide-file-check"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>
              </div>
              <p className="text-md text-white font-semibold">Approved Requests</p>
              <h2 className="text-4xl font-bold text-white">{requests.filter(r => r.status === "approved").length}</h2>
            </div>
            {/* Rejected Requests */}
            <div className="bg-gradient-to-l from-red-500 to-red-800 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-x-icon lucide-file-x"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m15 11-6 6"/><path d="m9 11 6 6"/></svg>
              </div>
              <p className="text-md text-white font-semibold">Rejected Requests</p>
              <h2 className="text-4xl font-bold text-white">{requests.filter(r => r.status === "rejected").length}</h2>
            </div>
          </div>
        </div>

        {/* Main Table Section */}
        <div className="max-w-7xl mx-auto bg-white p-6 mt-6 md:p-8 rounded-md shadow-lg">
          <div className="mb-6 pb-2 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Request Overview
            </h2>
          </div>

          {/* Filters and Search Bar */}
          <div className="flex flex-wrap gap-4 mt-10">
            {/* Status Filter */}
            <div className="flex flex-col gap-2 mt-6">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border p-2 rounded w-48"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex flex-col gap-2 mt-6">
              <select
                className="border p-2 rounded w-48"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex flex-col gap-2 mt-6">
              <select
                className="border p-2 rounded w-48"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">All Years</option>
                {[...new Set(requests.map(r => new Date(r.request_date).getFullYear()))]
                  .sort((a, b) => b - a)
                  .map((y, i) => (
                    <option key={i} value={y}>{y}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="mb-6 flex flex-col justify-between md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-10">
            <div className="text-sm text-gray-700 mb-6">
              Show
              <select
                value={entriesPerPage}
                onChange={handleEntriesChange}
                className="mx-2 w-14 px-2 py-1 border rounded"
              >
                {[5, 10, 25, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              entries
            </div>

            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded w-64 h-10"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Header checkbox */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      checked={
                        selectedRequests.length === currentRequests.length &&
                        currentRequests.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.length > 0 ? (
                  currentRequests.map((request) => (
                    <tr key={request.request_id} className="hover:bg-gray-50">
                      {/* Row checkbox */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.request_id)}
                          onChange={() => {
                            if (selectedRequests.includes(request.request_id)) {
                              setSelectedRequests(
                                selectedRequests.filter((id) => id !== request.request_id)
                              );
                            } else {
                              setSelectedRequests([...selectedRequests, request.request_id]);
                            }
                          }}
                        />
                      </td>
                      {columns.map((col, i) => (
                        <td
                          key={i}
                          className="px-6 py-4 text-sm text-gray-700 whitespace-pre-wrap"
                        >
                          {col.customRender
                            ? col.customRender(request)
                            : col.format
                            ? col.format(request[col.key])
                            : request[col.key]}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-sm relative">
                        <div
                          className="relative inline-block text-left"
                          ref={(el) => (menuRefs.current[request.request_id] = el)}
                        >
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === request.request_id ? null : request.request_id
                              )
                            }
                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                          >
                            <FaEllipsisV />
                          </button>

                          {openMenuId === request.request_id && (
                            <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg">
                              <div className="py-1">
                                <button
                                  onClick={() => handleAction(request, "view")}
                                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                >
                                  View
                                </button>
                                {["pending"].includes(
                                  request.status?.toLowerCase()
                                ) && (
                                  <button
                                    onClick={() => handleAction(request, "edit")}
                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 2} className="text-center py-8 text-gray-500">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0 px-4 pb-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                {filteredRequests.length === 0
                  ? "0"
                  : `${indexOfFirst + 1} to ${Math.min(
                      indexOfLast,
                      filteredRequests.length
                    )}`}{" "}
                of {filteredRequests.length} entries
              </div>

              <div className="space-x-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 border rounded ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-200 text-gray-400"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRequestHistory;

