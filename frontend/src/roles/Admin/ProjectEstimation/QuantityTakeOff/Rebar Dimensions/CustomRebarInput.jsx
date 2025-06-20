import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

const CustomRebarInput = ({
  rebarOptions = [],
  itemTitle,
  floors = [],
  onRowsChange,
work_item_id
}) => {
  const [rowsByFloor, setRowsByFloor] = useState({});
  const [activeFloorId, setActiveFloorId] = useState(floors[0]?.floor_id || null);


  useEffect(() => {
    if (onRowsChange) {
      onRowsChange(rowsByFloor);
    }

  }, [rowsByFloor, onRowsChange])


  useEffect(() => {
    if (floors.length > 0 && activeFloorId === null) {
      setActiveFloorId(floors[0].floor_id);
    }
  }, [floors, activeFloorId]);

  const handleAddRow = () => {
    const newRow = {
      id: uuidv4(),
      rebar_masterlist_id: "",
      diameter_mm: "",
      length_m: "",
      quantity: "",
      weight_per_meter: "",
      total_weight: 0,
      work_item_id: work_item_id, // or from parent

      location: "",
    };

    setRowsByFloor(prev => ({
      ...prev,
      [activeFloorId]: [...(prev[activeFloorId] || []), newRow],
    }));
  };

  const handleRemoveRow = (rowId) => {
    setRowsByFloor(prev => ({
      ...prev,
      [activeFloorId]: prev[activeFloorId]?.filter(row => row.id !== rowId) || [],
    }));
  };

  const handleRebarChange = (rowId, selectedId) => {
    const selectedRebar = rebarOptions.find(opt => opt.rebar_masterlist_id === parseInt(selectedId));
    if (!selectedRebar) return;

    setRowsByFloor(prev => ({
      ...prev,
      [activeFloorId]: prev[activeFloorId]?.map(row => {
        if (row.id === rowId) {
          const quantity = parseFloat(row.quantity) || 0;
          const newTotalWeight = selectedRebar.weight_per_meter * selectedRebar.length_m * quantity;
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
      }) || [],
    }));
  };

  const handleQuantityChange = (rowId, value) => {
    const newQuantity = parseFloat(value) || 0;

    setRowsByFloor(prev => ({
      ...prev,
      [activeFloorId]: prev[activeFloorId]?.map(row => {
        if (row.id === rowId) {
          const newTotalWeight = (row.weight_per_meter || 0) * (row.length_m || 0) * newQuantity;
          return {
            ...row,
            quantity: newQuantity,
            total_weight: newTotalWeight,
          };
        }
        return row;
      }) || [],
    }));
  };

  const currentRows = rowsByFloor[activeFloorId] || [];

  return (
    <div className="space-y-8 p-4 bg-white rounded-lg shadow-md max-h-[600px] overflow-y-auto">
      <h3 className="text-2xl font-bold mb-4 text-gray-900">Custom Item Dimensions</h3>

      {floors.length === 0 ? (
        <p className="text-lg text-gray-500">No floors found for this project.</p>
      ) : (
        <>
          {/* Floor Selector */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
            {floors.map(floor => (
              <button
                key={floor.floor_id}
                onClick={() => setActiveFloorId(floor.floor_id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  ${activeFloorId === floor.floor_id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
              >
                {floor.floor_label || floor.floor_code || `Floor ${floor.floor_id}`}
              </button>
            ))}
          </div>

          <div className="border border-gray-200 rounded-lg shadow-inner p-6 bg-gray-50 mb-4">
            <h4 className="text-xl font-semibold mb-2 text-blue-700">
              Item: {itemTitle}
              <span className="ml-2 text-gray-600">
                ({floors.find(f => f.floor_id === activeFloorId)?.floor_label || `Floor ${activeFloorId}`})
              </span>
            </h4>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rebar</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Diameter</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Length</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>

                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRows.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-gray-400">
                        No rebar rows. Click "+ Add Row" to begin.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map(row => (
                      <tr key={row.id}>
                        <td className="px-4 py-2">
                          <select
                            value={row.rebar_masterlist_id}
                            onChange={e => handleRebarChange(row.id, e.target.value)}
                            className="w-full rounded-md"
                          >
                            <option value="">Select Rebar</option>
                            {rebarOptions.map(opt => (
                              <option key={opt.rebar_masterlist_id} value={opt.rebar_masterlist_id}>
                                {`${opt.label || 'Rebar'} - ${opt.diameter_mm}mm x ${opt.length_m}m (${opt.weight_per_meter} kg/m)`}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">{row.diameter_mm || 'N/A'}</td>
                        <td className="px-4 py-2">{row.length_m || 'N/A'}</td>
                        <td className="px-2 py-4">
                          <select
                            value={row.location || ""}
                            onChange={e => {
                              const newLocation = e.target.value;
                              setRowsByFloor(prev => ({
                                ...prev,
                                [activeFloorId]: prev[activeFloorId]?.map(r =>
                                  r.id === row.id
                                    ? { ...r, location: newLocation }
                                    : r
                                ) || [],
                              }));
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

                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            className="w-24 rounded-lg"
                            value={row.quantity || ''}
                            onChange={e => handleQuantityChange(row.id, e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-2">
                          {row.total_weight?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleRemoveRow(row.id)}
                            className="text-red-600 hover:text-red-800"
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

            <div className="mt-4">
              <button
                onClick={handleAddRow}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add Row
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomRebarInput;
