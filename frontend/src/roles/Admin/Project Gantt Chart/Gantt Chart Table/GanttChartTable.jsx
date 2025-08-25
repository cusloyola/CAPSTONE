import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import AddGanttChartModal from "./AddGanttChartModal";
import { getGanttCharts } from "../../../../api/ganttChartApi";
import { FaEllipsisV } from "react-icons/fa";



const GanttChartTable = () => {
    const { project_id } = useParams();
    const [showAddModal, setShowAddModal] = useState(false);
    const [ganttCharts, setGanttCharts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchGanttCharts = async () => {
        try {
            setLoading(true);
            const data = await getGanttCharts(project_id);
            setGanttCharts(data);
        } catch (err) {
            console.error("Failed to fetch Gantt charts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGanttCharts();
    }, [project_id]);

    const openAddModal = () => {
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        fetchGanttCharts(); // Refresh table after adding new chart
    };

    const total = ganttCharts.length;
    const pending = ganttCharts.filter((g) => g.status === "pending").length;
    const approved = ganttCharts.filter((g) => g.status === "approved").length;

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
                        className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-800"
                    >
                        Create Gantt Chart
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                <div className="bg-[#508afd] border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                    <p className="text-md text-white font-semibold">Total Gantt Charts</p>
                    <h2 className="text-4xl font-bold text-white">{total}</h2>
                    <p className="text-white text-sm">All statuses</p>
                </div>
                {/* <div className="bg-[#ffc256] border border-gray-200 p-5 rounded-2xl shadow space-y-2">
          <p className="text-md text-white font-semibold">Pending Charts</p>
          <h2 className="text-4xl font-bold text-white">{pending}</h2>
          <p className="text-white text-sm">Still under review</p>
        </div>
        <div className="bg-[#5bc8b2] border border-gray-200 p-5 rounded-2xl shadow space-y-2">
          <p className="text-md text-white font-semibold">Approved Charts</p>
          <h2 className="text-4xl font-bold text-white">{approved}</h2>
          <p className="text-white text-sm">Approved & completed</p>
        </div> */}
            </div>

            {/* Proposal Table */}
            <div>
                <table className="table-auto w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2 text-left">Title</th>
                            <th className="border px-4 py-2 text-left">Notes</th>
                            <th className="border px-4 py-2 text-left">Prepared By</th>

                            <th className="border px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : ganttCharts.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">
                                    No Gantt charts found.
                                </td>
                            </tr>
                        ) : (
                            ganttCharts.map((g) => (
                                <tr key={g.gantt_id}>

                                    <td className="border px-4 py-2">
                                        <Link
                                            to={`/InProgressProjectTable/${project_id}/profile/ganttChart/${g.gantt_id}/setup`}
                                            className="text-blue-600 hover:underline"

                                        >
                                            {g.title}
                                        </Link>
                                    </td>


                                    <td className="border px-4 py-2">{g.notes}</td>
                                    <td className="border px-4 py-2">{g.full_name}</td>
                                    <td className="border px-4 py-2">
                                        <button
                                            className="text-gray-600 hover:text-black p-2"
                                        >
                                            <FaEllipsisV />
                                        </button>                                    </td>
                                </tr>


                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showAddModal && (
                <AddGanttChartModal isOpen={showAddModal} onClose={closeAddModal} projectId={project_id} />
            )}
        </div>
    );
};

export default GanttChartTable;
