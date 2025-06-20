import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

const SimpleRebarDimensions = ({
  rebarOptions,
  itemTitle,
  onRowsChange,
  work_item_id, // ✅ you only need to destructure once
}) => {


    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (onRowsChange) {
            onRowsChange(rows);
        }
    }, [rows, onRowsChange]);


    const handleAddSimpleRebarRow = () => {
        const newBlankRow = {
            id: uuidv4(),
            rebar_masterlist_id: "",
            diameter_mm: "",
            length_m: "",
            quantity: "",
            weight_per_meter: "",
            total_weight: 0,
            location: "",
      work_item_id: work_item_id, // ✅ include it

        };
        setRows(prevRows => [...prevRows, newBlankRow]);
    };

    const handleRemoveSimpleRebarRow = (rowIdToRemove) => {
        setRows(prevRows => prevRows.filter(row => row.id !== rowIdToRemove));
    };

    const handleSimpleRebarChange = (rowId, selectedId) => {
        const selectedRebar = rebarOptions.find(opt => opt.rebar_masterlist_id === parseInt(selectedId));
        if (!selectedRebar) return;

        setRows(prevRows => prevRows.map(row => {
            if (row.id === rowId) {
                const quantity = parseFloat(row.quantity) || 0;
                const newTotalWeight =
                    (parseFloat(selectedRebar.weight_per_meter) || 0) *
                    (parseFloat(selectedRebar.length_m) || 0) *
                    quantity;

                return {
                    ...row,
                    rebar_masterlist_id: selectedRebar.rebar_masterlist_id,
                    diameter_mm: selectedRebar.diameter_mm,
                    length_m: selectedRebar.length_m,
                    weight_per_meter: selectedRebar.weight_per_meter,
                    total_weight: newTotalWeight,
                };
            }
            return row;
        }));
    };

    const handleSimpleRebarQuantityChange = (rowId, value) => {
        const newQuantity = parseFloat(value) || 0;

        setRows(prevRows => prevRows.map(row => {
            if (row.id === rowId) {
                const newTotalWeight =
                    (parseFloat(row.weight_per_meter) || 0) *
                    (parseFloat(row.length_m) || 0) *
                    newQuantity;

                return {
                    ...row,
                    quantity: newQuantity,
                    total_weight: newTotalWeight,
                };
            }
            return row;
        }));
    };

    return (
        <div className="space-y-8 p-4 bg-red dark:bg-gray-800 shadow-md rounded-lg max-h-[450px] overflow-y-auto custom-scrollable-box" >
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Simple Item Rebar </h3>

            <div className="border border-gray-200 rounded-xl shadow-inner p-6 bg-gray-50 dark:bg-gray-700 dark:border-gray-700 mb-6">
                <h4 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-400">
                    Item: {itemTitle || "Unnamed Item"}
                </h4>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Rebar</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Diameter</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Length</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Weight</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Action</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y dark:bg-gray-800 dark:divide-gray-700">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            No rows yet. Click '+ Add Row' to get started!
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                rows.map(row => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <select
                                                value={row.rebar_masterlist_id || ""}
                                                onChange={e => handleSimpleRebarChange(row.id, e.target.value)}
                                                className="w-full rounded-lg"
                                            >
                                                <option value="">Select Rebar</option>
                                                {rebarOptions && rebarOptions.map(opt => (
                                                    <option key={opt.rebar_masterlist_id} value={opt.rebar_masterlist_id}>
                                                        {`${opt.label || 'Unknown Type'} - ${opt.diameter_mm || 'N/A'}mm x ${opt.length_m || 'N/A'}m (${opt.weight_per_meter || 'N/A'} kg/m)`}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.diameter_mm || 'N/A'}
                                        </td>
                                        <td className="px-4 py-4">
                                            {row.length_m || 'N/A'}
                                        </td>
                                        <td className="px-2 py-4">
                                            <select
                                                value={row.location || ""}
                                                onChange={e => {
                                                    const newLocation = e.target.value;
                                                    setRows(prevRows =>
                                                        prevRows.map(r =>
                                                            r.id === row.id
                                                                ? { ...r, location: newLocation }
                                                                : r
                                                        )
                                                    );
                                                }}
                                                className="w-full rounded-lg"
                                            >
                                                <option value="">Select Location</option>
                                                <option>Top Bar</option>
                                                <option>Bottom Bar</option>
                                                <option>Extra Top Bar</option>
                                                <option>Extra Bottom Bar</option>
                                                <option>Web Bars 1</option>
                                                <option>Web Bars 2</option>
                                                <option>Stirrups</option>
                                            </select>
                                        </td>

                                        <td className="px-2 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-24 rounded-lg"
                                                value={row.quantity || ''}
                                                onChange={e => handleSimpleRebarQuantityChange(row.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-4">
                                            {row.total_weight ? row.total_weight.toFixed(2) : '0.00'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handleRemoveSimpleRebarRow(row.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400"
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
            </div>

            <div className="mt-6">
                <button
                    onClick={handleAddSimpleRebarRow}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-small hover:bg-blue-700"
                >
                    + Add Row
                </button>
            </div>
        </div>
    );
};

export default SimpleRebarDimensions;
