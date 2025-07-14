import React, { useEffect, useRef, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import TableHeader from "../../common/TableHeader";

const ReportTable = ({
    title = "Reports Table",
    reports,
    columns,
    userRole,
    onViewSummary,
    onDownloadPDF,
    onApprove,
    onReject,
    reportRefs,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    onAdd,
}) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRefs = useRef({});

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.entries(menuRefs.current).forEach(([id, ref]) => {
                if (ref && !ref.contains(event.target)) {
                    setOpenMenuId(null);
                }
            });
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredAndSortedReports = reports
        .filter((r) => {
            const matchQuery = r.project_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchStatus = filterStatus === "all" || r.status === filterStatus;
            return matchQuery && matchStatus;
        })
        .sort((a, b) => new Date(b.report_date) - new Date(a.report_date));

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-md shadow-lg">
                <TableHeader
                    title={title}
                    userRole={userRole}
                    onAdd={onAdd}
                    addLabel="+ Add Report"
                />

                {/* Filter/Search */}
                <div className="mb-14 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
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
                            {filteredAndSortedReports.map((report) => (
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

                                    {/* Action Dropdown */}
                                    <td className="px-6 py-4 text-sm relative">
                                        <div
                                            className="inline-block"
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
                                                title="More actions"
                                            >
                                                <FaEllipsisV />
                                            </button>

                                            {openMenuId === report.report_id && (
                                                <div className="absolute right-0 mt-2 z-10 bg-white border border-gray-200 rounded-md shadow-md w-36">
                                                    <button
                                                        onClick={() => {
                                                            onViewSummary(report);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onDownloadPDF(report.report_id);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                                                    >
                                                        Download
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onAction(report, "edit");
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                                                    >
                                                        Edit
                                                    </button>

                                                    {userRole === "admin" &&
                                                        report.status === "pending" && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        onApprove(report.report_id);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        onReject(report.report_id);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportTable;
