import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


import DailySiteReportPDF from "./Printables/DailySiteReportPDF";
import MonthlySiteReportPDF from "./Printables/MonthlySiteReportPDF";

import exportDailyReport from "./Printables/exportDailyReport";
import exportMonthlyReport from "./Printables/exportMonthlyReport";

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

  selectedReports,
  setSelectedReports,
  selectAll,
  setSelectAll,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [openExportMenu, setOpenExportMenu] = useState(false);

  const dailyRef = useRef();
  const monthlyRef = useRef();


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

  const filteredReports = reports
    .filter((r) => {
      const reportDate = new Date(r.report_date);

      const matchQuery = r.project_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchStatus =
        filterStatus === "all" || r.status === filterStatus;

      const matchMonth =
        filterMonth === "" ||
        reportDate.getMonth() === Number(filterMonth);

      const matchYear =
        filterYear === "" ||
        reportDate.getFullYear() === Number(filterYear);
      return (
        matchQuery && matchStatus && matchMonth && matchYear
      );
    })
    .sort(
      (a, b) => new Date(b.report_date) - new Date(a.report_date)
    );

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

  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
    } else {
      const allIds = filteredReports.map(r => r.report_id); // only visible rows
      setSelectedReports(allIds);
    }
    setSelectAll(!selectAll);
  };


  const exportDailyReport = (elementRef) => {
    if (!elementRef.current) return;

    const opt = {
      margin: 10,
      filename: "Daily_Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(elementRef.current).set(opt).save();
  };


  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div>
          <h1 className="text-3xl font-bold mb-10">Daily Site Report</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
            <div className="bg-gradient-to-l from-blue-500 to-blue-800 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-plus-icon lucide-clipboard-plus"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 14h6" /><path d="M12 17v-6" /></svg>
              </div>

              <p className="text-md text-white font-semibold">Total Proposals</p>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-bold text-white">125</h2>
              </div>
            </div>

            <div className="bg-gradient-to-l from-yellow-500 to-yellow-600 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock-fading-icon lucide-clock-fading"><path d="M12 2a10 10 0 0 1 7.38 16.75" /><path d="M12 6v6l4 2" /><path d="M2.5 8.875a10 10 0 0 0-.5 3" /><path d="M2.83 16a10 10 0 0 0 2.43 3.4" /><path d="M4.636 5.235a10 10 0 0 1 .891-.857" /><path d="M8.644 21.42a10 10 0 0 0 7.631-.38" /></svg>
              </div>

              <p className="text-md text-white font-semibold">Pending Proposals</p>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-bold text-white">42</h2>
                {/* SVG icon for pending proposals */}
              </div>
              {/* <p className="text-white text-sm">Still under review</p> */}
            </div>

            <div className="bg-gradient-to-l from-green-500 to-green-600 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-check-icon lucide-file-check"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m9 15 2 2 4-4" /></svg>              </div>

              <p className="text-md text-white font-semibold">Approved Proposals</p>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-bold text-white">67</h2>
                {/* SVG icon for approved proposals */}
              </div>
              {/* <p className="text-white text-sm">Approved & completed</p> */}
            </div>

            <div className="bg-gradient-to-l from-purple-500 to-purple-800 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <svg className="text-gray-800 w-6 h-6 dark:text-white/90" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>

              <p className="text-md text-white font-semibold">Approved Proposals</p>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-bold text-white">67</h2>
              </div>
              {/* <p className="text-white text-sm">Approved & completed</p> */}
            </div>
          </div>
        </div>


        <div className="max-w-7xl mx-auto bg-white p-6 mt-6 md:p-8 rounded-md shadow-lg">
          <div className="mb-6 pb-2 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Site Reports Overview
            </h2>
            <button
              onClick={onAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              + Add Report
            </button>
          </div>


          <div className="flex flex-wrap gap-4 mt-10">
            <div className="flex flex-col gap-2  mt-6">
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
                {[...new Set(reports.map(r => new Date(r.report_date).getFullYear()))]
                  .sort((a, b) => b - a)
                  .map((y, i) => (
                    <option key={i} value={y}>{y}</option>
                  ))}
              </select>
            </div>

          </div>


          {/* Filters */}
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


            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 rounded w-64 h-10"
              />


              {/* Export buttons */}
              <div className="relative">
                <button
                  onClick={() => setOpenExportMenu(!openExportMenu)}
                  className="px-4 py-2 border border-black bg-gray-500 text-white rounded hover:bg-white hover:text-black"
                >
                  Export to PDF
                </button>

                {openExportMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <button
                      onClick={() => {
                        exportDailyReport(dailyRef);
                        setOpenExportMenu(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      Daily Report
                    </button>

                    <button
                      onClick={() => {
                        const selectedData = filteredReports.filter(r =>
                          selectedReports.includes(r.report_id)
                        );
                        exportMonthlyReport(selectedData);
                        setOpenExportMenu(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      Monthly Report
                    </button>

                  </div>
                )}
              </div>
              <div className="hidden">
                <DailySiteReportPDF
                  ref={dailyRef}
                  reports={reports.filter(r => selectedReports.includes(r.report_id))}
                />
              </div>

            </div>
          </div>

          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Header checkbox */}
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
                          setSelectedReports(currentReports.map((r) => r.report_id));
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
                    {/* Row checkbox */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.report_id)}
                        onChange={() => {
                          if (selectedReports.includes(report.report_id)) {
                            setSelectedReports(
                              selectedReports.filter((id) => id !== report.report_id)
                            );
                          } else {
                            setSelectedReports([...selectedReports, report.report_id]);
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
                              openMenuId === report.report_id ? null : report.report_id
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

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0 px-4 pb-4">


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

              <div className="space-x-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded ${currentPage === 1
                    ? "bg-gray-200 text-gray-400"
                    : "bg-white hover:bg-gray-100"
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 border rounded ${currentPage === totalPages || totalPages === 0
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

export default DailySiteReportTable;
