import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { FaEllipsisH, FaTrashAlt, FaEraser } from "react-icons/fa";
import { selectRenderer } from "handsontable/renderers";

const LUCInputForm = ({ parent, onBack, onDone }) => {
    const [laborRates, setLaborRates] = useState([]);
    const [lucRows, setLucRows] = useState([]);

    useEffect(() => {
        const fetchLaborDetails = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/laborunitcost/labor-rate");
                const data = await response.json();
                setLaborRates(data);
            } catch (error) {
                console.error("Error fetching labor details", error.message);
            }
        };
        fetchLaborDetails();
    }, []);

    const handleAddRow = () => {
        setLucRows(prev => [
            ...prev,
            {
                id: uuidv4(),
                selectedLaborRateId: "",
                quantity: "",
                allowance: "",
                averageOutput: "",
                showDropdown: false,

            }
        ]);
    };

    const handleRemoveRow = (id) => {
        setLucRows(prev => prev.filter(row => row.id !== id));
    };

    const handleClearRow = (id) => {
        setLucRows(prev =>
            prev.map(row =>
                row.id === id
                    ? {
                        ...row,
                        selectedLaborRateId: "",
                        quantity: "",
                        allowance: "",
                        averageOutput: ""
                    }
                    : row
            )
        );
    };

    const handleRowChange = (id, key, value) => {
        setLucRows(prev =>
            prev.map(row =>
                row.id === id
                    ? { ...row, [key]: value }
                    : row
            )
        );
    };

    const handleSave = async () => {
        const finalRows = lucRows.map((row) => {
            const selectedLabor = laborRates.find(
                (lr) => lr.labor_rate_id === parseInt(row.selectedLaborRateId)
            );

            const quantity = parseFloat(row.quantity) || 0;
            const allowance = parseFloat(row.allowance) || 0;
            const averageOutput = parseFloat(row.averageOutput) || 1;

            const laborCost = selectedLabor
                ? ((selectedLabor.daily_rate * quantity) * (1 + allowance / 100)) / averageOutput
                : 0;

            return {
                selectedLaborRateId: row.selectedLaborRateId,
                quantity: quantity,
                allowance: allowance,
                averageOutput: averageOutput,
                laborCost: laborCost.toFixed(2)
            };
        });

        const totalLaborCost = finalRows.reduce((sum, r) => sum + parseFloat(r.laborCost), 0);

        try {
            const res = await fetch("http://localhost:5000/api/laborunitcost/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"

                },
                body: JSON.stringify({
                    sow_proposal_id: parent.sow_proposal_id,
                    laborCost: finalRows,
                    totalLaborCost: totalLaborCost.toFixed(2)
                })

            });

            const result = await res.json();

            if (!res.ok) throw new Error(result.message || " Error saving data");

            console.log("Saved: ", result.message);
            onDone(finalRows, totalLaborCost.toFixed(2));

        } catch (err) {
            console.error("Failed to save labor details", err);
            alert("Failed to save labor details. Please try again");

        }
    };





    const getTotalLaborCost = () => {
        return lucRows.reduce((total, row) => {
            const selectedLabor = laborRates.find(
                (lr) => lr.labor_rate_id === parseInt(row.selectedLaborRateId)
            );

            if (!selectedLabor) return total;

            const quantity = parseFloat(row.quantity) || 0;
            const allowance = parseFloat(row.allowance) || 0;
            const averageOutput = parseFloat(row.averageOutput) || 1;

            const cost = ((selectedLabor.daily_rate * quantity) * (1 + allowance / 100)) / averageOutput;

            return total + cost;
        }, 0).toFixed(2);
    };



    return (
        <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Cost Estimate: LUC</h2>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
                <span className="font-semibold">{parent.item_title}</span> — {parent.category || "General Items"}
            </p>
            <div className="flex-1 overflow-y-auto space-y-8 p-4 custom-scrollable-box">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Labor Unit Cost</h3>
                <div className="border border-gray-200 rounded-xl shadow-inner p-6 bg-gray-50 mb-6">
                    <h4 className="text-xl font-semibold mb-4 text-blue-700">
                        Item: {parent.item_title}
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Labor Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Rate (₱)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Average Output</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allowance (%)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Labor Cost (₱)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>

                                {lucRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-gray-400">
                                            No labor rows yet. Click " + Add Row " to begin.
                                        </td>
                                    </tr>

                                ) : (
                                    lucRows.map((row) => {
                                        const selectedLabor = laborRates.find(
                                            (lr) => lr.labor_rate_id === parseInt(row.selectedLaborRateId)
                                        );

                                        const laborCost = selectedLabor
                                            ? (
                                                (
                                                    (selectedLabor.daily_rate * (parseFloat(row.quantity) || 0)) *
                                                    (1 + (parseFloat(row.allowance) || 0) / 100)
                                                ) / (parseFloat(row.averageOutput) || 1)
                                            ).toFixed(2)
                                            : "0.00";

                                        return (
                                            <tr key={row.id}>
                                                <td className="px-4 py-4">
                                                    <select
                                                        value={row.selectedLaborRateId}
                                                        className="w-full rounded-lg"
                                                        onChange={(e) => handleRowChange(row.id, "selectedLaborRateId", e.target.value)}
                                                    >
                                                        <option value="">Select Labor Type</option>
                                                        {laborRates.map((lr) => {
                                                            const isSelectedElsewhere = lucRows.some(
                                                                (r) =>
                                                                    r.id !== row.id &&
                                                                    r.selectedLaborRateId &&
                                                                    r.selectedLaborRateId.toString() === lr.labor_rate_id.toString()
                                                            );

                                                            return (
                                                                <option
                                                                    key={lr.labor_rate_id}
                                                                    value={lr.labor_rate_id}
                                                                    disabled={isSelectedElsewhere}
                                                                >
                                                                    {lr.labor_type}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="text-gray-800">{selectedLabor?.daily_rate?.toFixed(2) || "0.00"}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.quantity}
                                                        className="w-32 rounded-lg border border-gray-300 p-2"
                                                        onChange={(e) => handleRowChange(row.id, "quantity", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.averageOutput}
                                                        className="w-32 rounded-lg border border-gray-300 p-2"
                                                        onChange={(e) => handleRowChange(row.id, "averageOutput", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.allowance}
                                                        className="w-32 rounded-lg border border-gray-300 p-2"
                                                        onChange={(e) => handleRowChange(row.id, "allowance", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-gray-800">{laborCost}</span>
                                                </td>
                                                <td className="px-4 py-4 relative">
                                                    <div className="relative inline-block text-left">
                                                        <button
                                                            onClick={() => {
                                                                // Toggle this row's dropdown visibility
                                                                setLucRows(prev =>
                                                                    prev.map(r =>
                                                                        r.id === row.id
                                                                            ? { ...r, showDropdown: !r.showDropdown }
                                                                            : { ...r, showDropdown: false }
                                                                    )
                                                                );
                                                            }}
                                                            className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                                        >
                                                            <FaEllipsisH />
                                                        </button>

                                                        {row.showDropdown && (
                                                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                                                                <button
                                                                    onClick={() => {
                                                                        handleClearRow(row.id);
                                                                        // close dropdown
                                                                        handleRowChange(row.id, "showDropdown", false);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100 flex items-center gap-2"
                                                                >
                                                                    <FaEraser className="text-yellow-600" />
                                                                    Clear Row
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handleRemoveRow(row.id);
                                                                        updateRow(row.id, "showDropdown", false);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    <FaTrashAlt className="text-red-600" />
                                                                    Remove Row
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                        <div className="flex justify-end mt-4 pr-4">
                            <span className="text-lg font-semibold text-gray-800">
                                Total Labor Cost: ₱ {getTotalLaborCost()}
                            </span>
                        </div>
                    </div>
                    <div className="mb-4">
                        <button
                            onClick={handleAddRow}
                            className="bg-blue-600 text-white px-4 py-2 mt-2 rounded hover:bg-blue-700 transition"
                        >
                            + Add Row
                        </button>
                    </div>
                </div>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                    ◀ Back to Children
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Done ▶
                </button>
            </div>
        </div>
    );
};
export default LUCInputForm;
