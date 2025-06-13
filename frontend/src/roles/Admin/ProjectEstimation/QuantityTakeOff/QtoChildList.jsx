import React, { useState } from "react";


const QtoChildList = ({
  childItems = [],
  onAddChildren,
  onBack,
  toggleChildSelection
}) => {
// Inside QtoChildList.jsx
const handleAdd = () => {
  const selectedChildren = childItems.filter(child => child.checked);
  if (selectedChildren.length === 0) {
    alert("Please select at least one sub-scope item.");
    return;
  }
  console.log("handleAdd called with:", selectedChildren);
  onAddChildren(); // ✅ just call it — don't pass selectedChildren
};

  return (
    <>
      <h2 className="text-3xl font-semibold mb-6">Select Sub-Scope Items</h2>

      <div className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          ◀ Back to Work Items
        </button>
      </div>

      <div
        className="overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        style={{ maxHeight: "120vh" }}
      >
        {childItems.length === 0 && <p>No child items available.</p>}

        {childItems.map(child => {
          const isSelected = child.checked;
          return (
            <div
              key={child.work_item_id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => toggleChildSelection(child.work_item_id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleChildSelection(child.work_item_id);
                }
              }}
              className={`cursor-pointer border rounded-lg p-4 mb-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 transition-all flex flex-col justify-center items-center
                ${isSelected ? "border-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900" : ""}
              `}
              style={{ minHeight: "100px", userSelect: "none" }}
            >
              <div className="font-medium text-lg text-center">
                {child.item_title}
              </div>
              {isSelected && (
                <div className="mt-2 text-blue-600 font-semibold">Selected</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleAdd}
          className={`bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700`}
        >
          Add ▶
        </button>
      </div>
    </>
  );
};

export default QtoChildList;
