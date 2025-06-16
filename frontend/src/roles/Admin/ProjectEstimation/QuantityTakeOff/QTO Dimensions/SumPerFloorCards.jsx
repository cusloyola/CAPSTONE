import React from "react";

const SumPerFloorsCards = ({ selectedItems, floors, updateChildDimensions, parent }) => {
const updateChildFloorDimension = (itemId, floorCode, field, value) => {
  const floor = floors.find(f => f.floor_code === floorCode); // ✅ find the matching floor
  const floor_id = floor?.floor_id || null;

  const updatedChildren = parent.children.map(child => {
    if (child.work_item_id !== itemId) return child;

    const dims = { ...(child.dimensionsPerFloor || {}) };
    const existing = dims[floorCode] || {
      floor_id, // ✅ include floor_id
      length: "",
      width: "",
      depth: "",
      units: "1",
      calculated_value: 0
    };

    const updated = {
      ...existing,
      [field]: value,
      floor_id // ✅ always set/overwrite floor_id
    };

    const l = parseFloat(updated.length);
    const w = parseFloat(updated.width);
    const d = parseFloat(updated.depth);
    const u = parseFloat(updated.units);

    updated.calculated_value =
      (!isNaN(l) && l >= 0 ? l : 0) *
      (!isNaN(w) && w >= 0 ? w : 0) *
      (!isNaN(d) && d >= 0 ? d : 0) *
      (!isNaN(u) && u >= 0 ? u : 1);

    dims[floorCode] = updated;

    return { ...child, dimensionsPerFloor: dims };
  });

  updateChildDimensions({ ...parent, children: updatedChildren });
};




  return (
    <div className="max-h-[45vh] overflow-y-auto space-y-6 pr-2">
      {selectedItems
        .filter(c => c.compute_type === "sum_per_floors")
        .map(child => {
          const dims = child.dimensionsPerFloor || {};
          const totalVolume = floors.reduce(
            (sum, f) => sum + (parseFloat(dims[f.floor_code]?.calculated_value) || 0),
            0
          );
          return (
            <div key={child.work_item_id} className="border p-6 rounded-lg bg-white dark:bg-gray-800 shadow">
              <h3 className="text-lg font-semibold">{child.item_title}</h3>
              <p className="text-sm text-gray-500">
                Code: {child.code || "N/A"} • Unit: {child.unit || "-"}
              </p>
              <div className="space-y-4 mt-4">
                {floors.map(floor => {
                  const floorDim = dims[floor.floor_code] || { length: "", width: "", depth: "", units: "1", calculated_value: 0 };
                  return (
                    <div key={floor.floor_code} className="border rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                      <h4 className="font-semibold">{floor.floor_code}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                        {["length", "width", "depth", "units"].map(field => (
                          <div key={field}>
                            <label className="text-sm font-medium block capitalize">{field}</label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={floorDim[field] ?? ""}
                              onKeyDown={e => e.key === "-" && e.preventDefault()}
                              onChange={e =>
                                updateChildFloorDimension(
                                  child.work_item_id,
                                  floor.floor_code,
                                  field,
                                  e.target.value
                                )
                              }
                              className="border p-1 rounded w-full"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-sm">
                        Volume: <span className="font-semibold text-blue-700">{floorDim.calculated_value.toFixed(2)} m³</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-base font-bold">
                Total Volume: <span className="text-green-600">{totalVolume.toFixed(2)} m³</span>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default SumPerFloorsCards;
