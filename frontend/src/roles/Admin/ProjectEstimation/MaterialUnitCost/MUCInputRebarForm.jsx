import React from "react";

const MUCInputRebarForm = ({ selectedRebars, formState, onChange, resources, grandTotal }) => {
    const handleMaterialSelect = (rebarId, materialName) => {
        const selectedResource = resources.find(res => res.material_name === materialName);
        if (!selectedResource) return;

        onChange(rebarId, 0, "resource_id", selectedResource.resource_id);
        onChange(rebarId, 0, "unit_cost", selectedResource.default_unit_cost);
    };

    return (
        <div className="space-y-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-10">
            {selectedRebars.length === 0 ? (
                <p className="text-lg text-gray-500 dark:text-gray-400">
                    No rebar entries available. Ensure you have data from proposal.
                </p>
            ) : (
                selectedRebars.map((rebar) => {
                    const rows = formState[rebar.rebar_masterlist_id] || [{}];
                    const weight = typeof rebar.total_weight === "number" ? rebar.total_weight : 0;

                    const currentResource = resources.find(
                        res => res.resource_id === rows[0]?.resource_id
                    ) || {};

                    const materialCost = weight * (rows[0].unit_cost || 0);

                    return (
                        <div
                            key={rebar.rebar_masterlist_id}
                            className="border border-gray-200 rounded-xl shadow-inner p-6 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 mb-6"
                        >
                            <h4 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-400">
                                Rebar: {rebar.label} (Total Weight: {weight.toFixed(2)} kg)
                            </h4>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-100 dark:bg-gray-600">
                                        <tr>
                                            {["Material", "Brand", "Unit", "Unit Cost (₱)", "Total Weight", "Material Cost (₱)"].map((h, i) => (
                                                <th
                                                    key={i}
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
                                        <tr>
                                            {/* Material Combo Box */}
                                            <td className="px-4 py-4">
                                                <input
                                                    list={`material-options-${rebar.rebar_masterlist_id}`}
                                                    className="w-48 p-2 border rounded dark:bg-gray-700 dark:text-white"
                                                    defaultValue={currentResource.material_name || ""}
                                                    onChange={(e) =>
                                                        handleMaterialSelect(rebar.rebar_masterlist_id, e.target.value)
                                                    }
                                                />
                                                <datalist id={`material-options-${rebar.rebar_masterlist_id}`}>
                                                    {resources.map((resource) => (
                                                        <option
                                                            key={resource.resource_id}
                                                            value={resource.material_name}
                                                        />
                                                    ))}
                                                </datalist>
                                            </td>

                                            {/* Brand */}
                                            <td className="px-4 py-4">{currentResource.brand_name || "-"}</td>

                                            {/* Unit */}
                                            <td className="px-4 py-4">{currentResource.unitCode || "-"}</td>

                                            {/* Unit Cost (read-only) */}
                                            <td className="px-4 py-4">
                                                ₱{(currentResource.default_unit_cost || 0).toFixed(2)}
                                            </td>

                                            <td className="px-4 py-4">
                                                {weight.toFixed(2)}
                                            </td>


                                            {/* Material Cost */}
                                            <td className="px-4 py-4">
                                                ₱{materialCost.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Grand Total Cost */}
            <div className="border rounded-md p-6 bg-white dark:bg-gray-800 mt-8">
                <div className="flex justify-end items-center">
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                        Grand Total Rebar Cost:{" "}
                        <span className="text-purple-700 dark:text-purple-300">
                            ₱{grandTotal.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MUCInputRebarForm;
