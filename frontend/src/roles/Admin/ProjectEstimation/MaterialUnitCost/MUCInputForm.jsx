import React, { useState } from "react";

const MUCInputForm = ({ selectedItems, onUpdateItems }) => {
  const [materials] = useState([
    { material_name: "Cement", brands: ["Holcim", "Republic"], defaultQtyPerQto: 8 },
    { material_name: "Sand", brands: ["Washed"], defaultQtyPerQto: 0.5 },
    { material_name: "Gravel", brands: ["Crushed"], defaultQtyPerQto: 1 }
  ]);

  const [brandPrices] = useState({
    Holcim: 250,
    Republic: 240,
    Washed: 850,
    Crushed: 900
  });

  const [formState, setFormState] = useState(() => {
    const initial = {};
    selectedItems.forEach(item => {
      initial[item.work_item_id] = [
        {
          material: "",
          brand: "",
          qtyPerQto: 1,
          unit_cost: 0
        }
      ];
    });
    return initial;
  });

  const handleChange = (itemId, index, field, value) => {
    const updated = [...(formState[itemId] || [])];
    const row = { ...updated[index], [field]: value };

    if (field === "material") {
      const defaultQty = materials.find(m => m.material_name === value)?.defaultQtyPerQto || 1;
      row.qtyPerQto = defaultQty;
      row.brand = "";
      row.unit_cost = 0;
    }

    if (field === "brand") {
      row.unit_cost = brandPrices[value] || 0;
    }

    updated[index] = row;
    setFormState(prev => ({ ...prev, [itemId]: updated }));
  };

  const handleAddRow = (itemId) => {
    setFormState(prev => ({
      ...prev,
      [itemId]: [
        ...(prev[itemId] || []),
        { material: "", brand: "", qtyPerQto: 1, unit_cost: 0 }
      ]
    }));
  };

  const handleRemoveRow = (itemId, index) => {
    const updated = [...formState[itemId]];
    updated.splice(index, 1);
    setFormState(prev => ({ ...prev, [itemId]: updated }));
  };

  const computeRowCost = (qto, qtyPerQto, unit_cost) => {
    return qto * qtyPerQto * unit_cost;
  };

  const grandTotal = selectedItems.reduce((sum, item) => {
    const qto = typeof item.total_volume === "number" ? item.total_volume : 0;
    const rows = formState[item.work_item_id] || [];
    return sum + rows.reduce((s, row) => s + computeRowCost(qto, row.qtyPerQto, row.unit_cost), 0);
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
                Item: {item.item_title || "Unnamed"} (QTO: {qto})
              </h4>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Brand</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Qty/Cu.m</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Work Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Actual Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Unit Cost (₱)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Material Cost (₱)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
                    {rows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-4">
                          <select
                            className="p-2 w-36 border rounded dark:bg-gray-700 dark:text-white"
                            value={row.material}
                            onChange={(e) => handleChange(item.work_item_id, idx, "material", e.target.value)}
                          >
                            <option value="">Select material</option>
                            {materials.map(mat => (
                              <option key={mat.material_name} value={mat.material_name}>
                                {mat.material_name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-4">
                          <select
                            className="p-2 w-32 border rounded dark:bg-gray-700 dark:text-white"
                            value={row.brand}
                            onChange={(e) => handleChange(item.work_item_id, idx, "brand", e.target.value)}
                          >
                            <option value="">Select brand</option>
                            {(materials.find(m => m.material_name === row.material)?.brands || []).map(brand => (
                              <option key={brand} value={brand}>
                                {brand} - ₱{brandPrices[brand]}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-4">cu.m</td>

                        <td className="px-4 py-4">
                          <input
                            type="number"
                            className="w-24 p-2 border rounded dark:bg-gray-700 dark:text-white"
                            value={row.qtyPerQto}
                            onChange={(e) => handleChange(item.work_item_id, idx, "qtyPerQto", parseFloat(e.target.value))}
                            min={0}
                          />
                        </td>

                        <td className="px-4 py-4">{qto}</td>

                        <td className="px-4 py-4">{(qto * row.qtyPerQto).toFixed(2)}</td>

                        <td className="px-4 py-4">₱{row.unit_cost?.toFixed(2) || "0.00"}</td>

                        <td className="px-4 py-4 font-bold text-right text-blue-700 dark:text-blue-300">
                          ₱{computeRowCost(qto, row.qtyPerQto, row.unit_cost).toFixed(2)}
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
                    ))}
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
            Grand Total Material Cost: {" "}
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
