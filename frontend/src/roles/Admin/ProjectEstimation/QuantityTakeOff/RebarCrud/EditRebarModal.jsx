import React, { useEffect, useState } from "react";

const EditRebarModal = ({ isOpen, onClose, onSave, rebarData = [] }) => {
  const [formRows, setFormRows] = useState([]);
  const [rebarOptions, setRebarOptions] = useState([]);
  const [floorOptions, setFloorOptions] = useState([]);

useEffect(() => {
  if (!isOpen || rebarOptions.length === 0) return;

  const enriched = rebarData.map((row) => {
    const matchedRebar = rebarOptions.find(opt => opt.rebar_masterlist_id == row.rebar_masterlist_id);
    const length_m = parseFloat(matchedRebar?.length_m) || 0;
    const weight_per_meter = parseFloat(matchedRebar?.weight_per_meter) || 0;
    const quantity = parseFloat(row.quantity) || 0;


    return {
    sow_proposal_id: row.sow_proposal_id ?? rebarData[0]?.sow_proposal_id ?? null, 
      ...row,
      length_m,
      weight_per_meter,
      total_weight: parseFloat((quantity * length_m * weight_per_meter).toFixed(2)) || 0
    };
  });

  setFormRows(enriched);
}, [rebarData, rebarOptions, isOpen]);


  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      try {
        const rebarRes = await fetch("http://localhost:5000/api/rebar/masterlist");
        const floorRes = await fetch("http://localhost:5000/api/projects/floors");

        const rebarJson = await rebarRes.json();
        const floorJson = await floorRes.json();

        setRebarOptions(rebarJson?.data || rebarJson || []);
        setFloorOptions(floorJson.data || []);
      } catch (err) {
        console.error("❌ Error fetching dropdown data:", err);
      }
    };

    fetchOptions();
  }, [isOpen]);

 const handleChange = (index, field, value) => {
  const updated = [...formRows];
  const current = { ...updated[index] };

  if (field === "rebar_masterlist_id") {
    const selected = rebarOptions.find(opt => opt.rebar_masterlist_id == value);
    current.rebar_masterlist_id = value;
    current.rebar_label = selected?.label || "";
    current.name = `Rebar: ${selected?.label || ""}`;
    current.length_m = parseFloat(selected?.length_m) || 0;
    current.weight_per_meter = parseFloat(selected?.weight_per_meter) || 0;

    console.log("✅ Selected Rebar Info", {
      label: selected?.label,
      length_m: selected?.length_m,
      weight_per_meter: selected?.weight_per_meter
    });
  } else if (field === "floor_id") {
    const selected = floorOptions.find(opt => opt.floor_id == value);
    current.floor_id = value;
    current.floor_code = selected?.floor_code || "";
    current.floor_label = selected?.floor_label || "";
    current.floor = selected ? `${selected.floor_code} - ${selected.floor_label}` : "";
  } else if (field === "quantity") {
    current.quantity = parseFloat(value) || 0;
  } else {
    current[field] = value;
  }

  // 🚨 Log before computing total_weight
  const qty = parseFloat(current.quantity) || 0;
  const len = parseFloat(current.length_m) || 0;
  const wpm = parseFloat(current.weight_per_meter) || 0;

  console.log("🧮 Calculating total_weight", {
    quantity: qty,
    length_m: len,
    weight_per_meter: wpm
  });

  current.total_weight = parseFloat((qty * len * wpm).toFixed(2)) || 0;

  updated[index] = current;
  setFormRows(updated);
};




  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 z-10 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          Edit {formRows.length > 1 ? `(${formRows.length}) Entries` : `Label: ${formRows[0]?.rebar_label || "—"}`}
        </h2>

        <div className="space-y-6">
          {formRows.map((item, index) => (
            <div key={index} className="border p-4 rounded bg-gray-50">
              {formRows.length > 1 && (
                <h4 className="font-medium mb-2">Label: {item.rebar_label}</h4>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm">Item Label</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={item.rebar_masterlist_id || ""}
                    onChange={(e) => handleChange(index, "rebar_masterlist_id", e.target.value)}
                  >
                    <option value="">Select Rebar</option>
                    {rebarOptions.map(opt => (
                      <option key={opt.rebar_masterlist_id} value={opt.rebar_masterlist_id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm">Floor</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={item.floor_id || ""}
                    onChange={(e) => handleChange(index, "floor_id", e.target.value)}
                  >
                    <option value="">Select Floor</option>
                    {floorOptions.map(opt => (
                      <option key={opt.floor_id} value={opt.floor_id}>
                        {opt.floor_code} - {opt.floor_label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm">Location</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={item.location || ""}
                    onChange={(e) => handleChange(index, "location", e.target.value)}
                  >
                    <option value="">Select Location</option>
                    <option value="Top Bar">Top Bar</option>
                    <option value="Bottom Bar">Bottom Bar</option>
                    <option value="Side Bar">Side Bar</option>
                    <option value="Extra Top Bar">Extra Top Bar</option>
                    <option value="Stirrups">Stirrups</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded px-2 py-1"
                    value={item.quantity || 0}
                    onChange={(e) => handleChange(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1 text-sm">Total Weight</label>
                  <div className="text-lg font-bold">
                    {item.total_weight || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 mt-4">
          <button
            className="mr-2 px-4 py-2 border rounded text-sm hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            onClick={() => onSave(formRows)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRebarModal;
