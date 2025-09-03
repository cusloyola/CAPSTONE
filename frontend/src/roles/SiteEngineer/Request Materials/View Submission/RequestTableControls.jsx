import React from "react";

const RequestTableControls = ({
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    entriesPerPage,
    setEntriesPerPage,
    requests,
    handleExport,
    openExportMenu,
    setOpenExportMenu
}) => {
    const years = [...new Set(requests.map(r => new Date(r.request_date).getFullYear()))].sort((a, b) => b - a);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-6 pb-2 border-b">
                <h2 className="text-2xl font-semibold text-gray-900">Request Overview</h2>
                <div className="relative">
                    <button
                        onClick={() => setOpenExportMenu(!openExportMenu)}
                        className="px-4 py-2 border border-gray-400 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Export to PDF
                    </button>
                    {openExportMenu && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                            <button
                                onClick={handleExport}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            >
                                Export Selected
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-end mb-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
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

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Month</label>
                    <select
                        className="border p-2 rounded w-48"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                    >
                        <option value="">All Months</option>
                        {months.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <select
                        className="border p-2 rounded w-48"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                    >
                        <option value="">All Years</option>
                        {years.map((y, i) => (
                            <option key={i} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:ml-auto">
                    <label className="text-sm font-medium text-gray-700">Search:</label>
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border p-2 rounded w-full md:w-64"
                    />
                </div>
            </div>
        </div>
    );
};

export default RequestTableControls;