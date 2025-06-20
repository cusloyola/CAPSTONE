import React, { useState } from "react";
import QtoChildList from "./QtoChildList";
import QtoDimensionInput from "./QTO Dimensions/QtoInputDimensions";
import RebarInputDimensions from "./Rebar Dimensions/RebarInputDimensions"; // ✅ New import

const QtoChildSelector = ({ parent, setParent, onBack, onDone, floors, proposal_id }) => {
  const [currentPage, setCurrentPage] = useState("childList");

  const toggleChildSelection = (childId) => {
    const updated = {
      ...parent,
      children: parent.children.map(child =>
        child.work_item_id === childId
          ? { ...child, checked: !child.checked }
          : child
      )
    };
    console.log("🔄 Child selection toggled:", childId);
    setParent(updated);
  };

  const updateDimension = (childId, field, value) => {
    console.log("🛠 Updating dimension:", { childId, field, value });
    setParent(prev => ({
      ...prev,
      children: prev.children.map(child =>
        child.work_item_id === childId
          ? { ...child, [field]: value }
          : child
      )
    }));
  };

  const goToDimensions = () => {
    console.log("📌 goToDimensions called with parent:", parent);
    const selectedItems = parent.children?.filter(child => child.checked) || [];
    if (selectedItems.length === 0) {
      alert("Please select at least one sub-scope item.");
      return;
    }

    console.log("✅ Selected children:", selectedItems);
    setCurrentPage("dimensionList");
  };

  const selectedItems = parent.children?.filter(child => child.checked) || [];
  const hasRebar = selectedItems.some(child => child.quantity_type === "rebar");
  const hasQTO = selectedItems.some(child => child.quantity_type === "qto");

  console.log("🧪 Render State:", {
    currentPage,
    selectedItems,
    hasRebar,
    hasQTO,
    parent
  });

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
        <>
          {hasQTO && (
            <QtoDimensionInput
              parent={parent}
              updateChildDimensions={updateDimension}
              sow_proposal_id={proposal_id}
              onBack={() => setCurrentPage("childList")}
              onDone={onDone}
              floors={floors || []}
            />
          )}

          {hasRebar && (
            <RebarInputDimensions
              parent={parent}
              updateChildDimensions={updateDimension}
              onBack={() => setCurrentPage("childList")}
              onDone={onDone}
                            floors={floors || []}

            />
          )}

          {!hasQTO && !hasRebar && (
            <div className="text-red-500 font-semibold p-4">
              ⚠️ No valid dimension input type found for selected items.
            </div>
          )}
        </>
      )}
    </>
  );
};

export default QtoChildSelector;
