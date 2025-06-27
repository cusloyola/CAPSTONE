import React, { useState, useEffect } from "react";

const EditModalLUC = ({ data, onClose, onUpdate }) => {
  const [laborRates, setLaborRates] = useState([]);
  const [form, setForm] = useState({
    labor_entry_id: data?.labor_entry_id || "",
    labor_rate_id: data?.labor_rate_id || "", // Keep it as-is
    quantity: data?.quantity || 0,
    allowance_percent: data?.allowance_percent || 0,
    average_output: data?.average_output || 1,
    labor_row_cost: data?.labor_row_cost || 0,
  });

  const [selectedLabor, setSelectedLabor] = useState(null);

  // Fetch all labor types
  useEffect(() => {
    const fetchLaborRates = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/laborunitcost/labor-rate");
        const json = await res.json();
        setLaborRates(json);
      } catch (err) {
        console.error("Failed to fetch labor types", err);
      }
    };
    fetchLaborRates();
  }, []);

  // Match selected labor from the fetched list
  useEffect(() => {
    if (!laborRates.length || !form.labor_rate_id) return;
    const matched = laborRates.find(
      (rate) => rate.labor_rate_id == form.labor_rate_id
    );
    if (matched) {
      setSelectedLabor(matched);
    }
  }, [laborRates, form.labor_rate_id]);

  // Recalculate labor row cost
  useEffect(() => {
    if (!selectedLabor) return;
    const quantity = parseFloat(form.quantity) || 0;
    const allowance = parseFloat(form.allowance_percent) || 0;
    const avg = parseFloat(form.average_output) || 1;

    const total = ((selectedLabor.daily_rate * quantity) * (1 + allowance / 100)) / avg;
    setForm((prev) => ({ ...prev, labor_row_cost: total }));
  }, [selectedLabor, form.quantity, form.allowance_percent, form.average_output]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLaborChange = (e) => {
    const rateId = e.target.value;
    setForm((prev) => ({ ...prev, labor_rate_id: rateId }));
    const matched = laborRates.find((rate) => rate.labor_rate_id == rateId);
    if (matched) setSelectedLabor(matched);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/laborunitcost/update/${form.labor_entry_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            labor_rate_id: form.labor_rate_id,
            quantity: form.quantity,
            allowance_percent: form.allowance_percent,
            average_output: form.average_output,
            labor_row_cost: form.labor_row_cost,
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());
      alert("Successfully updated!");
      onUpdate?.();
      onClose();
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Update failed. Check console for details.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 z-10">
        <h2 className="text-xl font-semibold mb-4">Edit Labor Unit Cost</h2>

        <div className="space-y-6">
          <div className="border p-4 rounded bg-gray-50">
            <div className="grid grid-cols-2 gap-4 items-center">

              {/* Dropdown to change labor type */}
              <div className="col-span-2">
                <label className="block text-sm mb-1">Labor Type</label>
                <select
                  value={form.labor_rate_id}
                  onChange={handleLaborChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="" disabled>Select labor type</option>
                  {laborRates.map((rate) => (
                    <option key={rate.labor_rate_id} value={rate.labor_rate_id}>
                      {rate.labor_type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily rate display */}
              <div className="col-span-2">
                <label className="block text-sm mb-1">Daily Rate</label>
                <div className="text-base px-3 py-2 border rounded bg-white">
                  ₱ {selectedLabor?.daily_rate?.toFixed(2) || "0.00"}
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Allowance (%)</label>
                <input
                  type="number"
                  name="allowance_percent"
                  value={form.allowance_percent}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm">Average Output</label>
                <input
                  type="number"
                  name="average_output"
                  value={form.average_output}
                  onChange={handleChange}
                  className="w-full border rounded px-2 py-1"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-1 text-sm">Labor Row Cost</label>
                <div className="text-lg font-bold px-3 py-2 rounded border bg-white">
                  ₱ {form.labor_row_cost.toFixed(2)}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-4">
          <button
            className="mr-2 px-4 py-2 border rounded text-sm hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModalLUC;
