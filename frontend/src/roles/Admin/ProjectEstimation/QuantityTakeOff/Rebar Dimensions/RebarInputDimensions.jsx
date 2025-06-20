import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid'; // Make sure uuidv4 is imported here
import CustomRebarInput from './CustomRebarInput';
import SimpleRebarDimensions from './SimpleRebarDimensions';


const RebarInputDimensions = ({
  parent,
  updateChildDimensions = () => { },
  floors = [],
  onBack = () => { },
  onDone = () => { },
}) => {

  const sow_proposal_id = parent?.sow_proposal_id;
  console.log("✅ sow_proposal_id from parent:", sow_proposal_id);

  // Initial state for all rebar dimensions (including simple and custom)
  const initialRebarDimensions = () => {
    if (!parent || !Array.isArray(parent.children)) return {};

    const newDimensions = {};
    parent.children.forEach(child => {
      if (child.checked) {
        if (child.compute_type === 'simple') {
          newDimensions[child.work_item_id] = child.simple_item_dimensions || [];
        } else if (child.compute_type === 'custom') {
          newDimensions[child.work_item_id] = child.custom_item_dimensions_by_floor || {};
        }
      }
    });

    if (parent.checked && !parent.children?.length) {
      if (parent.compute_type === 'simple') {
        newDimensions[parent.work_item_id] = parent.simple_item_dimensions || [];
      } else if (parent.compute_type === 'custom') {
        newDimensions[parent.work_item_id] = parent.custom_item_dimensions_by_floor || {};
      }
    }

    return newDimensions;
  };

  const [rebarDimensions, setRebarDimensions] = useState(initialRebarDimensions);
  const [rebarOptions, setRebarOptions] = useState([]);
  const [simpleRebarRows, setSimpleRebarRows] = useState([]);
  const [customRebarRowsByFloor, setCustomRebarRowsByFloor] = useState({});





  // This useEffect ensures rebarDimensions state is updated when parent prop changes
  useEffect(() => {
    setRebarDimensions(initialRebarDimensions);
  }, [parent]);

  // Fetch rebar options on mount
  useEffect(() => {
    const fetchRebarMasterlist = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/rebar/masterlist");
        const data = await res.json();
        console.log("Rebar masterlist fetched: ", data);
        setRebarOptions(data);
      } catch (error) {
        console.error("Error fetching the masterlist", error);
      }
    };
    fetchRebarMasterlist();
  }, []);

  // Filter selected items for display
  let selectedItems = [];
  if (parent.children?.length) {
    selectedItems = parent.children.filter(child => child.checked);
  } else if (parent.checked) {
    selectedItems = [parent];
  }

  if (selectedItems.length === 0) {
    return (
      <div className="p-4 text-gray-700 dark:text-gray-300">
        <p>No selected items to set dimensions for. Please select some items first.</p>
        <div className="mt-8 flex justify-end">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            ◀ Back
          </button>
        </div>
      </div>
    );
  }

  // This seems to be a generic handler for updating any child dimensions
  const handleUpdateParentChildren = (updatedParent, dimensionsData = {}) => {
    console.log("🛠️ Updating QTO dimensions");
    console.log("📌 updatedParent:", updatedParent);
    console.log("📥 new dimensionsData:", dimensionsData);

    setRebarDimensions(prev => {
      const merged = { ...prev };
      for (const [key, value] of Object.entries(dimensionsData)) {
        merged[key] = value;
      }
      return merged;
    });
  };

  useEffect(() => {
    console.log("🔁 [Rebar] Dimensions state changed:", rebarDimensions);

  }, [rebarDimensions]);


  const firstSimpleItem = selectedItems.find(item => item.compute_type === 'simple' || !item.compute_type);
  const CustomItem = selectedItems.find(item => item.compute_type === 'custom' || !item.compute_type);
  const currentSimpleItemId = firstSimpleItem ? firstSimpleItem.work_item_id : null;
  const hasCustomChild = selectedItems.some(child => child.compute_type === "custom");
  const hasSimpleChild = selectedItems.some(
    child => child.compute_type === "simple" || !["custom"].includes(child.compute_type)
  );

  console.log("📊 floors:", floors);



  const handleSubmitRebar = async () => {
    const rebar_entries = [];

    (simpleRebarRows || []).forEach(item => {
      const {
        work_item_id,
        quantity,
        total_weight,
        location,
        rebar_masterlist_id,
      } = item;


      if (quantity > 0 && rebar_masterlist_id) {
        rebar_entries.push({
          quantity: parseFloat(quantity),
          total_weight: parseFloat(total_weight || 0),
          rebar_masterlist_id,
          work_item_id,
          location: location || null
        });
      }
    });

    Object.entries(customRebarRowsByFloor || {}).forEach(([floorId, rows]) => {
      (rows || []).forEach(item => {
        const {
          quantity,
          total_weight,
          location,
          rebar_masterlist_id,
          work_item_id,

        } = item;

        if (quantity > 0 && rebar_masterlist_id) {
          rebar_entries.push({
            quantity: parseFloat(quantity),
            total_weight: parseFloat(total_weight || 0),
            rebar_masterlist_id,
            location: location || null,
            work_item_id,

          });
        }
      })

    });

    console.log(" Rebars to submit:", rebar_entries);


    if (rebar_entries.length === 0) {
      alert("No rebar to submit");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/rebar/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rebar_entries }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Failed to submit rebar entries" + data.message);
        return;
      }
      alert("Rebar submitted successfully!");
      onDone();
    }

    catch (error) {
      console.error("Failed to submit rebars", error);
      alert("An error while submitting rebars");
    }

  };


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Set Rebar Dimensions</h2>
      <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
        <span className="font-semibold">{parent.item_title}</span> — Rebar Items
      </p>

      {hasCustomChild && (
        <CustomRebarInput
          selectedItems={selectedItems}
          updateChildDimensions={handleUpdateParentChildren}
          parent={parent}
          rebarOptions={rebarOptions}
          itemTitle={CustomItem.item_title || "Unnamed Item"}  // <-- pass here
          onRowsChange={setCustomRebarRowsByFloor}
          work_item_id={CustomItem.work_item_id} // ✅ Add this

          floors={floors}
        />
      )}

      {/* Render SimpleRebarDimensions only if there are simple items */}
      {hasSimpleChild && currentSimpleItemId && (
        <SimpleRebarDimensions
          selectedItems={selectedItems}
          rebarOptions={rebarOptions}
          parent={parent}
          itemTitle={firstSimpleItem.item_title || "Unnamed Item"}  // <-- pass here
          onRowsChange={setSimpleRebarRows}
          work_item_id={firstSimpleItem.work_item_id} // ✅ Add this


        />
      )}

      <div className="mt-8 flex justify-between items-center py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          ◀ Back to Children
        </button>
        <button
          onClick={handleSubmitRebar}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
        >
          Done ▶
        </button>
      </div>
    </div>
  );
};

export default RebarInputDimensions;