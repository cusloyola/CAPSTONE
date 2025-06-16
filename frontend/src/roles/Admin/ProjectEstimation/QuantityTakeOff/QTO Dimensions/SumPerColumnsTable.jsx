// SimpleDimensionCard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For unique row IDs

// Helper function to calculate volume for a single row
const calculateVolume = (length, width, depth, units = 1) => {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const d = parseFloat(depth);
  const u = parseFloat(units);
  // Ensure we return 0 if any essential input is not a valid number
  if (isNaN(l) || isNaN(w) || isNaN(d) || isNaN(u)) {
    return 0;
  }
  return (l * w * d * u);
};

const SimpleDimensionCard = ({ selectedItems, updateChildDimensions, parent }) => {
  // Main state: Maps work_item_id to an array of dimension rows
  // Structure: { [work_item_id]: [{ id: 'uuid', label: '', length: '', width: '', depth: '', units: '' }, ...] }
  const [dimensionsData, setDimensionsData] = useState(() => {
    const initialData = {};
    selectedItems
      .filter(child => child.compute_type !== "sum_per_columns" && child.compute_type !== "sum_per_floors" && child.compute_type !== "custom")
      .forEach(item => {
        // Initialize with existing dimensions or an empty array
        // We'll convert existing single dimensions into a single row
        if (item.simple_item_dimensions && item.simple_item_dimensions.length > 0) {
            initialData[item.work_item_id] = item.simple_item_dimensions;
        } else if (item.length || item.width || item.depth || item.units) {
            // If old single dimensions exist, convert them to a single row
            initialData[item.work_item_id] = [{
                id: uuidv4(),
                label: 'Default Entry', // Provide a default label for converted old data
                length: item.length || '',
                width: item.width || '',
                depth: item.depth || '',
                units: item.units || '1'
            }];
        } else {
            initialData[item.work_item_id] = [];
        }
      });
    return initialData;
  });

  // Function to add a new row for a specific item
  const addRow = useCallback((itemId) => {
    setDimensionsData(prevData => {
      const newRow = { id: uuidv4(), label: '', length: '', width: '', depth: '', units: '1' };
      const updatedItemRows = [
        ...(prevData[itemId] || []),
        newRow
      ];

      return {
        ...prevData,
        [itemId]: updatedItemRows
      };
    });
  }, []);

  // Function to remove a row for a specific item
  const removeRow = useCallback((itemId, rowIdToRemove) => {
    setDimensionsData(prevData => {
      const updatedItemRows = (prevData[itemId] || []).filter(row => row.id !== rowIdToRemove);

      return {
        ...prevData,
        [itemId]: updatedItemRows
      };
    });
  }, []);

  // Function to handle changes in input fields for a specific row
  const handleFieldChange = useCallback((itemId, rowId, fieldName, value) => {
    setDimensionsData(prevData => {
      const updatedItemRows = (prevData[itemId] || []).map(row =>
        row.id === rowId ? { ...row, [fieldName]: value } : row
      );

      return {
        ...prevData,
        [itemId]: updatedItemRows
      };
    });
  }, []);

  // Memoized function to calculate total volume for a single item (sum of all its rows)
  const calculateItemTotalVolume = useCallback((itemId) => {
    const dimensionsForItem = dimensionsData[itemId] || [];
    return dimensionsForItem.reduce((sum, row) => sum + calculateVolume(row.length, row.width, row.depth, row.units), 0);
  }, [dimensionsData]);


  // Effect to propagate state changes up to parent
  useEffect(() => {
    const updatedParent = JSON.parse(JSON.stringify(parent));

    updatedParent.children = updatedParent.children?.map(child => {
      if (child.compute_type !== "sum_per_columns" && child.compute_type !== "sum_per_floors" && child.compute_type !== "custom" && dimensionsData[child.work_item_id]) {
        return {
          ...child,
          simple_item_dimensions: dimensionsData[child.work_item_id],
          // Optionally, clear old fields if you're fully transitioning to simple_item_dimensions
          length: undefined,
          width: undefined,
          depth: undefined,
          units: undefined,
        };
      }
      return child;
    });

    // If the parent itself is a 'simple' item and checked (e.g., a top-level work item)
    // This part assumes a parent can also be a 'simple' type and have its own dimensions
    if (parent.checked && (parent.compute_type === undefined || (parent.compute_type !== "sum_per_columns" && parent.compute_type !== "sum_per_floors" && parent.compute_type !== "custom")) && dimensionsData[parent.work_item_id]) {
        updatedParent.simple_item_dimensions = dimensionsData[parent.work_item_id];
        // Optionally, clear old fields if you're fully transitioning
        updatedParent.length = undefined;
        updatedParent.width = undefined;
        updatedParent.depth = undefined;
        updatedParent.units = undefined;
    }


    updateChildDimensions(updatedParent);
  }, [dimensionsData, updateChildDimensions, parent, selectedItems]);


  return (
    <div className="space-y-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[450px] overflow-y-auto custom-scrollable-box">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Simple Dimension Input</h2>
      {selectedItems.filter(child => child.compute_type !== "sum_per_columns" && child.compute_type !== "sum_per_floors" && child.compute_type !== "custom").length === 0 ? (
        <p className="text-lg text-gray-500 dark:text-gray-400">No simple dimension items selected. Select items with 'simple' or no compute type defined.</p>
      ) : (
        selectedItems
          .filter(child => child.compute_type !== "sum_per_columns" && child.compute_type !== "sum_per_floors" && child.compute_type !== "custom")
          .map(child => (
            <div
              key={child.work_item_id}
              className="border border-gray-200 rounded-xl shadow-md p-6 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {child.item_title || child.name || "Unnamed Item"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Code: {child.code || "N/A"} • Unit: {child.unit || "unit"}
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Label
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Length (m)
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Width (m)
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Depth (m)
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Units
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Volume (m³)
                      </th>
                      <th scope="col" className="relative px-4 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {dimensionsData[child.work_item_id]?.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                          No entries for this item. Click "Add Row" below.
                        </td>
                      </tr>
                    ) : (
                      dimensionsData[child.work_item_id]?.map(row => (
                        <tr key={row.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <input
                              type="text"
                              value={row.label}
                              onChange={(e) => handleFieldChange(child.work_item_id, row.id, 'label', e.target.value)}
                              className="w-32 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., Section A, Room 1"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={row.length}
                              onChange={(e) => handleFieldChange(child.work_item_id, row.id, 'length', e.target.value)}
                              className="w-24 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                              step="any"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={row.width}
                              onChange={(e) => handleFieldChange(child.work_item_id, row.id, 'width', e.target.value)}
                              className="w-24 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                              step="any"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={row.depth}
                              onChange={(e) => handleFieldChange(child.work_item_id, row.id, 'depth', e.target.value)}
                              className="w-24 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                              step="any"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={row.units}
                              onChange={(e) => handleFieldChange(child.work_item_id, row.id, 'units', e.target.value)}
                              className="w-20 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                              min="1"
                              step="1"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-200 font-semibold">
                            {calculateVolume(row.length, row.width, row.depth, row.units).toFixed(3)} m³
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => removeRow(child.work_item_id, row.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                              title="Remove Row"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => addRow(child.work_item_id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 text-sm"
                >
                  + Add Row
                </button>
                <div className="text-lg font-bold text-gray-800 dark:text-white">
                  Item Total Volume:{" "}
                  <span className="text-blue-700 dark:text-blue-300">
                    {calculateItemTotalVolume(child.work_item_id).toFixed(3)} m³
                  </span>
                </div>
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default SimpleDimensionCard;