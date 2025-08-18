import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";

const DailySafetyReportTable = ({ onAdd }) => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const reportRefs = useRef({});
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr.replace(" ", "T")); // Fix MySQL datetime
    return isNaN(d) ? "Invalid Date" : d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/safetyReports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ✅ Columns definition
  const columns = [
    { key: "report_date", label: "Date", format: formatDate },
    { key: "project_name", label: "Project" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
  ];

  // ✅ Filtering
  const filteredReports = reports
    .filter((r) => {
      const reportDate = new Date(r.report_date);

      const matchQuery = r.project_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchStatus =
        filterStatus === "all" || r.status === filterStatus;

      const matchMonth =
        filterMonth === "" || reportDate.getMonth() === Number(filterMonth);

      const matchYear =
        filterYear === "" || reportDate.getFullYear() === Number(filterYear);

      return matchQuery && matchStatus && matchMonth && matchYear;
    })
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date));

  // ✅ Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentReports = filteredReports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredReports.length / entriesPerPage);

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-10">Daily Safety Report</h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
          <div className="bg-gradient-to-l from-blue-500 to-blue-800 p-5 rounded-2xl shadow space-y-2">
            <p className="text-md text-white font-semibold">Total Reports</p>
            <h2 className="text-4xl font-bold text-white">{reports.length}</h2>
          </div>
          <div className="bg-gradient-to-l from-yellow-500 to-yellow-600 p-5 rounded-2xl shadow space-y-2">
            <p className="text-md text-white font-semibold">Pending Reports</p>
            <h2 className="text-4xl font-bold text-white">
              {reports.filter((r) => r.status === "pending").length}
            </h2>
          </div>
          <div className="bg-gradient-to-l from-green-500 to-green-600 p-5 rounded-2xl shadow space-y-2">
            <p className="text-md text-white font-semibold">Approved Reports</p>
            <h2 className="text-4xl font-bold text-white">
              {reports.filter((r) => r.status === "approved").length}
            </h2>
          </div>
          <div className="bg-gradient-to-l from-red-500 to-red-700 p-5 rounded-2xl shadow space-y-2">
            <p className="text-md text-white font-semibold">Rejected Reports</p>
            <h2 className="text-4xl font-bold text-white">
              {reports.filter((r) => r.status === "rejected").length}
            </h2>
          </div>
        </div>

        {/* Reports Table */}
        <div className="max-w-7xl mx-auto bg-white p-6 mt-6 md:p-8 rounded-md shadow-lg">
          <div className="mb-6 pb-2 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Safety Reports Overview
            </h2>
            <button
              onClick={onAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              + Add Report
            </button>
          </div>

          {/* 🔎 Filters, search, pagination already work the same... */}

          {/* Table */}
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      checked={
                        selectedReports.length === currentReports.length &&
                        currentReports.length > 0
                      }
                      onChange={() => {
                        if (selectedReports.length === currentReports.length) {
                          setSelectedReports([]);
                          setSelectAll(false);
                        } else {
                          setSelectedReports(currentReports.map((r) => r.safety_report_id));
                          setSelectAll(true);
                        }
                      }}
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
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentReports.map((report) => (
                  <tr
                    key={report.safety_report_id}
                    ref={(el) =>
                      (reportRefs.current[`table-${report.safety_report_id}`] = el)
                    }
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.safety_report_id)}
                        onChange={() => {
                          if (selectedReports.includes(report.safety_report_id)) {
                            setSelectedReports(
                              selectedReports.filter((id) => id !== report.safety_report_id)
                            );
                          } else {
                            setSelectedReports([...selectedReports, report.safety_report_id]);
                          }
                        }}
                      />
                    </td>

                    {columns.map((col, i) => (
                      <td
                        key={i}
                        className="px-6 py-4 text-sm text-gray-700 whitespace-pre-wrap"
                      >
                        {col.format
                          ? col.format(report[col.key])
                          : report[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySafetyReportTable;
