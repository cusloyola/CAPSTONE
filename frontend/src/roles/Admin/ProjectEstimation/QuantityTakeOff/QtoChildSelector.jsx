import React, { useState, useEffect } from "react";
import QtoChildList from "./QtoChildList";
import QtoDimensionInput from "./QTO Dimensions/QtoInputDimensions";

// 🔧 Utility function to shallow compare children only
const shallowCompareChildren = (prev, next) => {
  if (!prev || !next || !Array.isArray(prev.children) || !Array.isArray(next.children)) return false;
  if (prev.children.length !== next.children.length) return false;

  return prev.children.every((child, i) => {
    const nextChild = next.children[i];

    const sameDimensions =
      JSON.stringify(child.dimensionsPerFloor) === JSON.stringify(nextChild.dimensionsPerFloor) &&
      JSON.stringify(child.custom_item_dimensions_by_floor) === JSON.stringify(nextChild.custom_item_dimensions_by_floor) &&
      JSON.stringify(child.dimensions) === JSON.stringify(nextChild.dimensions);

    return (
      child.work_item_id === nextChild.work_item_id &&
      child.checked === nextChild.checked &&
      sameDimensions
    );
  });
};


const QtoChildSelector = ({ parent, setParent, onBack, floors, proposal_id }) => {
  const [currentPage, setCurrentPage] = useState("childList");

  useEffect(() => {
    console.log("🔵 QtoChildSelector mounted");
    console.log("Initial parent data:", parent);
  }, []);

  useEffect(() => {
    console.log("📄 Current page:", currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log("🟢 Parent state updated:", parent);
  }, [parent]);

  const toggleChildSelection = (childId) => {
    console.log("🔁 Toggling child with ID:", childId);

    const updated = {
      ...parent,
      children: parent.children.map(child =>
        child.work_item_id === childId
          ? { ...child, checked: !child.checked }
          : child
      )
    };

    console.log("✅ Updated parent after toggle:", updated);
    setParent(updated);
  };

  const updateDimension = (...args) => {
    if (
      args.length === 1 &&
      typeof args[0] === "object" &&
      args[0] !== null &&
      "children" in args[0]
    ) {
      const updatedParentFromInput = args[0];

      // ✅ Prevent re-setting same data to avoid infinite loop
      if (!shallowCompareChildren(parent, updatedParentFromInput)) {
        console.log("🔄 Updating parent with new dimension data.");
        setParent(updatedParentFromInput);
      } else {
        console.log("⛔ No change in dimensions, skipping update.");
      }

      return;
    }

    if (args.length === 3) {
      const [childId, field, value] = args;
      console.log(`✏️ Updating basic dimension: Child ID: ${childId}, Field: ${field}, Value: ${value}`);

      setParent(prevParent => {
        if (!prevParent) return null;

        if (prevParent.work_item_id === childId) {
          return { ...prevParent, [field]: value };
        }

        if (prevParent.children && prevParent.children.length > 0) {
          const updatedChildren = prevParent.children.map(child =>
            child.work_item_id === childId
              ? { ...child, [field]: value }
              : child
          );
          return { ...prevParent, children: updatedChildren };
        }

        return prevParent;
      });
      return;
    }

    console.warn("⚠️ updateDimension called with unexpected arguments:", args);
  };

  const goToDimensions = () => {
    console.log("📌 Checking selected children...");
    const hasSelected = parent.children?.some(child => child.checked);
    console.log("✅ Has selected child?", hasSelected);

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
          updateChildDimensions={updateDimension}
            sow_proposal_id={proposal_id} // ✅ Make sure this is passed

          onBack={() => setCurrentPage("childList")}
          onDone={() => {
            console.log("✅ Final parent state onDone:");
            console.dir(parent, { depth: null });
          }}
          floors={floors || []}
        />
      )}
    </>
  );
};

export default QtoChildSelector;
