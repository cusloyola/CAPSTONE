import React, { useEffect, useRef, useState } from "react";
import PageMeta from '../../components/common/PageMeta';
import { FaEllipsisV } from "react-icons/fa";
import axios from 'axios';

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

const MaterialRequestManagement = () => {
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

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [requestToReject, setRequestToReject] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

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

  // Filtering and sorting logic (search by project name or notes)
  const filteredRequests = requests
    .filter((r) => {
      const requestDate = new Date(r.request_date);
      const matchQuery =
        r.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      const matchMonth =
        filterMonth === "" || requestDate.getMonth() === Number(filterMonth);
      const matchYear =
        filterYear === "" || requestDate.getFullYear() === Number(filterYear);
      return matchQuery && matchStatus && matchMonth && matchYear;
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

  // Approve/Reject handlers
const handleApprove = async (requestId) => {
  try {
    // Correct URL to match the server's routing
    await axios.put(`http://localhost:5000/api/resources/request-materials/${requestId}/approve`);
    setRequests(requests.map((req) => (req.request_id === requestId ? { ...req, status: 'approved' } : req)));
    setShowApproveModal(false);
    setRequestToApprove(null);
    setSuccessMessage('Material request successfully approved!');
    setShowSuccessModal(true);
  } catch (err) {
    setError('Failed to approve request.');
  }
};


  
  const handleDisapprove = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/request-materials/${requestId}/reject`);
      setRequests(requests.map((req) => (req.request_id === requestId ? { ...req, status: 'rejected' } : req)));
      setShowRejectModal(false);
      setRequestToReject(null);
      setSuccessMessage('Material request successfully rejected!');
      setShowSuccessModal(true);
    } catch (err) {
      setError('Failed to reject request.');
    }
  };

  // Handle actions like "view" or "edit" for a specific request
  const handleAction = (request, type) => {
    if (type === "approve") {
      setRequestToApprove(request.request_id);
      setShowApproveModal(true);
    } else if (type === "reject") {
      setRequestToReject(request.request_id);
      setShowRejectModal(true);
    }
    setOpenMenuId(null);
  };

  return (
    <>
      <PageMeta title="Material Request Management" description="Manage all material requests submitted" />
      <div className="min-h-screen p-6 md:p-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold mb-10 text-gray-800">
              Material Request Management
            </h1>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
              <div className="bg-gradient-to-l from-blue-500 to-blue-800 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-gray-800">
                  {/* ...icon... */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list-icon lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
                </div>
                <p className="text-md text-white font-semibold">Total Requests</p>
                <h2 className="text-4xl font-bold text-white">{requests.length}</h2>
              </div>
              <div className="bg-gradient-to-l from-yellow-500 to-yellow-600 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  {/* ...icon... */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock-fading-icon lucide-clock-fading"><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 6v6l4 2"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/></svg>
                </div>
                <p className="text-md text-white font-semibold">Pending Requests</p>
                <h2 className="text-4xl font-bold text-white">{requests.filter(r => r.status === "pending").length}</h2>
              </div>
              <div className="bg-gradient-to-l from-green-500 to-green-600 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  {/* ...icon... */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-check-icon lucide-file-check"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>
                </div>
                <p className="text-md text-white font-semibold">Approved Requests</p>
                <h2 className="text-4xl font-bold text-white">{requests.filter(r => r.status === "approved").length}</h2>
              </div>
              <div className="bg-gradient-to-l from-red-500 to-red-800 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                  {/* ...icon... */}
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
                          {request.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                className="bg-green-600 text-white px-4 py-2 rounded font-bold"
                                onClick={() => handleApprove(request.request_id)}
                              >
                                Approve
                              </button>
                              <button
                                className="bg-red-600 text-white px-4 py-2 rounded font-bold"
                                onClick={() => handleDisapprove(request.request_id)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-600 italic text-center block">No Further Actions</span>
                          )}
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
                      )}`}
                  {" "}of {filteredRequests.length} entries
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

      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>Do you want to approve this material request?</p>
            <div className="mt-4 flex justify-end gap-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded font-bold" onClick={() => handleApprove(requestToApprove)}>
                Yes
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded font-bold" onClick={() => setShowApproveModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>Do you want to reject this material request?</p>
            <div className="mt-4 flex justify-end gap-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded font-bold" onClick={() => handleDisapprove(requestToReject)}>
                Yes
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded font-bold" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>{successMessage}</p>
            <div className="mt-4 flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold" onClick={() => setShowSuccessModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialRequestManagement;