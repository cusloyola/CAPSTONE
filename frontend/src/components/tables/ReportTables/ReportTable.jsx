import React from "react";
import TableHeader from "../../common/TableHeader";
// import StatusBadge from "./StatusBadge"; // uncomment if needed
// import ActionButtons from "./ActionButtons"; // uncomment if needed

const ReportTable = ({
    title = "Safety Reports Management", // default fallback
    reports,
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
    const filteredAndSortedReports = reports
        .filter((r) => {
            const matchQuery =
                r.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.activities.some((a) =>
                    a.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
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

                <div className="mb-14 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-80 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {report.project_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {new Date(report.report_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {report.reviewed_at
                                            ? new Date(report.reviewed_at).toLocaleDateString()
                                            : "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        <ul className="list-disc list-inside space-y-1">
                                            {report.activities.map((act, i) => (
                                                <li key={i}>{act.description}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={report.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <ActionButtons
                                            onViewSummary={() => onViewSummary(report)}
                                            onDownloadPDF={() => onDownloadPDF(report.report_id)}
                                            onApprove={
                                                userRole === "admin" && report.status === "pending"
                                                    ? () => onApprove(report.report_id)
                                                    : undefined
                                            }
                                            onReject={
                                                userRole === "admin" && report.status === "pending"
                                                    ? () => onReject(report.report_id)
                                                    : undefined
                                            }
                                            buttonSize="small"
                                        />
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
