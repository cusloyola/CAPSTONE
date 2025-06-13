// QtoDimensionInput.jsx
import React from "react";
import SumPerColumnsTable from './SumPerColumnsTable';
import SumPerFloorsCards from './SumPerFloorCards';
import SimpleDimensionCard from './SimpleDimensionCard';
import CustomVolumeInput from './CustomVolumeInput';

const QtoDimensionInput = ({
  parent,
  updateChildDimensions = () => {},
  floors,
  onBack = () => {}, // Added onBack prop
  onDone = () => {}  // Added onDone prop
}) => {
  if (!parent || !floors || floors.length === 0) {
    return <div className="p-4 text-gray-700 dark:text-gray-300">Loading dimensions... Please ensure parent and floor data are provided.</div>;
  }

  let selectedItems = [];
  if (parent.children && parent.children.length > 0) {
    selectedItems = parent.children.filter(child => child.checked);
  }
  // If no children are selected but the parent itself is checked, consider the parent
  if (selectedItems.length === 0 && parent.checked) {
    selectedItems = [parent];
  }

  if (selectedItems.length === 0) {
    return (
      <div className="p-4 text-gray-700 dark:text-gray-300">
        <p>No selected items to set dimensions for. Please select some items first.</p>
        <div className="mt-8 flex justify-end"> {/* Added Back button here too */}
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            ◀ Back
          </button>
        </div>
      </div>
    );
  }

  // This is the single update handler for all children, passed down.
  // It expects the entire updated parent object.
  const handleUpdateParentChildren = (updatedParent) => {
    // Avoid infinite loop: only call updateChildDimensions if state has changed
    const prev = JSON.stringify(parent);
    const next = JSON.stringify(updatedParent);

    if (prev !== next) {
      updateChildDimensions(updatedParent);
    }
  };

  // Determine which compute types are present in the selected items
  const hasSumPerColumnChild = selectedItems.some(child => child.compute_type === "sum_per_columns");
  const hasSumPerFloorsChild = selectedItems.some(child => child.compute_type === "sum_per_floors");
  const hasCustomChild = selectedItems.some(child => child.compute_type === "custom");
  const hasSimpleDimensionChild = selectedItems.some(child =>
        child.compute_type !== "sum_per_columns" &&
        child.compute_type !== "sum_per_floors" &&
        child.compute_type !== "custom" // Exclude custom too now
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Set Dimensions</h2>
      <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
        <span className="font-semibold">{parent.item_title}</span> — {parent.category || "General Items"}
      </p>

      {/* Conditionally render the appropriate component(s) */}
      {hasSumPerColumnChild && (
          <SumPerColumnsTable
              selectedItems={selectedItems}
              updateChildDimensions={handleUpdateParentChildren}
              parent={parent}
          />
      )}
      {hasSumPerFloorsChild && (
          <SumPerFloorsCards
              selectedItems={selectedItems}
              floors={floors}
              updateChildDimensions={handleUpdateParentChildren}
              parent={parent}
          />
      )}
      {hasCustomChild && (
          <CustomVolumeInput // This is the component that handles dynamic rows
              selectedItems={selectedItems}
              updateChildDimensions={handleUpdateParentChildren}
              parent={parent}
              floors={floors}
          />
      )}
      {hasSimpleDimensionChild && (
          <SimpleDimensionCard
              selectedItems={selectedItems}
              updateChildDimensions={handleUpdateParentChildren}
              parent={parent}
          />
      )}

      {/* --- Back and Done Buttons (Re-introduced) --- */}
      <div className="mt-8 flex justify-between items-center py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          ◀ Back to Children
        </button>
        <button
          onClick={onDone}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
        >
          Done ▶
        </button>
      </div>
    </div>
  );
};

export default QtoDimensionInput;