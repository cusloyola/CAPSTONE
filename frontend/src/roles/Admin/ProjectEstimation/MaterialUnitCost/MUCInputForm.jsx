import React, { useState, useEffect } from "react";

const MUCInputForm = ({ selectedItems, resources, onUpdateItems, onUpdateGrandTotals  }) => {
  const [materials, setMaterials] = useState([]);
  const [formState, setFormState] = useState({}); 

  useEffect(() => {
    onUpdateItems(formState);
  }, [formState, onUpdateItems]); 

  useEffect(() => {
    if (!Array.isArray(resources)) return;

    const newMaterials = resources.map(r => ({
      resource_id: r.resource_id,
      label: `${r.material_name} - ${r.brand_name}`.trim(),
      material_name: r.material_name,
      brand_name: r.brand_name,
      unit_cost: parseFloat(r.default_unit_cost),
      unitId: r.unitId,
      unitCode: r.unitCode
    }));

    setMaterials(newMaterials);
  }, [resources]);

  useEffect(() => {
    const initial = {};
    selectedItems.forEach(item => {
      initial[item.work_item_id] = [
        {
          label: "",
          material: "",
          brand: "",
          multiplier: 1,
          unit_cost: 0,
          unitId: "",
          unitCode: "",
          resource_id: "" // Initialize resource_id for new rows
        }
      ];
    });
    setFormState(initial);
  }, [selectedItems]);

  useEffect(() => {
  const totalsPerItem = selectedItems.map(item => {
    const qto = typeof item.total_volume === "number" ? item.total_volume : 0;
    const rows = formState[item.work_item_id] || [];

    const total = rows.reduce((sum, row) => {
      const qty = qto * row.multiplier;
      const cost = qty * row.unit_cost;
      return sum + cost;
    }, 0);

    return {
      sow_proposal_id: item.sow_proposal_id,
      work_item_id: item.work_item_id,
      grand_total: parseFloat(total.toFixed(2))
    };
  });

  if (onUpdateGrandTotals) {
      console.log("Calling onUpdateGrandTotals with:", totalsPerItem);

    onUpdateGrandTotals(totalsPerItem); // Emit to parent
  }
}, [formState, selectedItems, onUpdateGrandTotals]);



  const handleChange = (itemId, index, field, value) => {
    const updated = [...(formState[itemId] || [])];
    const row = { ...updated[index] };

    if (field === "material") {
      const matched = materials.find(m => m.label === value);
      if (matched) {
        row.label = matched.label;
        row.material = matched.material_name;
        row.brand = matched.brand_name;
        row.unit_cost = matched.unit_cost;
        row.unitId = matched.unitId;
        row.unitCode = matched.unitCode;
        row.multiplier = 1;
        row.resource_id = matched.resource_id;
      } else {
        row.label = value;
        row.material = "";
        row.brand = "";
        row.unit_cost = 0;
        row.unitId = "";
        row.unitCode = "";
        row.multiplier = 1;
        row.resource_id = "";
      }
    } else if (field === "multiplier") {
      row.multiplier = parseFloat(value) || 0;
    }

    updated[index] = row;
    setFormState(prev => ({ ...prev, [itemId]: updated }));
  };

  const handleAddRow = (itemId) => {
    setFormState(prev => ({
      ...prev,
      [itemId]: [
        ...(prev[itemId] || []),
        {
          label: "",
          material: "",
          brand: "",
          multiplier: 1,
          unit_cost: 0,
          unitId: "",
          unitCode: "",
          resource_id: "" 
        }
      ]
    }));
  };

  const handleRemoveRow = (itemId, index) => {
    const updated = [...formState[itemId]];
    updated.splice(index, 1);
    setFormState(prev => ({ ...prev, [itemId]: updated }));
  };

  const computeRowCost = (qto, multiplier, unit_cost) => {
    const actualQty = qto * multiplier;
    return actualQty * unit_cost;
  };

  const grandTotal = selectedItems.reduce((sum, item) => {
    const qto = typeof item.total_volume === "number" ? item.total_volume : 0;
    const rows = formState[item.work_item_id] || [];
    return sum + rows.reduce((s, row) => s + computeRowCost(qto, row.multiplier, row.unit_cost), 0);
  }, 0);

  return (
    <div className="space-y-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-10">
      {selectedItems.length === 0 ? (
        <p className="text-lg text-gray-500 dark:text-gray-400">
          No children selected. Please go back and select sub-scope items.
        </p>
      ) : (
        selectedItems.map(item => {
          const qto = typeof item.total_volume === "number" ? item.total_volume : 0;
          const rows = formState[item.work_item_id] || [];

          return (
            <div
              key={item.work_item_id}
              className="border border-gray-200 rounded-xl shadow-inner p-6 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 mb-6"
            >
              <h4 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-400">
                Item: {item.item_title || "Unnamed"} (QTO Volume: {qto.toFixed(2)} m³)
              </h4>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-600">
                    <tr>
                      {["Material", "Brand", "Unit", "Multiplier", "Work Qty", "Actual Qty", "Unit Cost (₱)", "Material Cost (₱)", "Action"].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
                    {rows.map((row, idx) => {
                      const actualQty = qto * row.multiplier;
                      const materialCost = actualQty * row.unit_cost;

                      return (
                        <tr key={idx}>
                          <td className="px-4 py-4">
                            <input
                              list={`material-list-${item.work_item_id}-${idx}`}
                              className="p-2 w-36 border rounded dark:bg-gray-700 dark:text-white"
                              value={row.label}
                              onChange={(e) => handleChange(item.work_item_id, idx, "material", e.target.value)}
                              placeholder="Type material"
                            />
                            <datalist id={`material-list-${item.work_item_id}-${idx}`}>
                              {materials
                                .filter(mat => mat.resource_id && mat.label)
                                .map(mat => (
                                  <option
                                    key={mat.resource_id}
                                    value={mat.label}
                                  />
                                ))}
                            </datalist>
                          </td>

                          <td className="px-4 py-4">
                            <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-2 py-1 rounded w-fit">
                              {row.brand || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-2 py-1 rounded w-fit">
                              {row.unitCode || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <input
                              type="number"
                              className="w-24 p-2 border rounded dark:bg-gray-700 dark:text-white"
                              value={row.multiplier}
                              onChange={(e) =>
                                handleChange(item.work_item_id, idx, "multiplier", e.target.value)
                              }
                              min={0}
                            />
                          </td>

                          <td className="px-4 py-4">{qto.toFixed(2)}</td>
                          <td className="px-4 py-4">{actualQty.toFixed(2)}</td>
                          <td className="px-4 py-4">₱{row.unit_cost?.toFixed(2)}</td>
                          <td className="px-4 py-4 font-bold text-right text-blue-700 dark:text-blue-300">
                            ₱{materialCost.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {rows.length > 1 && (
                              <button
                                onClick={() => handleRemoveRow(item.work_item_id, idx)}
                                className="text-red-500 hover:underline"
                              >
                                🗑
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => handleAddRow(item.work_item_id)}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                + Add Material
              </button>
            </div>
          );
        })
      )}

      <div className="border rounded-md p-6 bg-white dark:bg-gray-800 mt-8">
        <div className="flex justify-end items-center">
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            Grand Total Material Cost:{" "}
            <span className="text-purple-700 dark:text-purple-300">
              ₱{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MUCInputForm;