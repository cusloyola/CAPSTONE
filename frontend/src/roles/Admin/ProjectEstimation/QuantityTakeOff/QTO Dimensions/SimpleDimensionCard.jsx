// SimpleDimensionCard.jsx
import React from "react";

const SimpleDimensionCard = ({ selectedItems, updateChildDimensions, parent }) => {
  const updateSimpleChildDimension = (childId, dimension, value) => {
    const updatedChildren = parent.children.map(child => {
      if (child.work_item_id === childId) {
        return {
          ...child,
          [dimension]: value,
        };
      }
      return child;
    });
    // Pass the entire updated parent object up
    const updatedParent = { ...parent, children: updatedChildren };
    updateChildDimensions(updatedParent);
  };

  return (
    <>
      {selectedItems
        .filter(child => child.compute_type !== "sum_per_columns" && child.compute_type !== "sum_per_floors" && child.compute_type !== "custom")
        .map(child => {
          const length = Number(child.length) || 0;
          const width = Number(child.width) || 0;
          const depth = Number(child.depth) || 0;
          const units = Number(child.units) || 1;
          const totalVolume = length * width * depth * units;

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {["length", "width", "depth", "units"].map(field => (
                  <div key={field}>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type="number"
                      value={child[field] ?? ""}
                      min="0"
                      step="any"
                      onChange={e =>
                        updateSimpleChildDimension(child.work_item_id, field, e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
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
    </>
  );
};

export default SimpleDimensionCard;