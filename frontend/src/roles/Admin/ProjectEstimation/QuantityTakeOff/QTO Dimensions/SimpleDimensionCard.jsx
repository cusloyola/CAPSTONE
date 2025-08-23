import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const calculateVolume = (length, width, depth, count) => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const d = parseFloat(depth);
    const c = parseFloat(count) || 1;

    if (d === null || isNaN(d) || d === 0) {
        return l * w * c;
    }

    return l * w * d * c;
};


const SimpleDimensionCard = ({
    selectedItems = [],
    parent = {},
    updateChildDimensions
}) => {

    const pendingUpdatesRef = useRef({});

    const [dimensionsData, setDimensionsData] = useState(() => {
        const initial = {};
        selectedItems.forEach(item => {
            const itemId = item.work_item_id;
            const existing = parent.children?.find(child => child.work_item_id === itemId)?.simple_item_dimensions || [];

            initial[itemId] = existing.length === 0 && (item.length || item.width || item.depth || item.units)
                ? [{
                    id: uuidv4(),
                    label: 'Default Entry',
                    length: item.length || '',
                    width: item.width || '',
                    depth: item.depth || '',
                    count: item.units || '1'
                }]
                : existing;
        });
        return initial;
    });





    const addRow = useCallback((itemId) => {
        console.log(`➕ Adding row for item: ${itemId}`);
        setDimensionsData(prev => {
            const newRow = {
                id: uuidv4(),
                label: '',
                length: '',
                width: '',
                depth: '',
                count: '1'
            };

            const currentItemDimensions = prev[itemId] || [];

            const updated = {
                ...prev,
                [itemId]: [...currentItemDimensions, newRow]
            };

            console.log("📦 Updated dimensionsData after addRow:", updated);
            return updated;
        });
    }, []);


    const removeRow = useCallback((itemId, rowId) => {
        setDimensionsData(prev => {
            const updatedRows = (prev[itemId] || []).filter(row => row.id !== rowId);
            return {
                ...prev,
                [itemId]: updatedRows
            };
        });
    }, []);

    const handleFieldChange = useCallback((itemId, rowId, fieldName, value) => {
        setDimensionsData(prev => {
            const updatedRows = (prev[itemId] || []).map(row =>
row.id === rowId ? { ...row, [fieldName]: value === '' ? null : value } : row
            );

            // store it for syncing in next render
            pendingUpdatesRef.current[itemId] = updatedRows;

            return {
                ...prev,
                [itemId]: updatedRows
            };
        });
    }, []);

    useEffect(() => {
        const pending = pendingUpdatesRef.current;
        if (Object.keys(pending).length > 0) {
            for (const [itemId, updatedRows] of Object.entries(pending)) {
                updateChildDimensions({ work_item_id: itemId }, { [itemId]: updatedRows });
            }
            pendingUpdatesRef.current = {}; // clear it
        }
    }, [dimensionsData]); // runs after dimensionsData update


    const calculateItemTotalVolume = useCallback((itemId) => {
        return (dimensionsData[itemId] || []).reduce(
            (sum, row) => sum + calculateVolume(row.length, row.width, row.depth, row.count),
            0
        );
    }, [dimensionsData]);

    const totalVolumeAllItems = useMemo(() => {
        return Object.keys(dimensionsData).reduce(
            (sum, itemId) => sum + calculateItemTotalVolume(itemId),
            0
        );
    }, [dimensionsData, calculateItemTotalVolume]);

const isInvalid = (val) => val !== '' && isNaN(parseFloat(val));

    useEffect(() => {
        console.log("🧮 SimpleDimensionCard - initial selectedItems:", selectedItems);
    }, [selectedItems]);

    useEffect(() => {
        console.log("📤 SimpleDimensionCard sending dimensionsData...");
    }, [/* trigger when updating */]);

    const onChange = (newDimensions) => {
        const dimensionsData = {
            [item.work_item_id]: newDimensions  // should be something like {119: [...]}
        };

        console.log("📤 Sending from SimpleDimensionCard:", dimensionsData);
        updateChildDimensions(item, dimensionsData);
    };


    return (
        <div className="space-y-8 p-4 bg-white dark:bg-gray-800  max-h-[450px] overflow-y-auto custom-scrollable-box">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Simple Item Dimensions</h3>

            {selectedItems.length === 0 ? (
                <p className="text-lg text-gray-500 dark:text-gray-400">No simple dimension items selected. Please select at least one item with 'simple' compute type.</p>
            ) : (
                selectedItems.map(item => (
                    <div
                        key={item.work_item_id}
                        className="border border-gray-200 rounded-xl shadow-inner p-6 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 mb-6"
                    >
                        <h4 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-400">
                            Item: {item.item_title || item.name || "Unnamed Item"}
                        </h4>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-600">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Label</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Width</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Length</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Depth</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Count</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Volume (m³)</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y dark:bg-gray-800 dark:divide-gray-700">
                                    {(dimensionsData[item.work_item_id] || []).map(row => (
                                        <tr key={row.id}>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    value={row.label}
                                                    onChange={(e) => handleFieldChange(item.work_item_id, row.id, 'label', e.target.value)}
                                                    className="w-32 p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                                                />
                                            </td>
                                            {['width', 'length', 'depth', 'count'].map(field => (
                                                <td key={field} className="px-4 py-4 whitespace-nowrap">
                                                    <input
                                                        type="number"
                                                        value={row[field]}
                                                        onChange={(e) => handleFieldChange(item.work_item_id, row.id, field, e.target.value)}
                                                        className={`w-24 p-2 border ${isInvalid(row[field]) ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm dark:bg-gray-700 dark:text-white`}
                                                        min="0"
                                                        step="any"
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-4 py-4 text-right text-sm text-gray-700 dark:text-white">
                                                {calculateVolume(row.length, row.width, row.depth, row.count).toFixed(3)} m³
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => removeRow(item.work_item_id, row.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(dimensionsData[item.work_item_id] || []).length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No entries for this item. Click "Add Row" below.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <button
                                onClick={() => addRow(item.work_item_id)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                            >
                                + Add Row
                            </button>
                            <div className="text-lg font-bold text-gray-800 dark:text-white">
                                Item Total Volume:{" "}
                                <span className="text-blue-700 dark:text-blue-300">
                                    {calculateItemTotalVolume(item.work_item_id).toFixed(3)} m³
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-6 bg-white dark:bg-gray-800 mt-8">
                <div className="flex justify-end items-center">
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                        Grand Total Volume:{" "}
                        <span className="text-purple-700 dark:text-purple-300">
                            {totalVolumeAllItems.toFixed(3)} m³
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleDimensionCard;
