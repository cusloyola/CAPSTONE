import React from 'react';

const FilterAndSearch = ({
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterMonth,
    setFilterMonth,
    filterYear,
    setFilterYear,
    requests
}) => {
    const years = [...new Set(requests.map(r => new Date(r.request_date).getFullYear()))].sort((a, b) => b - a);

    return (
        <div className="flex flex-wrap gap-4 mt-10">
            <div className="flex flex-col gap-2 mt-6">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2 rounded w-48">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            <div className="flex flex-col gap-2 mt-6">
                <select className="border p-2 rounded w-48" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                    <option value="">All Months</option>
                    {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ].map((m, i) => (<option key={i} value={i}>{m}</option>))}
                </select>
            </div>
            <div className="flex flex-col gap-2 mt-6">
                <select className="border p-2 rounded w-48" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                    <option value="">All Years</option>
                    {years.map((y, i) => (<option key={i} value={y}>{y}</option>))}
                </select>
            </div>
            <div className="flex flex-col gap-2 mt-6">
                <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border p-2 rounded w-64 h-10"
                />
            </div>
        </div>
    );
};

export default FilterAndSearch;