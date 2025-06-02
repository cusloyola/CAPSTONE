import React, { useState, useEffect } from "react";

const SOW_API_URL_ALL = "http://localhost:5000/api/sowproposal/sow-work-items/all-work-items"; 
const SOW_API_URL_POST = "http://localhost:5000/api/sowproposal/sow-work-items/add";

const AddSowModal = ({ proposal_id, onClose, onSelectItem }) => {
  const [workItems, setWorkItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

useEffect(() => {
  fetch(`${SOW_API_URL_ALL}?proposal_id=${proposal_id}`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setWorkItems(data);
      } else {
        setWorkItems([]);
        console.error("Expected array but got:", data);
      }
    })
    .catch(err => {
      console.error(err);
      setWorkItems([]);
    });
}, [proposal_id]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleAddWork = async () => {
    if (selectedIds.size === 0) {
      alert("Please select at least one item.");
      return;
    }

    try {
      const work_item_ids = Array.from(selectedIds);

      const payload = { proposal_id, work_item_ids };
      console.log("Sending payload:", payload);

      const response = await fetch(SOW_API_URL_POST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to save work items.");
      }

      const result = await response.json();
      console.log("Saved successfully:", result);

      // Pass the newly added items back to parent
      const selectedItems = workItems.filter(item => selectedIds.has(item.work_item_id));
      onSelectItem(selectedItems);

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save selected items.");
    }
  };

const filteredWorkItems = Array.isArray(workItems)
  ? (categoryFilter
      ? workItems.filter(item =>
          item.category && item.category.toLowerCase().includes(categoryFilter.toLowerCase())
        )
      : workItems)
  : [];

const displayedItems = filteredWorkItems.filter(item =>
  (item.item_title && item.item_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
);



  // Extract unique categories for filter dropdown
  const workTypes = [...new Set(workItems
    .map(item => item.category)
    .filter(category => category && category.trim() !== "")
  )];


  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[99999]">
      <div
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
        onClick={onClose}
      ></div>

      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-[800px] max-h-[90vh] shadow-xl z-10 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-4">Select Scope of Work Items</h2>

        <div className="flex items-center gap-4 mb-6 mt-4">
          <select
            className="border p-2 rounded w-48"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">All Work Types</option>
            {workTypes.map((type, idx) => (
              <option key={idx} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white flex-1"
          />
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto">
          {displayedItems.map(item => {
            const isSelected = selectedIds.has(item.work_item_id);
            return (
              <li
                key={item.work_item_id}
                onClick={() => toggleSelect(item.work_item_id)}
                className={`cursor-pointer border rounded p-4 bg-gray-50 dark:bg-gray-700 transition-all ${isSelected ? "border-blue-600 ring-2 ring-blue-300" : "border-gray-300 dark:border-gray-600"}`}
              >
                <div className="font-medium text-lg">{item.item_title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{item.category}</div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={handleAddWork}
          >
            Add Work
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSowModal;
