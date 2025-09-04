import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import MUCInputForm from "../MUCInputForm";

const MtoInput = ({ parent, onBack, onDone }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [resources, setResources] = useState([]);
  const [mtoFormState, setMtoFormState] = useState({}); // State to hold form data from MUCInputForm
  const [grandTotals, setGrandTotals] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);


  useEffect(() => {
    const fetchWithVolumes = async () => {
      let items = [];

      if (parent?.children?.length) {
        items = parent.children.filter(child => child.checked);
      } else if (parent?.checked) {
        items = [parent];
      }

      console.log("✅ Step 1 - Initial checked items:", items);

      if (items.length === 0 || !parent?.proposal_id) {
        console.warn("⚠ No checked items or missing proposal_id. Skipping QTO fetch.");
        setSelectedItems(items);
        return;
      }

      try {
        console.log("📡 Fetching QTO from API for proposal_id =", parent.proposal_id);

        const res = await fetch(
          `http://localhost:5000/api/mto/qto-children-by-proposal?proposal_id=${parent.proposal_id}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data.data)) {
          console.warn("⚠ QTO response malformed or empty data array.");
          setSelectedItems(items);
          return;
        }

        const volumeMap = {};
        data.data.forEach(entry => {
          volumeMap[entry.work_item_id] = parseFloat(entry.total_volume);
        });

        const updatedItems = items.map(item => {
          const volume = volumeMap[item.work_item_id];
          if (volume === undefined || isNaN(volume)) {
            console.warn(`🚫 No valid QTO volume found for work_item_id=${item.work_item_id}. Defaulting to 0.`);
          }
          return {
            ...item,
            total_volume: isNaN(volume) ? 0 : volume,
            sow_proposal_id: parent?.sow_proposal_id,   // 👈 inject it here
          };
        });


        console.log("📌 Updated selectedItems with total_volume:", updatedItems);
        setSelectedItems(updatedItems);
      } catch (err) {
        console.error("❌ QTO fetch error:", err);
        setSelectedItems(items);
      }
    };

    fetchWithVolumes();
  }, [parent]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        if (!selectedItems.length) return;

        const firstChild = selectedItems.find(item => item.work_item_id);
        const workItemId = firstChild?.work_item_id;

        const response = await fetch(`http://localhost:5000/api/mto/resources?work_item_id=${workItemId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("✅ All resources fetched:", data.data);

        const usedResourceIds = new Set();
        selectedItems.forEach(item => {
          (item.existing_materials || []).forEach(row => {
            if (row.resource_id) usedResourceIds.add(row.resource_id);
          });
        });

        const filtered = data.data.filter(resource => !usedResourceIds.has(resource.resource_id));
        console.log("🎯 Filtered resources (frontend):", filtered);

        setResources(filtered);
      } catch (error) {
        console.error("Failed to fetch resources", error);
      }
    };

    fetchResources();
  }, [selectedItems]);


  const handleMUCFormChange = useCallback((newFormState) => {
    setMtoFormState(newFormState);
  }, []);

  const generatePayload = useCallback(() => {
    const payload = [];

    selectedItems.forEach(item => {
      const workItemId = item.work_item_id;
      const sowProposalId = item.sow_proposal_id;
      const qto = typeof item.total_volume === "number" ? item.total_volume : 0;
      const parentId = item.parent_id || parent?.work_item_id || null; // 👈 Get parent

      const materialRows = mtoFormState[workItemId] || [];

      materialRows.forEach(row => {
        if (row.resource_id && row.multiplier > 0) {
          const actualQty = qto * row.multiplier;
          const materialCost = actualQty * row.unit_cost;

          payload.push({
            sow_proposal_id: sowProposalId,
            work_item_id: workItemId,
            parent_work_item_id: parentId,
            resource_id: row.resource_id,
            multiplier: row.multiplier,
            actual_qty: parseFloat(actualQty.toFixed(2)),
            material_cost: parseFloat(materialCost.toFixed(2)),
          });
        }
      });
    });

    return payload;
  }, [mtoFormState, selectedItems, parent]);



  const handleSaveMTO = async () => {
    const proposal_id = parent?.proposal_id;
    const materialTakeOff = generatePayload();
    console.log("📦 Generated MTO Payload:", materialTakeOff);

    if (!proposal_id) {
      alert("Error: Proposal ID is missing. Cannot save MTO.");
      return;
    }

    if (materialTakeOff.length === 0) {
      alert("No valid material take-off data to save. Please select materials and multipliers.");
      return;
    }

    const parentTotals = [];
    console.log("📊 Computed Parent Totals:", parentTotals);

    const parentMap = {};

    materialTakeOff.forEach(item => {
      const parentId = parent.work_item_id;
      const key = `${item.sow_proposal_id}-${parentId}`;

      if (!parentMap[key]) {
        parentMap[key] = {
          sow_proposal_id: item.sow_proposal_id,
          work_item_id: parentId,
          mto_parent_grandTotal: 0,
        };
      }

      parentMap[key].mto_parent_grandTotal += item.material_cost;
    });

    Object.values(parentMap).forEach(entry => parentTotals.push(entry));

    try {
      const response = await fetch(`http://localhost:5000/api/mto/save/${proposal_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialTakeOff, parentTotals }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save Material Take-Off");
      }

      alert("Material Take-Off saved successfully! 🎉");
      onDone();
    } catch (error) {
      console.error("Save MTO Error:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };



  if (resources.length === 0 || selectedItems.length === 0) {
    return <div className="p-4">⏳ Loading MTO form...</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Material Take-Off (MTO)
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300">
          <span className="font-semibold">{parent?.item_title}</span> —{" "}
          {parent?.category || "General Items"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <MUCInputForm
          selectedItems={Array.isArray(selectedItems) ? selectedItems : []}
          resources={Array.isArray(resources) ? resources : []}
          onUpdateItems={handleMUCFormChange}
          onUpdateGrandTotals={setGrandTotals}

        />
      </div>

      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ◀ Back to Children
          </button>
          <button
            onClick={handleSaveMTO}
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