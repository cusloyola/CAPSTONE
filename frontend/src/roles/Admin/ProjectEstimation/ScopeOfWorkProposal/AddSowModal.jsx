import React, { useState, useEffect, useRef } from "react";

const AddSowModal = ({ onClose, onSelectItem }) => {
  const [workItems, setWorkItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const modalRef = useRef(null);
  const SOW_API_URL = "http://localhost:5000/api/sowproposal/sow-work-items";

  useEffect(() => {
    fetch(SOW_API_URL)
      .then((res) => res.json())
      .then((data) => {
        const items = data.data || data;
        setWorkItems(items);
        setFilteredItems(items);
      })
      .catch(console.error);
  }, []);

  // Toggle selection of item by work_item_id
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = workItems.filter(
      (item) =>
        item.item_title.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value)
    );
    setFilteredItems(filtered);
  };

  const handleAddWork = () => {
    // Send all selected items back to parent as an array
    const selectedItems = workItems.filter((item) =>
      selectedIds.has(item.work_item_id)
    );
    if (selectedItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }
    onSelectItem(selectedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[99999]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
        onClick={onClose}
      ></div>

      {/* Modal Box */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-[800px] max-h-[90vh] shadow-xl z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          aria-label="Close modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4">Select Scope of Work Items</h2>

        {/* Search Field */}
        <input
          type="text"
          placeholder="Search by title or category..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="mb-4 mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded w-full dark:bg-gray-700 dark:text-white"
        />

        {/* Work Items List */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.work_item_id);
            return (
              <li
                key={item.work_item_id}
                onClick={() => toggleSelect(item.work_item_id)}
                className={`cursor-pointer border rounded p-4 bg-gray-50 dark:bg-gray-700 transition-all ${
                  isSelected
                    ? "border-blue-600 ring-2 ring-blue-300"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <div className="font-medium text-lg">{item.item_title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {item.category}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer Action */}
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
