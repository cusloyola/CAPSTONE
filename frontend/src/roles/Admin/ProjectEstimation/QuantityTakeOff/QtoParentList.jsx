import React from "react";
import { FaChevronRight } from "react-icons/fa";

const QtoParentList = ({
  workItems,
  categoryFilter,
  setCategoryFilter,
  searchTerm,
  setSearchTerm,
  onSelectParent
}) => {
  const filteredItems = workItems.filter(item => {
    const matchCategory = categoryFilter ? item.category?.toLowerCase().includes(categoryFilter.toLowerCase()) : true;
    const matchSearch = searchTerm ? item.item_title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.category?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    return matchCategory && matchSearch;
  });

  const workTypes = [...new Set(
    workItems.map(item => item.category).filter(category => category && category.trim() !== "")
  )];

  return (
    <>
      <h2 className="text-3xl font-semibold mb-6">Select Scope of Work Items</h2>

      <div className="flex items-center gap-4 mb-6">
        <select
          className="border p-2 rounded w-60"
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
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="overflow-y-auto pr-2" style={{ maxHeight: "60vh" }}>
        {filteredItems.map(parent => (
          <div
            key={parent.work_item_id}
            className="cursor-pointer border rounded-lg p-4 mb-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 transition-all"
          >
            <div className="font-medium text-lg flex justify-between items-center">
              <span>{parent.item_title}</span>
              <button
                onClick={() => onSelectParent(parent)}
                className="px-3 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                <FaChevronRight className="text-black" />
              </button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-300">{parent.category}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default QtoParentList;