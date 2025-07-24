import React, { useState, useEffect } from "react";
import QtoParentList from "../../QuantityTakeOff/QtoParentList";
import QtoChildSelector from "../../QuantityTakeOff/QtoChildSelector";
import MtoInput from "../MaterialTakeOff/MtoInput";
import MtoRebarInput from "../MaterialTakeOff/MtoRebarInput";


const QTO_API_VOLUME = "http://localhost:5000/api/sowproposal/sow-work-items/sow-table/";

const AddModalMUC = ({ proposal_id, onClose, onBack, onDone }) => {
  const [workItems, setWorkItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // 1 = list, 2 = MUC input
  const [categoryFilter, setCategoryFilter] = useState("");
  const [previousPage, setPreviousPage] = useState(null);

  function buildTree(items) {
    const map = {};
    const roots = [];

    items.forEach(item => {
      map[item.work_item_id] = { ...item, children: [] };
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

  useEffect(() => {
    fetch(`${QTO_API_VOLUME}?proposal_id=${proposal_id}`)
      .then(res => res.json())
      .then(data => {
        const { workItems } = data;
        if (Array.isArray(workItems)) {
          const tree = buildTree(workItems);
          setWorkItems(tree);
        } else {
          setWorkItems([]);
        }
      })
      .catch(err => {
        console.error("Error fetching work items:", err);
        setWorkItems([]);
      });
  }, [proposal_id]);

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
            onSelectParent={(parentItemFromList) => {
              const fullParent = {
                ...workItems.find(item => item.work_item_id === parentItemFromList.work_item_id),
                proposal_id: proposal_id
              };

              setSelectedParent(fullParent);

              if (fullParent.compute_type === "rebar") {
                setPreviousPage(1);  // or whatever page you want to go back to
                setCurrentPage(4);

              } else {
                setCurrentPage(2);
              }
            }}

          />


        )}

        {currentPage === 2 && selectedParent && (
          <QtoChildSelector
            mode="muc"
            parent={selectedParent}
            setParent={setSelectedParent} // QtoChildSelector can modify selectedParent (e.g., set 'checked')
            onBack={() => setCurrentPage(1)}
            onDone={() => {
              setCurrentPage(3);
            }}
            floors={[]}
            proposal_id={proposal_id} // QtoChildSelector might also need this, good to pass
          />
        )}


        {currentPage === 3 && selectedParent && (
          <MtoInput
            parent={selectedParent}
            onBack={() => setCurrentPage(2)}
            onDone={onClose}
          />
        )}

        {currentPage === 4 && selectedParent && (
          <MtoRebarInput
            parent={selectedParent}
            onBack={() => setCurrentPage(previousPage)} // ✅ Pass correct onBack
            onDone={onClose}
          />
        )}






      </div>
    </div>
  );
};

export default AddModalMUC;