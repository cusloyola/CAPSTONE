import React, { useState, useEffect } from "react";
import MUCInputForm from "../MUCInputForm";

const MtoInput = ({ parent, onBack, onDone }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchWithVolumes = async () => {
      let items = [];

      // ✅ Step 1: Get checked children (if any)
      if (parent?.children?.length) {
        items = parent.children.filter(child => child.checked);
      } else if (parent?.checked) {
        // If parent is checked and has no children, consider parent itself
        items = [parent];
      }

      console.log("✅ Step 1 - Initial checked items:", items);

      // ❗ No checked items or missing proposal_id? Exit early, but set items
      if (items.length === 0 || !parent?.proposal_id) {
        console.warn("⚠ No checked items or missing proposal_id. Skipping QTO fetch.");
        // Set selectedItems to the initially determined items, even if empty,
        // so MUCInputForm gets a consistent array.
        setSelectedItems(items);
        return;
      }

      // ✅ Step 2: Fetch QTO volumes from backend
      try {
        console.log("📡 Fetching QTO from API for proposal_id =", parent.proposal_id);

        const res = await fetch(
          `http://localhost:5000/api/mto/qto-children-by-proposal?proposal_id=${parent.proposal_id}`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        console.log("📦 QTO API Response:", data);

        if (!Array.isArray(data.data)) {
          console.warn("⚠ QTO response malformed or empty data array.");
          // Set selectedItems to initial items on malformed response
          setSelectedItems(items);
          return;
        }

        // ✅ Step 3: Map work_item_id to total_volume
        const volumeMap = {};
        data.data.forEach(entry => {
          // Ensure total_volume is a number from the API, if not, parse it
          volumeMap[entry.work_item_id] = parseFloat(entry.total_volume);
        });

        console.log("📊 Volume map (work_item_id => total_volume):", volumeMap);

        // ✅ Step 4: Attach total_volume to selectedItems
        const updatedItems = items.map(item => {
          const volume = volumeMap[item.work_item_id];
          if (volume === undefined || isNaN(volume)) { // Check for undefined and NaN
            console.warn(`🚫 No valid QTO volume found for work_item_id=${item.work_item_id}. Defaulting to 0.`);
          }
          return {
            ...item,
            // Ensure total_volume is always a number (default to 0 if not found or NaN)
            total_volume: isNaN(volume) ? 0 : volume,
          };
        });

        console.log("📌 Updated selectedItems with total_volume:", updatedItems);
        setSelectedItems(updatedItems);
      } catch (err) {
        console.error("❌ QTO fetch error:", err);
        // On error, still provide the initial items to the form
        setSelectedItems(items);
      }
    };

    fetchWithVolumes();
  }, [parent]); // Dependency on 'parent' ensures re-fetch when parent changes

  const handleSubmitMTO = () => {
    console.log("📤 Submitting Final MTO Items:", selectedItems);
    alert("✅ MTO submitted (mock only)");
    onDone();
  };

 return (
  <div className="flex flex-col h-full overflow-hidden">
    {/* Header */}
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Material Take-Off (MTO)
      </h2>
      <p className="text-base text-gray-600 dark:text-gray-300">
        <span className="font-semibold">{parent?.item_title}</span> —{" "}
        {parent?.category || "General Items"}
      </p>
    </div>

    {/* Scrollable Form */}
    <div className="flex-1 overflow-y-auto px-4">
      <MUCInputForm selectedItems={selectedItems} onUpdateItems={setSelectedItems} />
    </div>

    {/* Fixed Footer */}
    <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ◀ Back to Children
        </button>
        <button
          onClick={handleSubmitMTO}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save MTO ▶
        </button>
      </div>
    </div>
  </div>
);

};

export default MtoInput;