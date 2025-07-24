// In MtoRebarInput.jsx

import React, { useState, useEffect } from "react";
import MUCInputRebarForm from "../MUCInputRebarForm";

const MtoRebarInput = ({ parent, onBack, onDone }) => {
  const [groupedRebars, setGroupedRebars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formState, setFormState] = useState({});
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchRebarSummary = async () => {
      if (!parent?.proposal_id) return;

      try {
        const res = await fetch(`http://localhost:5000/api/rebar-details/${parent.proposal_id}`);
        if (!res.ok) throw new Error("Failed to fetch rebar summary");

        const json = await res.json();
        const data = json?.data;

        if (Array.isArray(data)) {
          setGroupedRebars(data);
          const initialFormState = data.reduce((acc, rebar) => {
            acc[rebar.rebar_masterlist_id] = [{ multiplier: 1, unit_cost: 0 }]; // Always one row
            return acc;
          }, {});
          setFormState(initialFormState);
        } else {
          setGroupedRebars([]);
          setFormState({});
        }
      } catch (err) {
        console.error("Error fetching rebar data:", err);
        setGroupedRebars([]);
        setFormState({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchRebarSummary();
  }, [parent]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/mto/resources");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("API Raw Resources Data:", data);
        setResources(data.data);
        console.log("Resources State after set:", data.data);
      } catch (error) {
        console.error("Failed to fetch resources", error);
      }
    };

    fetchResources();
  }, []);


  const handleInputChange = (rebarId, rowIndex, field, value) => {
    setFormState(prevFormState => {
      const newRows = [...prevFormState[rebarId]];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        [field]: parseFloat(value) || 0
      };
      return {
        ...prevFormState,
        [rebarId]: newRows
      };
    });
  };

  const calculateGrandTotal = () => {
    let total = 0;
    groupedRebars.forEach(rebar => {
      const row = formState[rebar.rebar_masterlist_id]?.[0]; // Access the first (and only) row
      if (row) {
        const weight = typeof rebar.total_weight === "number" ? rebar.total_weight : 0;
        const actualQty = weight * (row.multiplier || 0);
        const materialCost = actualQty * (row.unit_cost || 0);
        total += materialCost;
      }
    });
    return total;
  };

  const grandTotal = calculateGrandTotal();


  
const handleSubmit = async () => {
  try {
    const payload = [];
    console.log("Sending payload:", payload);


    groupedRebars.forEach(rebar => {
      const row = formState[rebar.rebar_masterlist_id]?.[0];
      if (row) {
        const weight = typeof rebar.total_weight === "number" ? rebar.total_weight : 0;
        const materialCost = weight * row.unit_cost;

        payload.push({
          sow_proposal_id: parent.sow_proposal_id, // ✅ Fix: Now included!
          rebar_masterlist_id: rebar.rebar_masterlist_id,
          resource_id: row.resource_id,
          material_cost: materialCost,
        });
      }
    });

    const response = await fetch(`http://localhost:5000/api/rebar-details/save/${parent.proposal_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resources: payload,
        grand_total: grandTotal
      })
    });

    const result = await response.json();
    if (response.ok) {
      alert("✅ Rebar MTO saved successfully!");
      onDone();
    } else {
      console.error("❌ Server error:", result);
      alert("Failed to save data.");
    }
  } catch (err) {
    console.error("❌ Error submitting:", err);
    alert("Error saving MTO.");
  }
};



  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Rebar Summary (MTO)
        </h2>
        <p className="text-base text-gray-600 dark:text-gray-300">
          <span className="font-semibold">{parent?.item_title}</span> —{" "}
          {parent?.category || "General Items"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <p className="text-gray-500 dark:text-gray-400">⏳ Loading rebar data...</p>
        ) : groupedRebars.length > 0 ? (
          <MUCInputRebarForm
            selectedRebars={groupedRebars}
            formState={formState}
            onChange={handleInputChange}
            grandTotal={grandTotal}
            resources={resources}
          />

        ) : (
          <p className="text-gray-500 dark:text-gray-400">No rebar data available.</p>
        )}
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
onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default MtoRebarInput;