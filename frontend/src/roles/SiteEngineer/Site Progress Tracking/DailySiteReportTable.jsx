import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";

const DailySiteReportTable = ({
  reports,
  columns,
  reportRefs,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  onAdd,
  onAction,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

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

  // ✅ Filter & sort reports
  const filteredReports = reports
    .filter((r) => {
      const matchQuery = r.project_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchQuery && matchStatus;
    })
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date));

  // ✅ Paginate
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentReports = filteredReports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredReports.length / entriesPerPage);

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

  const handleClick = (report, type) => {
    onAction(report, type);
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-md shadow-lg">
        {/* Header */}
        <div className="mb-6 border-b-2 border-blue-500 pb-2 flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Daily Site Report Table
          </h2>
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            + Add Report
          </button>
        </div>

        

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-80 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

      {/* Entries per page */}
            <div className="text-sm text-gray-700 mb-6">
              Show
              <select
                value={entriesPerPage}
                onChange={handleEntriesChange}
                className="mx-2 px-2 py-1 border rounded"
              >
                {[5, 10, 25, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              entries
            </div>


        {/* Table */}
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
              {currentReports.map((report) => (
                <tr
                  key={report.report_id}
                  ref={(el) =>
                    (reportRefs.current[`table-${report.report_id}`] = el)
                  }
                  className="hover:bg-gray-50"
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className="px-6 py-4 text-sm text-gray-700 whitespace-pre-wrap"
                    >
                      {col.customRender
                        ? col.customRender(report)
                        : col.format
                        ? col.format(report[col.key])
                        : report[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm relative">
                    <div
                      className="relative inline-block text-left"
                      ref={(el) => (menuRefs.current[report.report_id] = el)}
                    >
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === report.report_id
                              ? null
                              : report.report_id
                          )
                        }
                        className="text-gray-600 hover:text-gray-900 focus:outline-none"
                      >
                        <FaEllipsisV />
                      </button>

                      {openMenuId === report.report_id && (
                        <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg">
                          <div className="py-1">
                            <button
                              onClick={() => handleClick(report, "view")}
                              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            >
                              View
                            </button>
                            {["pending", "draft", "open"].includes(
                              report.status?.toLowerCase()
                            ) && (
                              <button
                                onClick={() => handleClick(report, "edit")}
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
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0 px-4 pb-4">


            {/* Page info */}
            <div className="text-sm text-gray-600">
              Showing{" "}
              {filteredReports.length === 0
                ? "0"
                : `${indexOfFirst + 1} to ${Math.min(
                    indexOfLast,
                    filteredReports.length
                  )}`}{" "}
              of {filteredReports.length} entries
            </div>

            {/* Navigation */}
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
  );
};

export default DailySiteReportTable;
