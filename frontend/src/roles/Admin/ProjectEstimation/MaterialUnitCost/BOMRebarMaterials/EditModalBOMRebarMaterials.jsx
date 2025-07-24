import React, { useState, useEffect } from "react";

const EditModalBOMRebarMaterials = ({ proposal_id, data, onClose, onSave }) => {
    const [formData, setFormData] = useState({});
    const [groupedMaterials, setGroupedMaterials] = useState({});
    const [selectedBrand, setSelectedBrand] = useState("");

    // Helper function to compute total cost (Work Volume * Unit Cost)
    const computeTotalCost = ({ total_per_rebar = 0, default_unit_cost = 0 }) => {
        return +(total_per_rebar * default_unit_cost).toFixed(2);
    };

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/mto/resources");
                const json = await res.json();
                const materials = Array.isArray(json) ? json : json.data;

                const grouped = {};
                materials.forEach((m) => {
                    if (!grouped[m.brand_name]) grouped[m.brand_name] = [];
                    grouped[m.brand_name].push(m);
                });

                setGroupedMaterials(grouped);

                if (data) {
                    const selectedMaterial = materials.find(
                        (m) => m.resource_id === data.resource_id
                    );

                    const unitCost =
                        selectedMaterial?.unit_cost ||
                        selectedMaterial?.default_unit_cost ||
                        0;

                    const totalWeight = data.total_per_rebar || 0; // This is your 'Work Volume'

                    // Initialize selectedBrand to the brand of the 'data' prop
                    setSelectedBrand(data.brand_name || "");

                    setFormData({
                        mto_rebar_resource_id: data.mto_rebar_resource_id, // Needed for backend update
                        resource_id: data.resource_id,
                        material_name: data.material_name,
                        unitCode: data.unitCode || selectedMaterial?.unitCode || "",
                        default_unit_cost: unitCost,
                        total_per_rebar: totalWeight,
                        total_cost: computeTotalCost({ total_per_rebar: totalWeight, default_unit_cost: unitCost }),
                        brand_name: data.brand_name,
                        original_resource_id: data.resource_id, // Still useful for reference
                        sow_proposal_id: data.sow_proposal_id,
                        work_item_id: data.work_item_id,
                        parent_id: data.parent_id,
                    });
                }
            } catch (err) {
                console.error("❌ Error fetching materials:", err);
                setGroupedMaterials({});
            }
        };

        fetchMaterials();
    }, [data]); // Depend on data to re-fetch/re-initialize when data changes

    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand);
        setFormData((prev) => {
            // Get the current total_per_rebar (Work Volume) before clearing material details
            const currentTotalPerRebar = prev.total_per_rebar || 0;

            return {
                ...prev,
                brand_name: brand,
                resource_id: "", // Reset material selection
                material_name: "", // Clear material name
                unitCode: "", // Clear unit
                default_unit_cost: 0, // Clear unit cost
                total_per_rebar: currentTotalPerRebar,
                // Recalculate total cost with new (zero) unit cost
                total_cost: computeTotalCost({ total_per_rebar: currentTotalPerRebar, default_unit_cost: 0 }),
            };
        });
    };

    const handleMaterialSelect = (resourceId) => {
        const selected = groupedMaterials[selectedBrand]?.find(
            (m) => String(m.resource_id) === String(resourceId) // Ensure comparison is type-safe
        );

        if (!selected) return;

        const unitCost = selected.unit_cost ?? selected.default_unit_cost ?? 0;
        const unitCode = selected.unitCode || selected.unit_code || "";
        const currentTotalPerRebar = formData.total_per_rebar || 0; // Use current Work Volume

        setFormData((prev) => ({
            ...prev,
            resource_id: selected.resource_id,
            material_name: selected.material_name,
            unitCode: unitCode,
            default_unit_cost: unitCost,
            total_cost: computeTotalCost({ total_per_rebar: currentTotalPerRebar, default_unit_cost: unitCost }),
        }));
    };

    const handleSubmit = async () => {
        console.log("🟡 SUBMIT triggered");
        console.log("Proposal ID (from prop):", proposal_id);
        console.log("Current formData state:", formData);

        if (!formData.resource_id) {
            alert("Please select a material before saving.");
            return;
        }

        try {
            const { total_per_rebar = 0, default_unit_cost = 0 } = formData;

            const material_cost = computeTotalCost({ total_per_rebar, default_unit_cost });

            const payload = {

                materialTakeOff: [
                    {
                        mto_rebar_resource_id: formData.mto_rebar_resource_id, // <--- Place it here

                        sow_proposal_id: formData.sow_proposal_id,
                        resource_id: formData.resource_id,
                        material_cost
                    }
                ]
            };

            console.log("🚀 Sending Payload:", JSON.stringify(payload, null, 2));

            const res = await fetch(
                `http://localhost:5000/api/rebar-details/update/${proposal_id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            console.log("Response status:", res.status);

            if (!res.ok) {
                const errorData = await res.json();
                console.error("❌ API Error Response:", errorData);
                alert(`Update failed: ${errorData.message || res.statusText}`);
            } else {
                console.log("✅ Update successful!");
                onSave?.();
                onClose();
            }
        } catch (err) {
            console.error("❌ Error submitting (catch block):", err);
            alert("Error updating: " + err.message);
        }
    };



    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                    Edit Material: {formData.material_name || "Unnamed Material"}
                </h2>

                <div className="space-y-6">
                    <div className="border p-4 rounded bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Brand Select */}
                            <div>
                                <label className="block mb-1 text-sm">Select Brand</label>
                                <select
                                    className="w-full border px-2 py-1 rounded"
                                    value={selectedBrand}
                                    onChange={(e) => handleBrandSelect(e.target.value)}
                                >
                                    <option value="">-- Select Brand --</option>
                                    {Object.keys(groupedMaterials).map((brand) => (
                                        <option key={brand} value={brand}>
                                            {brand}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Material Select */}
                            <div>
                                <label className="block mb-1 text-sm">Select Material</label>
                                <select
                                    className="w-full border h-9 px-2 py-1 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.resource_id || ""}
                                    onChange={(e) => handleMaterialSelect(e.target.value)}
                                >
                                    <option value="">-- Select Material --</option>
                                    {groupedMaterials[selectedBrand]
                                        ?.filter((material) => {
                                            // Keep the currently selected material always in the list
                                            if (material.resource_id === formData.resource_id) return true;

                                            // Filter out materials already used for the current work_item_id
                                            const isUsed = data.existingMTOList?.some(
                                                (existing) =>
                                                    existing.resource_id === material.resource_id &&
                                                    existing.sow_proposal_id === data.sow_proposal_id &&
                                                    existing.work_item_id === data.work_item_id
                                            );
                                            return !isUsed;
                                        })
                                        .map((mat) => (
                                            <option key={mat.resource_id} value={mat.resource_id}>
                                                {mat.material_name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* Unit */}
                            <div>
                                <label className="block mb-1 text-sm">Unit</label>
                                <input
                                    type="text"
                                    value={formData.unitCode || ""}
                                    readOnly
                                    className="w-full border px-2 py-1 rounded bg-gray-100"
                                />
                            </div>

                            {/* Work Volume (renamed from total_per_rebar for clarity in UI) */}
                            <div>
                                <label className="block mb-1 text-sm">Work Volume</label>
                                <input
                                    type="number"
                                    value={formData.total_per_rebar || ""}
                                    readOnly
                                    className="w-full border px-2 py-1 rounded bg-gray-100"
                                />
                            </div>

                            {/* Unit Cost */}
                            <div>
                                <label className="block mb-1 text-sm">Unit Cost</label>
                                <input
                                    type="number"
                                    value={formData.default_unit_cost || ""}
                                    readOnly
                                    className="w-full border px-2 py-1 rounded bg-gray-100"
                                />
                            </div>

                            {/* Total Cost */}
                            <div className="col-span-2">
                                <label className="block mb-1 text-sm">Total Cost</label>
                                <div className="text-lg font-bold">
                                    ₱{" "}
                                    {formData.total_cost?.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end pt-4 mt-4">
                        <button
                            onClick={onClose}
                            className="mr-2 px-4 py-2 border rounded text-sm hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.resource_id}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditModalBOMRebarMaterials;