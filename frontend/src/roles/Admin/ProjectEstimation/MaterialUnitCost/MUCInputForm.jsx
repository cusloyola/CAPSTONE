import React, { useState } from "react";

const MUCInputForm = ({ parent, onBack, onDone }) => {
    const [marketPrice, setMarketPrice] = useState("");
    const [allowance, setAllowance] = useState("");

    const computeMUC = () => {
        const mp = parseFloat(marketPrice) || 0;
        const alw = parseFloat(allowance) || 0;
        return mp + (mp * alw / 100);
    };

    const handleClear = () => {
        setAllowance("");
        setMarketPrice("");
    };


    const handleSave = async () => {
        const mp = parseFloat(marketPrice);
        const alw = parseFloat(allowance);

        // Check for invalid input: not a number or negative
        if (isNaN(mp) || mp < 0 || isNaN(alw) || alw < 0) {
            alert("❌ Please enter valid non-negative numbers for Market Price and Allowance.");
            return;
        }

        const materialUnitCost = parseFloat((mp + (mp * alw / 100)).toFixed(2));

        const payload = {
            sow_proposal_id: parent.sow_proposal_id,
            market_value: mp,
            allowance: alw,
            material_uc: materialUnitCost

        };

        try {
            const response = await fetch("http://localhost:5000/api/materialunitcost/save", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if(response.ok){
                console.log("Saved: ", result.message);
                onDone();
            }
            else {
                console.log("Error: ", result.message);
                alert("Failed to save: " + result.message);
            }
        }
        catch (error) {
            console.error("Server error", error);
            alert("Something went wrong while saving");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Cost Estimate: MUC</h2>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
                <span className="font-semibold">{parent.item_title}</span> — {parent.category || "General Items"}
            </p>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto space-y-8 p-4 custom-scrollable-box">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Material Unit Cost</h3>

                <div className="border border-gray-200 rounded-xl shadow-inner p-6 bg-gray-50 mb-6">
                    <h4 className="text-xl font-semibold mb-4 text-blue-700">
                        Item: {parent.item_title}
                    </h4>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market Value</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allowance</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material Unit Cost</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-4 py-4">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-32 rounded-lg border border-gray-300 p-2"
                                            value={marketPrice}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only digits and optional decimal
                                                if (/^\d*\.?\d*$/.test(value) || value === "") {
                                                    setMarketPrice(value);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-32 rounded-lg border border-gray-300 p-2"
                                            value={allowance}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only digits and optional decimal
                                                if (/^\d*\.?\d*$/.test(value) || value === "") {
                                                    setAllowance(value);
                                                }
                                            }} />
                                    </td>
                                    <td className="px-4 py-4">₱{computeMUC().toFixed(2)}</td>
                                    <td className="px-4 py-4">
                                        <button className="text-red-600 hover:text-red-900" onClick={handleClear}>
                                            Clear
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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

export default MUCInputForm;
