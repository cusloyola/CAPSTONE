import React, { useState, useEffect } from "react";

const EditSowModal = ({ show, onClose, item, onUpdate, sowItems, existingItemIds }) => {
  const [selectedWorkItemId, setSelectedWorkItemId] = useState(item?.work_item_id || "");

  useEffect(() => {
    if (item) setSelectedWorkItemId(item.work_item_id);
  }, [item]);

  const handleChange = (e) => {
    setSelectedWorkItemId(Number(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedWorkItemId) {
      alert("Please select a Work Item");
      return;
    }

    onUpdate({
      work_item_id: item.work_item_id,        // current work item
      new_work_item_id: selectedWorkItemId,   // selected new work item from dropdown
    });

    onClose();
  };

  if (!show || !item) return null;

  // Filter out items that are already selected except for the current item
  const availableWorkItems = sowItems.filter(
    s => !existingItemIds.has(s.work_item_id) || s.work_item_id === item.work_item_id
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-semibold mb-4">Edit Scope of Work</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block text-gray-700">Item Title</label>
            <p className="p-2 border rounded bg-gray-100">{item.item_title}</p>
          </div>

          <div className="mb-2">
            <label className="block text-gray-700">Category</label>
            <p className="p-2 border rounded bg-gray-100">{item.category}</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Unit Code</label>
            <p className="p-2 border rounded bg-gray-100">{item.unitCode}</p>
          </div>

          <div className="mb-4 mt-4">
            <label className="block text-gray-700">Change Work Item</label>
            <select
              value={selectedWorkItemId}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Work Item</option>
              {availableWorkItems.map((s) => (
                <option key={s.work_item_id} value={s.work_item_id}>
                  {s.item_title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSowModal;
