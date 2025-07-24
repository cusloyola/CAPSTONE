import React, { useState, useEffect } from "react";
import QtoParentList from "./QtoParentList";
import QtoChildSelector from "./QtoChildSelector";
import QtoDimensionInput from "./QTO Dimensions/QtoInputDimensions";
import RebarInputDimensions from "./Rebar Dimensions/RebarInputDimensions";

const QTO_API_VOLUME = "http://localhost:5000/api/sowproposal/sow-work-items/sow-table/";

const AddQtoModal = ({ proposal_id, project_id, onClose }) => {
  const [workItems, setWorkItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParent, setSelectedParent] = useState(null);
  const [floors, setFloors] = useState([]);

  useEffect(() => {
  // 1. Fetch SOW work items
  fetch(`${QTO_API_VOLUME}?proposal_id=${proposal_id}`)
    .then(res => res.json())
    .then(data => {
      const { workItems } = data;

      if (Array.isArray(workItems)) {
        const tree = buildTree(workItems);
        setWorkItems(tree);
      } else {
        console.error("Expected workItems to be array but got:", workItems);
        setWorkItems([]);
      }
    })
    .catch(err => {
      console.error("❌ Error fetching SOW work items:", err);
      setWorkItems([]);
    });

  // 2. Fetch floors from /api/projects/floors
fetch(`http://localhost:5000/api/projects/floors?project_id=${project_id}`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data.data) && data.data.length > 0) {
        console.log("✅ Fetched project floors:", data.data);
        setFloors(data.data);
      } else {
        console.warn("⚠️ No floors returned, using default.");
        setFloors([{ floor_id: "default", floor_code: "Ground Floor" }]);
      }
    })
    .catch(err => {
      console.error("❌ Error fetching floors:", err);
      setFloors([{ floor_id: "default", floor_code: "Ground Floor" }]);
    });
}, [proposal_id]);


  function buildTree(items) {
    const map = {};
    const roots = [];

    items.forEach(item => {
      map[item.work_item_id] = {
        ...item,
        children: [],
        checked: false,
        length: "",
        width: "",
        height: ""
      };
    });

    items.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.work_item_id]);
      } else {
        roots.push(map[item.work_item_id]);
      }
    });

    return roots;
  }

  const toggleChildSelection = (childId) => {
    const updated = workItems.map(item => {
      if (item.work_item_id === selectedParent.work_item_id) {
        const updatedChildren = item.children.map(child =>
          child.work_item_id === childId ? { ...child, checked: !child.checked } : child
        );
        return { ...item, children: updatedChildren };
      }
      return item;
    });

    setWorkItems(updated);
    const updatedParent = updated.find(item => item.work_item_id === selectedParent.work_item_id);
    if (updatedParent) setSelectedParent(updatedParent);
  };

  const updateChildDimensions = (childId, dimension, value) => {
    const updated = workItems.map(item => {
      if (item.work_item_id === selectedParent.work_item_id) {
        const updatedChildren = item.children.map(child =>
          child.work_item_id === childId ? { ...child, [dimension]: value } : child
        );
        return { ...item, children: updatedChildren };
      }
      return item;
    });

    setWorkItems(updated);
    const updatedParent = updated.find(item => item.work_item_id === selectedParent.work_item_id);
    if (updatedParent) setSelectedParent(updatedParent);
  };

  const renderDimensionInput = () => {
    if (!selectedParent) return null;

    if (selectedParent.compute_type === "rebar") {
      console.log("🎯 Rendering RebarDimensionInput");
      return (
        <RebarInputDimensions
          parent={selectedParent}
          updateChildDimensions={updateChildDimensions}
          onBack={() => setCurrentPage(2)}
          onDone={onClose}
          floors={floors}
        />
      );
    }

    console.log("🧮 Rendering QtoDimensionInput");
    return (
      <QtoDimensionInput
        parent={selectedParent}
        updateChildDimensions={updateChildDimensions}
        onBack={() => setCurrentPage(2)}
        onDone={onClose}
        floors={floors}
      />
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[99999]">
      <div
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
        onClick={onClose}
      ></div>
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 w-[1300px] h-[700px] shadow-xl z-10 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Close modal"
        >
          ✕
        </button>

        {currentPage === 1 && (
          <QtoParentList
            workItems={workItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onSelectParent={(parent) => {
              const fullParent = workItems.find(item => item.work_item_id === parent.work_item_id);
              fullParent.floors = floors;
              setSelectedParent(fullParent);
              setCurrentPage(2);
            }}
          />
        )}

       {currentPage === 2 && selectedParent && (
  <QtoChildSelector
    parent={selectedParent}
    setParent={setSelectedParent}
    onBack={() => setCurrentPage(1)}
    onDone={() => {
      setCurrentPage(3);
    }}
    floors={floors}
    proposal_id={proposal_id}
  />
)}


        {currentPage === 3 && renderDimensionInput()}
      </div>
    </div>
  );
};

export default AddQtoModal;
