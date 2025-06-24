import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaFileExport } from "react-icons/fa";
import AddModalFinalEntry from "./AddModalFinalEntry";

const FinalCostEstimation = () => {
    const { proposal_id } = useParams();
    const [costData, setCostData] = useState([]);
    const [showExport, setShowExport] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchCostData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/cost-estimation/proposal/${proposal_id}/final-cost`);
            if (!res.ok) throw new Error("Failed to fetch cost data.");
            const data = await res.json();
            setCostData(data);
        } catch (err) {
            console.error("Error fetching cost data:", err);
        }
    };

    useEffect(() => {
        fetchCostData();
    }, [proposal_id]);

    const handleExportExcel = () => {
        console.log("Exporting to Excel...");
        setShowExport(false);
    };

    const handleExportPDF = () => {
        console.log("Exporting to PDF...");
        setShowExport(false);
    };

    return (
        <div className="p-4 space-y-6 bg-white shadow rounded">
            {/* Header */}
            <div className="bg-[#9559d1] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Final Cost Estimation</h1>
                <div className="relative">
                    <button
                        className="p-2 hover:text-gray-100 hover:bg-[#8142c2] rounded-full transition"
                        onClick={() => setShowExport(prev => !prev)}
                        title="Export Options"
                    >
                        <FaFileExport className="text-xl text-white" />
                    </button>
                    {showExport && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10">
                            <button onClick={handleExportExcel} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Export to Excel</button>
                            <button onClick={handleExportPDF} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Export to PDF</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Entry Button */}
            <div className="flex justify-end">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    onClick={() => setShowAddModal(true)}
                >
                    + Add Entry
                </button>
            </div>

            {/* Cost Estimation Table */}
            {costData.length > 0 ? (
                <table className="table-auto w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th rowSpan="2" className="border px-4 py-2 text-left">No.</th>
                            <th rowSpan="2" className="border px-4 py-2 text-left">Description/Scope of Works</th>
                            <th rowSpan="2" className="border px-4 py-2 text-left">Quantity</th>
                            <th rowSpan="2" className="border px-4 py-2 text-left">Unit</th>
                            <th colSpan="2" className="border px-4 py-2 text-center">Material Cost</th>
                            <th colSpan="2" className="border px-4 py-2 text-center">Labor Cost</th>
                            <th rowSpan="2" className="border px-4 py-2 text-left">Total Amount</th>
                        </tr>
                        <tr>
                            <th className="border px-4 py-2 text-left">U/C</th>
                            <th className="border px-4 py-2 text-left">Amount</th>
                            <th className="border px-4 py-2 text-left">U/C</th>
                            <th className="border px-4 py-2 text-left">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {costData.map((row, index) => (
                            <tr key={row.sow_proposal_id || index}>
                                <td className="border px-4 py-2">{index + 1}</td>
                                <td className="border px-4 py-2">{row.description}</td>
                                <td className="border px-4 py-2">{row.quantity}</td>
                                <td className="border px-4 py-2">{row.unit}</td>
                                <td className="border px-4 py-2">₱{parseFloat(row.material_uc).toFixed(2)}</td>
                                <td className="border px-4 py-2">₱{parseFloat(row.material_amount).toFixed(2)}</td>
                                <td className="border px-4 py-2">₱{parseFloat(row.labor_uc).toFixed(2)}</td>
                                <td className="border px-4 py-2">₱{parseFloat(row.labor_amount).toFixed(2)}</td>
                                <td className="border px-4 py-2 font-bold">₱{parseFloat(row.total_amount).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-500 mt-4">No cost data available for this proposal.</p>
            )}

            {/* Modal */}
            {showAddModal && (
                <AddModalFinalEntry
                    proposalId={proposal_id}
                    onClose={() => setShowAddModal(false)}
                    onSaveSuccess={fetchCostData}
                />

            )}
        </div>
    );
};

export default FinalCostEstimation;
