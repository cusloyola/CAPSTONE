import React from "react";

const SumPerFloorsCards = ({ selectedItems, floors, updateChildDimensions, parent, onBack }) => {
  const updateChildFloorDimension = (itemId, floorCode, dimension, value) => {
    const updatedChildren = parent.children.map(child => {
      if (child.work_item_id === itemId) {
        const dimsPerKey = typeof child.dimensionsPerFloor === 'object' && child.dimensionsPerFloor !== null
          ? { ...child.dimensionsPerFloor }
          : {};

        dimsPerKey[floorCode] = {
          ...dimsPerKey[floorCode],
          [dimension]: value,
        };

        return {
          ...child,
          dimensionsPerFloor: dimsPerKey,
        };
      }
      return child;
    });

    const updatedParentWithDims = { ...parent, children: updatedChildren };
    updateChildDimensions(updatedParentWithDims);
  };

  return (
    <div className="max-h-[45vh] overflow-y-auto space-y-6 pr-2"> {/* Scrollable container */}
      {selectedItems
        .filter(child => child.compute_type === "sum_per_floors")
        .map(child => {
          let totalVolume = 0;
          const dims = child.dimensionsPerFloor || {};
          floors.forEach(floor => {
            const floorDim = dims[floor.floor_code] || {};
            const l = Number(floorDim.length) || 0;
            const w = Number(floorDim.width) || 0;
            const d = Number(floorDim.depth) || 0;
            const u = Number(floorDim.units) || 1;
            totalVolume += l * w * d * u;
          });

          return (
            <div
              key={child.work_item_id}
              className="border border-gray-200 rounded-xl shadow-md p-6 bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {child.item_title || child.name || "Unnamed Item"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Code: {child.code || "N/A"} • Unit: {child.unit || "unit"}
                </p>
                {floors.length > 1 && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Volume calculated per floor and summed.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {floors.map(floor => {
                  const floorCode = floor.floor_code;
                  const floorDim = (child.dimensionsPerFloor && child.dimensionsPerFloor[floorCode]) || {
                    length: "",
                    width: "",
                    depth: "",
                    units: "1",
                  };
                  return (
                    <div
                      key={floorCode}
                      className="border border-gray-100 p-4 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Floor: {floor.floor_name || floorCode} ({floorCode})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {["length", "width", "depth", "units"].map(field => (
                          <div key={field}>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                            </label>
                            <input
                              type="number"
                              value={floorDim[field] ?? ""}
                              min="0"
                              step="any"
                              onChange={e =>
                                updateChildFloorDimension(child.work_item_id, floorCode, field, e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-sm text-gray-700 dark:text-gray-200">
                <strong>Calculated Volume:</strong>{" "}
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  {totalVolume.toFixed(2)} m³
                </span>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default SumPerFloorsCards;
