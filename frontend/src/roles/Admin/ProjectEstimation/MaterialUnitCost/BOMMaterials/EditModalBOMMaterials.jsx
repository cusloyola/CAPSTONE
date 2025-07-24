import React, { useState, useEffect } from "react";

const EditModalBOMMaterials = ({ proposal_id, data, onClose, onSave }) => {
    const [formData, setFormData] = useState({});
    const [selectedBrand, setSelectedBrand] = useState("");
    const [groupedMaterials, setGroupedMaterials] = useState({});

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
                    const selectedMaterial = materials.find((m) => m.resource_id === data.resource_id);

                    setSelectedBrand(data.brand_name || "");

                    setFormData({
                        ...data,
                        original_resource_id: data.resource_id, // track original
                        unitCode: selectedMaterial?.unit || selectedMaterial?.unitCode || "",
                        default_unit_cost: selectedMaterial?.unit_cost || selectedMaterial?.default_unit_cost || 0,
                    });
                }
            } catch (err) {
                console.error("❌ Error fetching materials:", err);
                setGroupedMaterials({});
            }
        };

        fetchMaterials();
    }, [data]);

    const handleChange = (field, value) => {
        const parsedValue = parseFloat(value) || 0;
        setFormData((prev) => {
            const updated = { ...prev, [field]: parsedValue };

            if (field === "multiplier") {
                const unit_cost = prev.default_unit_cost || 0;
                const total_volume = prev.total_volume || 0;
                const { actual_qty, total_cost } = computeCosts({ multiplier: parsedValue, total_volume, unit_cost });
                updated.actual_qty = actual_qty;
                updated.total_cost = total_cost;
            }

            return updated;
        });
    };

    const computeCosts = ({ multiplier = 0, total_volume = 0, unit_cost = 0 }) => {
        const actual_qty = +(multiplier * total_volume).toFixed(2);
        const total_cost = +(actual_qty * unit_cost).toFixed(2);
        return { actual_qty, total_cost };
    };

    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand);
        setFormData((prev) => ({
            ...prev,
            brand_name: brand,
            resource_id: "",
            material_name: "",
            unitCode: "",
            default_unit_cost: 0,
            actual_qty: 0,
            total_cost: 0,
        }));
    };

    const handleMaterialSelect = (resource_id) => {
        const selected = groupedMaterials[selectedBrand]?.find(
            (m) => m.resource_id === Number(resource_id)
        );

        if (selected) {
            const { multiplier = 0, total_volume = 0 } = formData;
            const unit_cost = selected.unit_cost || selected.default_unit_cost || 0;
            const { actual_qty, total_cost } = computeCosts({ multiplier, total_volume, unit_cost });

            setFormData((prev) => ({
                ...prev,
                resource_id: selected.resource_id,
                material_name: selected.material_name,
                unitCode: selected.unit || selected.unitCode || "",
                default_unit_cost: unit_cost,
                actual_qty,
                total_cost,
            }));
        }
    };

    const handleSubmit = async () => {
        try {
            const { total_volume = 0, multiplier = 0, default_unit_cost = 0 } = formData;

            const actual_qty = +(multiplier * total_volume).toFixed(2);
            const material_cost = +(actual_qty * default_unit_cost).toFixed(2);

            const materialTakeOff = [
                {
                    mto_id: formData.mto_id, // ✅ critical for backend to update correctly

                    sow_proposal_id: formData.sow_proposal_id,
                    work_item_id: formData.work_item_id,
                    resource_id: formData.resource_id,
                    original_resource_id: formData.original_resource_id, // include for update logic
                    multiplier,
                    actual_qty,
                    material_cost,
                },
            ];

            const parentTotals = [
                {
                    sow_proposal_id: formData.sow_proposal_id,
                    work_item_id: formData.parent_id,
                    mto_parent_grandTotal: material_cost,
                },
            ];

            const res = await fetch(`http://localhost:5000/api/mto/update/${proposal_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ materialTakeOff, parentTotals }),
            });

            if (res.ok) {
                onSave?.();
                onClose();
            } else {
                alert("Update failed");
            }
        } catch (err) {
            console.error("❌ Error submitting:", err);
            alert("Error updating");
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
                            <div>
                                <label className="block mb-1 text-sm">Select Brand</label>
                                <select
                                    className="w-full border px-2 py-1 rounded"
                                    value={selectedBrand}
                                    onChange={(e) => handleBrandSelect(e.target.value)}
                                >
                                    <option value="">-- Select Brand --</option>
                                    {Object.keys(groupedMaterials).map((brand) => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>

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
        if (material.resource_id === formData.resource_id) return true;

        const isUsed = data.existingMTOList?.some(
          (existing) =>
            existing.resource_id === material.resource_id &&
            existing.sow_proposal_id === data.sow_proposal_id &&
            existing.work_item_id === data.work_item_id
        );

        return !isUsed;
      })
      .map((material) => (
        <option key={material.resource_id} value={material.resource_id}>
          {material.material_name}
        </option>
      ))}
  </select>
</div>



                            <div>
                                <label className="block mb-1 text-sm">Unit</label>
                                <input
                                    type="text"
                                    value={formData.unitCode || ""}
                                    readOnly
                                    className="w-full border px-2 py-1 rounded bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Multiplier</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={formData.multiplier || ""}
                                    onChange={(e) => handleChange("multiplier", e.target.value)}
                                    className="w-full border px-2 py-1 rounded"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Work Volume</label>
                                <input
                                    type="number"
                                    value={formData.total_volume || ""}
                                    readOnly
                                    className="w-full border px-2 py-1 rounded bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Quantity</label>
                                <input
                                    type="number"
                                    value={formData.actual_qty || ""}
                                    readOnly
                                    className="w-full border px-2 py-1 rounded bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm">Unit Cost</label>
                                <input
                                    type="number"
                                    value={formData.default_unit_cost || ""}
                                    readOnly
                                    className="w-full border px-2 py-1 rounded bg-gray-100"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block mb-1 text-sm">Total Cost</label>
                                <div className="text-lg font-bold">
                                    ₱ {formData.total_cost || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 mt-4">
                        <button
                            className="mr-2 px-4 py-2 border rounded text-sm hover:bg-gray-100"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!formData.resource_id || !formData.multiplier}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            onClick={handleSubmit}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditModalBOMMaterials;
