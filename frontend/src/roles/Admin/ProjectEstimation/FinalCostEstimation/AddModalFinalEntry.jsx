import React, { useState, useEffect } from "react";

const AddModalFinalEntry = ({ proposalId, onClose, onSave }) => {
  const [groupedTypes, setGroupedTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");

  useEffect(() => {
    if (proposalId) {
      fetch(`http://localhost:5000/api/sowproposal/sow-work-items/proposal/${proposalId}`)
        .then((res) => res.json())
        .then((data) => setGroupedTypes(data))
        .catch((err) => console.error("❌ Failed to fetch grouped SOW data", err));
    }
  }, [proposalId]);

  const currentItems = groupedTypes.find((type) => type.work_type_id === parseInt(selectedTypeId))?.items || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[99999]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 w-[1300px] h-[700px] shadow-xl z-10 flex flex-col space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Final Cost Entry</h2>

        {/* Form Section */}
        <div className="grid grid-cols-2 gap-8">
          {/* SOW Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">SOW Type</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              value={selectedTypeId}
              onChange={(e) => {
                setSelectedTypeId(e.target.value);
                setSelectedItemId(""); // Reset item
              }}
            >
              <option value="">Select Type</option>
              {groupedTypes.map((type) => (
                <option key={type.work_type_id} value={type.work_type_id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          {/* SOW Item Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">SOW Item</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              disabled={!selectedTypeId}
            >
              <option value="">Select Item</option>
              {currentItems.map((item) => (
                <option key={item.work_item_id} value={item.work_item_id}>
                  {item.item_title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center mt-auto">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
          >
            ◀ Cancel
          </button>
          <button
            onClick={() => onSave(selectedTypeId, selectedItemId)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedItemId}
          >
            Save ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModalFinalEntry;
