// QTO Dimensions/CustomVolumeInput.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For unique row IDs



const CustomVolumeInput = ({
  selectedItems = [], // Items from parent with compute_type: 'custom'
  updateChildDimensions = () => { }, // Function to update the main parent object
  parent, // The full parent object from the context
  floors = [] // Array of floor objects
}) => {


  const [customDimensionsData, setCustomDimensionsData] = useState({});
  const lastSerializedDataRef = useRef('');



  // Helper function to calculate volume for a single row
  const calculateVolume = (length, width, depth, count) => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const d = parseFloat(depth) || 0;
    const c = parseFloat(count) || 0;
    return l * w * d * c;
  };

  const calculateItemFloorTotalVolume = (itemId, floorId) => {
    const rows = customDimensionsData[itemId]?.[floorId] || [];
    return rows.reduce((total, row) => total + calculateVolume(row.length, row.width, row.depth, row.count), 0);
  };


  const totalProjectCustomVolume = useMemo(() => {
    let total = 0;
    Object.keys(customDimensionsData).forEach(itemId => {
      Object.keys(customDimensionsData[itemId] || {}).forEach(floorId => {
        const rows = customDimensionsData[itemId][floorId] || [];
        rows.forEach(row => {
          total += calculateVolume(row.length, row.width, row.depth, row.count);
        });
      });
    });
    return total;
  }, [customDimensionsData]);



  // State for the currently active floor tab
  const [activeFloorId, setActiveFloorId] = useState(floors[0]?.floor_id || null);

  // Effect to set the initial active floor when floors prop is available
  useEffect(() => {
    if (floors.length > 0 && activeFloorId === null) {
      setActiveFloorId(floors[0].floor_id);
    }
  }, [floors, activeFloorId]);


  const addRow = (itemId) => {
    setCustomDimensionsData(prev => {
      const newRow = {
        id: Date.now(), // or uuid
        label: '',
        length: '',
        width: '',
        depth: '',
        count: 1
      };

      const existing = prev[itemId]?.[activeFloorId] || [];

      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [activeFloorId]: [...existing, newRow]
        }
      };
    });
  };


  const removeRow = (itemId, rowId) => {
    setCustomDimensionsData(prev => {
      const filteredRows = (prev[itemId]?.[activeFloorId] || []).filter(row => row.id !== rowId);

      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [activeFloorId]: filteredRows
        }
      };
    });
  };

  const handleFieldChange = (itemId, rowId, field, value) => {
    setCustomDimensionsData(prev => {
      const updated = (prev[itemId]?.[activeFloorId] || []).map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            [field]: field === "label" ? value : parseFloat(value) || 0
          };
        }
        return row;
      });

      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [activeFloorId]: updated
        }
      };
    });
  };
  useEffect(() => {
    const updatedParent = JSON.parse(JSON.stringify(parent));

    // Update custom dimensions for children
    updatedParent.children = updatedParent.children?.map(child => {
      if (child.compute_type === 'custom' && customDimensionsData[child.work_item_id]) {
        return {
          ...child,
          custom_item_dimensions_by_floor: customDimensionsData[child.work_item_id],
        };
      }
      return child;
    });

    // If parent itself is a custom item
    if (
      parent.compute_type === 'custom' &&
      parent.checked &&
      customDimensionsData[parent.work_item_id]
    ) {
      updatedParent.custom_item_dimensions_by_floor = customDimensionsData[parent.work_item_id];
    }

    // Serialize and compare
    const serialized = JSON.stringify(updatedParent);
    if (lastSerializedDataRef.current !== serialized) {
      lastSerializedDataRef.current = serialized;
      console.log("📦 [CustomVolumeInput] Sending customDimensionsData:", customDimensionsData);

updateChildDimensions(updatedParent, customDimensionsData); // Now synced!
    }
  }, [customDimensionsData, updateChildDimensions]);

  return (

    <div className="space-y-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[450px] overflow-y-auto custom-scrollable-box">
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Custom Item Dimensions</h3>

      {floors.length === 0 ? (
        <p className="text-lg text-gray-500 dark:text-gray-400">No floors found for this project. Please ensure floors are defined for the project.</p>
      ) : (
        <>
          {/* Floor Selection Buttons (Tabs) - Horizontal scrolling if many floors */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto no-scrollbar">
            {floors.map(floor => (
              <button
                key={floor.floor_id}
                onClick={() => setActiveFloorId(floor.floor_id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap
                  ${activeFloorId === floor.floor_id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                `}
              >
                {floor.floor_label || floor.floor_code || `Floor ${floor.floor_id}`}
              </button>
            ))}
          </div>

          {/* Render content for each selected 'custom' item */}
          {selectedItems.length === 0 && (
            <p className="text-lg text-gray-500 dark:text-gray-400">No custom items selected from the sub-scope. Please select at least one item with 'custom' compute type.</p>
          )}

          {activeFloorId && selectedItems.length > 0 && (
            selectedItems.map(item => (
              <div
                key={`${item.work_item_id}-${activeFloorId}`} // Unique key for item and floor
                className="border border-gray-200 rounded-xl shadow-inner p-6 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 mb-6"
              >
                <h4 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-400">
                  Item: {item.item_title}
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    ({floors.find(f => f.floor_id === activeFloorId)?.floor_label || floors.find(f => f.floor_id === activeFloorId)?.floor_code || `Floor ID: ${activeFloorId}`})
                  </span>
                </h4>

                {/* Table for dimensions - Horizontal scroll if table is too wide */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-600">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Item Label
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
                          Count
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
                      {(customDimensionsData[item.work_item_id]?.[activeFloorId]?.length === 0) ? (
                        <tr>
                          <td colSpan="7" className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                            No custom entries for this item on this floor. Click "Add Row" below.
                          </td>
                        </tr>
                      ) : (
                        customDimensionsData[item.work_item_id]?.[activeFloorId]?.map(row => (
                          <tr key={row.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              <input
                                type="text"
                                value={row.label}
                                onChange={(e) => handleFieldChange(item.work_item_id, row.id, 'label', e.target.value)}
                                className="w-32 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Area 1, Wall 2"
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={row.length}
                                onChange={(e) => handleFieldChange(item.work_item_id, row.id, 'length', e.target.value)}
                                className="w-24 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                                step="any"
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={row.width}
                                onChange={(e) => handleFieldChange(item.work_item_id, row.id, 'width', e.target.value)}
                                className="w-24 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                                step="any"
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={row.depth}
                                onChange={(e) => handleFieldChange(item.work_item_id, row.id, 'depth', e.target.value)}
                                className="w-24 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                                step="any"
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={row.count}
                                onChange={(e) => handleFieldChange(item.work_item_id, row.id, 'count', e.target.value)}
                                className="w-20 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                step="1"
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-200 font-semibold">
                              {calculateVolume(row.length, row.width, row.depth, row.count).toFixed(3)} m³
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => removeRow(item.work_item_id, row.id)}
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
                    onClick={() => addRow(item.work_item_id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150 text-sm"
                  >
                    + Add Row
                  </button>
                  <div className="text-lg font-bold text-gray-800 dark:text-white">
                    Item Total for Floor:{" "}
                    <span className="text-blue-700 dark:text-blue-300">
                      {calculateItemFloorTotalVolume(item.work_item_id, activeFloorId).toFixed(3)} m³
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Grand Total for the entire project */}
      <div className="border border-gray-200 rounded-xl shadow-md p-6 bg-white dark:bg-gray-800 dark:border-gray-700 mt-8">
        <div className="flex justify-end items-center">
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            Grand Total Custom Volume:{" "}
            <span className="text-purple-700 dark:text-purple-300">
              {totalProjectCustomVolume.toFixed(3)} m³
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVolumeInput;