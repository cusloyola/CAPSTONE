import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

const calculateVolume = (length, width, depth, units = 1) => {
  const l = parseFloat(length);
  const w = parseFloat(width);
  const d = parseFloat(depth);
  const u = parseFloat(units);
  if (isNaN(l) || isNaN(w) || isNaN(d) || isNaN(u)) return 0;
  return parseFloat((l * w * d * u).toFixed(3)); // <== consistent rounding
};

const SimpleDimensionCard = ({ selectedItems, qtoDimensions, updateQtoDimensions }) => {
  // Use a local state for the dimensions within this component
  // Initialize from qtoDimensions prop passed by the parent (QtoDimensionInput)
const [dimensionsData, setDimensionsData] = useState({});


useEffect(() => {
  const initialData = {};
  const itemsNeedingUpdate = [];

  selectedItems.forEach(item => {
    const existing = qtoDimensions?.[item.work_item_id] || [];

    if (existing.length === 0 && (item.length || item.width || item.depth || item.units)) {
      const defaultRow = {
        id: uuidv4(),
        label: 'Default Entry',
        length: item.length || '',
        width: item.width || '',
        depth: item.depth || '',
        units: item.units || '1',
      };
      initialData[item.work_item_id] = [defaultRow];
      itemsNeedingUpdate.push({ itemId: item.work_item_id, rows: [defaultRow] });
    } else {
      initialData[item.work_item_id] = existing;
    }
  });

  setDimensionsData(initialData);

  // Inform parent *after* state is set (avoids update-during-render)
  itemsNeedingUpdate.forEach(({ itemId, rows }) => {
    updateQtoDimensions(itemId, rows);
  });
}, [selectedItems]);




  // This useEffect ensures that if the 'qtoDimensions' prop from the parent
  // changes externally (e.g., due to loading new data), this component's
  // internal 'dimensionsData' state is updated accordingly.
  // It uses a deep comparison to prevent unnecessary updates and potential loops.
  useEffect(() => {
  const newData = {};
  let shouldUpdate = false;

  selectedItems.forEach(item => {
    const id = item.work_item_id;
    const fromParent = qtoDimensions?.[id] || [];
    const fromLocal = dimensionsData[id] || [];

    if (JSON.stringify(fromParent) !== JSON.stringify(fromLocal)) {
      newData[id] = fromParent;
      shouldUpdate = true;
    }
  });

  if (shouldUpdate) {
    setDimensionsData(prev => ({
      ...prev,
      ...newData
    }));
  }
}, [qtoDimensions, selectedItems]);

  // Callback to add a new dimension row for a specific item
  const addRow = useCallback((itemId) => {
    setDimensionsData(prev => {
      const newDimensions = [...(prev[itemId] || []), {
        id: uuidv4(),
        label: '',
        length: '',
        width: '',
        depth: '',
        units: '1'
      }];
      // Immediately inform the parent about the updated dimensions for this item
      updateQtoDimensions(itemId, newDimensions);
      return {
        ...prev,
        [itemId]: newDimensions
      };
    });
  }, [updateQtoDimensions]); // Dependency: updateQtoDimensions function

  // Callback to remove a dimension row for a specific item
  const removeRow = useCallback((itemId, rowId) => {
    setDimensionsData(prev => {
      const newDimensions = prev[itemId]?.filter(row => row.id !== rowId) || [];
      // Immediately inform the parent about the updated dimensions for this item
      updateQtoDimensions(itemId, newDimensions);
      return {
        ...prev,
        [itemId]: newDimensions
      };
    });
  }, [updateQtoDimensions]); // Dependency: updateQtoDimensions function

  // Callback to handle changes in individual dimension fields
  const handleFieldChange = useCallback((itemId, rowId, fieldName, value) => {
    setDimensionsData(prev => {
      const newDimensions = prev[itemId]?.map(row =>
        row.id === rowId ? { ...row, [fieldName]: value } : row
      ) || [];
      // Immediately inform the parent about the updated dimensions for this item
      updateQtoDimensions(itemId, newDimensions);
      return {
        ...prev,
        [itemId]: newDimensions
      };
    });
  }, [updateQtoDimensions]); // Dependency: updateQtoDimensions function

  // Memoized function to calculate the total volume for a single item
  const calculateItemTotalVolume = useCallback((itemId) => {
    const total = (dimensionsData[itemId] || []).reduce(
      (sum, row) => sum + calculateVolume(row.length, row.width, row.depth, row.units),
      0
    );
    // console.log(`Item ${itemId} Total Volume:`, total.toFixed(3), 'm³'); // Uncomment for debugging
    return total;
  }, [dimensionsData]); // Dependency: dimensionsData state

  // Memoized value for the grand total volume across all items
  const totalVolumeAllItems = useMemo(() => {
    const grandTotal = Object.keys(dimensionsData).reduce(
      (sum, itemId) => sum + calculateItemTotalVolume(itemId),
      0
    );
    // console.log('Grand Total Volume:', grandTotal.toFixed(3), 'm³'); // Uncomment for debugging
    return grandTotal;
  }, [dimensionsData, calculateItemTotalVolume]); // Dependencies: dimensionsData and calculateItemTotalVolume

  // Helper function to check if a value is invalid (non-empty but not a positive number)
  const isInvalid = (val) => val !== '' && (isNaN(val) || parseFloat(val) < 0);

  return (
    <div className="space-y-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[450px] overflow-y-auto custom-scrollable-box">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Simple Dimension Input</h2>

      {/* Conditional rendering based on whether selectedItems has any simple dimension items */}
      {selectedItems.length === 0 ? (
        <p className="text-lg text-gray-500 dark:text-gray-400">No simple dimension items selected.</p>
      ) : (
        selectedItems.map(child => (
          <div key={child.work_item_id} className="border border-gray-200 rounded-xl shadow-md p-6 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 mb-6">
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
                    {["Label", "Length (m)", "Width (m)", "Depth (m)", "Units", "Volume (m³)"].map((text, i) => (
                      <th key={i} className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 ${text === "Volume (m³)" ? "text-right" : ""}`}>
                        {text}
                      </th>
                    ))}
                    <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                 {(dimensionsData[child.work_item_id] || []).length === 0 ? (
  <tr>
    <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
      No entries for this item. Click "Add Row".
    </td>
  </tr>
) : (
  (dimensionsData[child.work_item_id] || []).map(row => (

                      <tr key={row.id}>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={row.label}
                            onChange={(e) => handleFieldChange(child.work_item_id, row.id, 'label', e.target.value)}
                            className="w-32 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="e.g., Room A"
                          />
                        </td>
                        {["length", "width", "depth", "units"].map(field => (
                          <td key={field} className="px-4 py-4">
                            <input
                              type="number"
                              value={row[field]}
                              onChange={(e) => handleFieldChange(child.work_item_id, row.id, field, e.target.value)}
                              className={`w-24 p-2 border ${isInvalid(row[field]) ? "border-red-500" : "border-gray-300"} rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                              min="0"
                              step="any"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-4 text-right text-sm text-gray-700 dark:text-gray-200 font-semibold">
                          {calculateVolume(row.length, row.width, row.depth, row.units).toFixed(3)} m³
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => removeRow(child.work_item_id, row.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                + Add Row
              </button>
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                Item Total Volume: <span className="text-blue-700 dark:text-blue-300">{calculateItemTotalVolume(child.work_item_id).toFixed(3)} m³</span>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Grand Total Volume */}
      <div className="text-xl font-bold text-right mt-2 text-green-700 dark:text-green-400">
        Grand Total Volume: {totalVolumeAllItems.toFixed(3)} m³
      </div>
    </div>
  );
};

export default SimpleDimensionCard;