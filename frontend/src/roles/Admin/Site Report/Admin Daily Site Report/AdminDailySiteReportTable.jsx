import React, { useState, useEffect, useRef } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { FcExport } from "react-icons/fc";

import ApproveAdminSiteReportModal from "./ApproveAdminSiteReportModal";

const AdminDailySiteReportTable = ({
    reports,
    columns,
    reportRefs,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    onAdd,
    onAction,
    onUpdateReport,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);


    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRefs = useRef({});

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);


const filteredReports = reports
  .filter((r) => {
    const search = searchQuery.toLowerCase();

    const matchProject = r.project_name?.toLowerCase().includes(search);
    const matchFullName = r.full_name?.toLowerCase().includes(search);
    const matchDate = new Date(r.report_date).toDateString().toLowerCase().includes(search);

    const matchQuery = matchProject || matchFullName || matchDate;

    // Handle status filter
    let matchStatus = false;
    if (filterStatus === "all") {
      matchStatus = true;
    } else if (filterStatus === "Unviewed") {
      matchStatus = !r.last_viewed; // If last_viewed is null or undefined
    } else {
      matchStatus = r.status?.toLowerCase() === filterStatus.toLowerCase();
    }

    return matchQuery && matchStatus;
  })
  .sort((a, b) => new Date(b.report_date) - new Date(a.report_date));

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
    const handleClick = async (report, type) => {
        await onAction(report, type);
        setOpenMenuId(null);
    };




    const handleReportAction = (report, action) => {
        if (action === "approve") {
            setSelectedReport(report);
            setIsModalOpen(true);
        }
        // Add more logic for "view" or "revert" if needed
    };


    return (
        <div className="min-h-screen space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-10 mb-2 gap-4">

                <select
                    className="border px-3 py-1 rounded-lg text-md h-10 w-40"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Unviewed">Unviewed</option>
                </select>

            </div>


            {/* Filters & Export */}
            <div className="mt-10 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <div className="text-sm text-gray-700 ">
                        Show
                        <select
                            className="mx-2 px-2 py-1 border rounded w-14"
                            value={entriesPerPage}
                            onChange={handleEntriesChange}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        entries
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border px-3 py-1 rounded-lg text-md h-10"
                        />

                        <button className="border rounded border-black b hover:bg-gray-300 text-black px-3 py-1 rounded-lg text-sm h-10">
                            Export PDF
                        </button>

                        {/* <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm h-10">
                            Export Excel
                        </button> */}
                    </div>
                </div>

                {/* Table */}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
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

                                                    {["pending", "draft", "open"].includes(report.status?.toLowerCase()) && (
                                                        <button
                                                            onClick={() => handleReportAction(report, "approve")} // ✅ Call the correct function
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Approve
                                                        </button>

                                                    )}

                                                    {["approved"].includes(report.status?.toLowerCase()) && (
                                                        <button
                                                            onClick={() => handleClick(report, "revert")}
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Revert to Draft
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
                    <div className="text-sm text-gray-600">
                        Showing {filteredReports.length === 0 ? 0 : indexOfFirst + 1} to{" "}
                        {Math.min(indexOfLast, filteredReports.length)} of {filteredReports.length} entries
                    </div>

                    <div className="space-x-2">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 border rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1 border rounded ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
                        >
                            Next
                        </button>

                    </div>
                </div>
            </div>

            <ApproveAdminSiteReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)} // ✅ FIXED
                report={selectedReport}
                onApprove={(updatedRemarks) => {
                    const updatedReport = {
                        ...selectedReport,
                        status: "Approved",
                        admin_remarks: updatedRemarks,
                    };

                    if (onUpdateReport) {
                        onUpdateReport(updatedReport);
                    }

                    setIsModalOpen(false);
                }}

            />



        </div>
    );
};

export default AdminDailySiteReportTable;
