import React, { useState, useEffect } from "react";

const AddAllowanceQTOModal = ({ node, onClose, onSave }) => {
    // Original volume from QTO parent totals
    const originalVolume = parseFloat(node?.data?.volume) || 0;
    const [allowance, setAllowance] = useState("");
    const [totalWithAllowance, setTotalWithAllowance] = useState(originalVolume);

    // Update totalWithAllowance when allowance changes
    useEffect(() => {
        const pct = parseFloat(allowance);
        if (!isNaN(pct)) {
            const adjusted =  (originalVolume * pct) ;
            setTotalWithAllowance(adjusted);
        } else {
            setTotalWithAllowance(originalVolume);
        }
    }, [allowance, originalVolume]);

    const handleSave = async () => {
        const pct = parseFloat(allowance);
        if (isNaN(pct)) {
            return alert("Please enter a valid allowance percentage.");
        }

        // Debug logging
        console.log("🕵️ node.data:", node.data);

        const payload = {
            sow_proposal_id: node.data.sow_proposal_id,
            allowance_percentage: pct,
            total_with_allowance: parseFloat(totalWithAllowance.toFixed(2))
        };

        console.log("📦 Sending to /qto/add-allowance:", payload);

        const res = await fetch("http://localhost:5000/api/qto/add-allowance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        console.log("⬅️ API Response:", res.status, json);

        onSave(payload);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[400px]">
                <h2 className="text-lg font-semibold mb-4">Add Allowance - {node.data.name}</h2>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Original Volume (m³):</label>
                    <p className="text-gray-900">
                        {originalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Allowance (%):</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full mt-1 p-2 border rounded"
                        value={allowance}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || (!isNaN(parseFloat(val)) && val >= 0 && val <= 100)) {
                                setAllowance(val);
                            }
                        }}
                        placeholder="Enter allowance %"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Total with Allowance (m³):</label>
                    <p className="text-gray-900 font-semibold">
                        {totalWithAllowance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        Save Allowance
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAllowanceQTOModal;
