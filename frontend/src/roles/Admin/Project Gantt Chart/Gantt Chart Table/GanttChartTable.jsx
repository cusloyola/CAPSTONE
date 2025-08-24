
import React, { useState } from "react";
import { useParams } from "react-router-dom";

import AddGanttChartModal from "./AddGanttChartModal";
const GanttChartTable = () => {
    const { project_id } = useParams(); // 👈 pulls it from URL

    const [showAddModal, setShowAddModal] = useState(false);



    const openAddModal = () => {
        setShowAddModal(true);
    };


    return (
        <div className="p-6 min-h-screen space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4zm0 4h10v2H4z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Gantt Chart Table</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={openAddModal}

                        className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-800">
                        Create Gantt Chart
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                <div className="bg-[#508afd] border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                    <p className="text-md text-white font-semibold">Total Proposals</p>
                    <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-bold text-white">0</h2>
                    </div>
                    <p className="text-white text-sm">Includes all statuses</p>
                </div>
                <div className="bg-[#ffc256] border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                    <p className="text-md text-white font-semibold">Pending Proposals</p>
                    <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-bold text-white">0</h2>
                    </div>
                    <p className="text-white text-sm">Still under review</p>
                </div>
                <div className="bg-[#5bc8b2] border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                    <p className="text-md text-white font-semibold">Approved Proposals</p>
                    <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-bold text-white">0</h2>
                    </div>
                    <p className="text-white text-sm">Approved & completed</p>
                </div>
            </div>

            {/* Filters */}
            <div>
                <select className="border px-3 py-1 rounded-lg text-md h-10 w-40">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Show</label>
                    <select className="border px-2 py-1 rounded-lg text-sm h-10 w-20">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <label className="text-sm text-gray-700">entries</label>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Search proposals..."
                        className="border p-2 rounded w-64 h-10"
                    />
                </div>
            </div>

            {/* Proposal Table */}
            <div>
                <table className="table-auto w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2 text-left">Proposal Title</th>
                            <th className="border px-4 py-2 text-left">Description</th>
                            <th className="border px-4 py-2 text-left">Status</th>
                            <th className="border px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500">
                                No proposals found.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                <p>Showing 0 to 0 of 0 entries</p>
                <div className="flex gap-2 mt-2 sm:mt-0">
                    <button className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                </div>
            </div>

            {/* Modals Placeholder */}
            <div>

                {showAddModal && (
                    <AddGanttChartModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        projectId={project_id}   // 👈 pass it here
                    />

                )}



            </div>
        </div>
    );
};

export default GanttChartTable;
