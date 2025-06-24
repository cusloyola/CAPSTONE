import React, { useState, useEffect } from "react";
import QtoParentList from "../../QuantityTakeOff/QtoParentList";
import MUCInputForm from "../MUCInputForm";

const QTO_API_VOLUME = "http://localhost:5000/api/sowproposal/sow-work-items/sow-table/";

const AddModalMUC = ({ proposal_id, onClose, onBack, onDone }) => {
  const [workItems, setWorkItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // 1 = list, 2 = MUC input

  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    console.log("🚀 Fetching SOW for proposal_id:", proposal_id);

    fetch(`${QTO_API_VOLUME}?proposal_id=${proposal_id}`)
      .then(res => res.json())
      .then(data => {
        console.log("📦 API Response:", data);
        const { workItems } = data;

        if (Array.isArray(workItems)) {
          // Only show items that are top-level (no parent_id)
          const parentsOnly = workItems.filter(item => !item.parent_id);
          setWorkItems(parentsOnly);
        } else {
          console.error("❌ Expected an array for workItems, got:", workItems);
          setWorkItems([]);
        }
      })
      .catch(err => {
        console.error("❌ Fetch error:", err);
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
            onSelectParent={(parent) => {
              setSelectedParent(parent);
              setCurrentPage(2);
              console.log("📌 Selected parent for MUC input:", parent);
            }}
          />
        )}

        {currentPage === 2 && selectedParent && (
          <MUCInputForm
            parent={selectedParent}
            onBack={() => setCurrentPage(1)}
            onDone={onClose}
          />
        )}




      </div>
    </div>
  );
};

export default AddModalMUC;
