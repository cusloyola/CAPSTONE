import React, { useState, useEffect } from "react";
import QtoParentList from "./QtoParentList";
import QtoChildSelector from "./QtoChildSelector";
import QtoDimensionInput from "./QTO Dimensions/QtoInputDimensions";

const QTO_API_VOLUME = "http://localhost:5000/api/sowproposal/sow-work-items/sow-table/";

const AddQtoModal = ({ proposal_id, onClose }) => {
  const [workItems, setWorkItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParent, setSelectedParent] = useState(null);
  const [floors, setFloors] = useState([]);


  useEffect(() => {
    fetch(`${QTO_API_VOLUME}?proposal_id=${proposal_id}`)
      .then(res => res.json())
      .then(data => {
        const { workItems, floors } = data;

        if (Array.isArray(workItems)) {
          const tree = buildTree(workItems);
          setWorkItems(tree);
        } else {
          console.error("Expected workItems to be array but got:", workItems);
          setWorkItems([]);
        }

        if (Array.isArray(floors) && floors.length > 0) {
          setFloors(floors); // ✅ store floor list instead of just count
          console.log("Floor codes:", floors.map(f => f.floor_code));
        } else {
          setFloors([{ floor_id: "default", floor_code: "Ground Floor" }]); // fallback
        }

      })
      .catch(err => {
        console.error("Error fetching SOW table:", err);
        setWorkItems([]);
        setFloors(1);
      });
  }, [proposal_id]);

  function buildTree(items) {
    const map = {};
    const roots = [];

    items.forEach(item => {
      map[item.work_item_id] = { ...item, children: [], checked: false, length: "", width: "", height: "" };
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

    // Sync latest children state in selectedParent
    const updatedParent = updated.find(item => item.work_item_id === selectedParent.work_item_id);
    if (updatedParent) setSelectedParent(updatedParent);
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
              parent.floors = floors; // 🔁 embed floors into parent directly
              setSelectedParent(parent);
              setCurrentPage(2);
            }}

          />
        )}

        {currentPage === 2 && selectedParent && (
          <QtoChildSelector
            parent={selectedParent}
            setParent={setSelectedParent}
            toggleChildSelection={toggleChildSelection}
            onBack={() => setCurrentPage(1)}
            onNext={() => setCurrentPage(3)}
            floors={floors}
          />
        )}

        {currentPage === 3 && selectedParent && (
          <>
            {console.log("✅ Final selectedParent on Page 3:", selectedParent)}
            {console.log("✅ Checked children:", selectedParent.children.filter(c => c.checked))}
            <QtoDimensionInput
              parent={selectedParent}
              updateChildDimensions={updateChildDimensions}
              onBack={() => setCurrentPage(2)}
              onDone={onClose}
              floors={floors}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AddQtoModal;
