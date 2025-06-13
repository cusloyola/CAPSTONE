// QtoChildSelector.jsx (Your provided code - no changes needed here for the loop fix)
import React, { useState, useEffect } from "react";
import QtoChildList from "./QtoChildList";
import QtoDimensionInput from "./QTO Dimensions/QtoInputDimensions"; // Note: file name is QtoInputDimensions, not QtoDimensionInput

const QtoChildSelector = ({ parent, setParent, onBack, floors }) => {
  const [currentPage, setCurrentPage] = useState("childList");

  useEffect(() => {
    console.log("QtoChildSelector mounted");
    console.log("Initial parent data:", parent);
  }, []);

  useEffect(() => {
    console.log("Current page changed to:", currentPage);
  }, [currentPage]);

  const toggleChildSelection = (childId) => {
    console.log("Toggling child with ID:", childId);

    const updated = {
      ...parent,
      children: parent.children.map(child =>
        child.work_item_id === childId
          ? { ...child, checked: !child.checked }
          : child
      )
    };

    console.log("Updated parent after toggle:", updated);
    setParent(updated);
  };

  const updateDimension = (...args) => {
    // Scenario 1: QtoInputDimensions sent the full updated parent object
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && 'work_item_id' in args[0]) {
      const updatedParentFromInput = args[0];
      console.log("Updating parent with dimensionsPerFloor (from QtoInputDimensions):", updatedParentFromInput);
      setParent(updatedParentFromInput);
      return;
    }

    // Scenario 2: QtoInputDimensions sent childId, field, value (for simple compute_type)
    if (args.length === 3) {
      const [childId, field, value] = args;
      console.log(`Updating simple dimension: Child ID: ${childId} - Field: ${field} - Value: ${value}`);

      setParent(prevParent => {
        if (!prevParent) return null;

        if (prevParent.work_item_id === childId) {
          return { ...prevParent, [field]: value };
        }

        if (prevParent.children && prevParent.children.length > 0) {
          const updatedChildren = prevParent.children.map(child => {
            if (child.work_item_id === childId) {
              return { ...child, [field]: value };
            }
            return child;
          });
          return { ...prevParent, children: updatedChildren };
        }
        return prevParent;
      });
      return;
    }

    console.warn("updateDimension called with unexpected arguments:", args);
  };

  const goToDimensions = () => {
    console.log("Checking selected children...");
    const hasSelected = parent.children?.some(child => child.checked);
    console.log("Has selected child?", hasSelected);

    if (hasSelected) {
      setCurrentPage("dimensionList");
    } else {
      alert("Please select at least one sub-scope item.");
    }
  };

  return (
    <>
      {currentPage === "childList" && (
        <QtoChildList
          childItems={parent.children}
          onAddChildren={goToDimensions}
          onBack={onBack}
          toggleChildSelection={toggleChildSelection}
        />
      )}

      {currentPage === "dimensionList" && (
        <QtoDimensionInput
          parent={parent}
          updateChildDimensions={updateDimension} // This is the prop that calls the above function
          onBack={() => setCurrentPage("childList")} // This onBack is no longer used by QtoInputDimensions
          onDone={() => console.log("Final parent state:", parent)} // This onDone is no longer used by QtoInputDimensions
          floors={floors || []}
        />
      )}
    </>
  );
};

export default QtoChildSelector;