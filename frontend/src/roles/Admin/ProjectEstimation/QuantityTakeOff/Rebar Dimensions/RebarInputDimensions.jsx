import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import CustomRebarInput from './CustomRebarInput';
import SimpleRebarDimensions from './SimpleRebarDimensions';

const RebarInputDimensions = ({
  parent,
  updateChildDimensions = () => {},
  floors = [],
  onBack = () => {},
  onDone = () => {},
}) => {
  const sow_proposal_id = parent?.sow_proposal_id;
  const [rebarDimensions, setRebarDimensions] = useState({});
  const [rebarOptions, setRebarOptions] = useState([]);
  const [simpleRebarRows, setSimpleRebarRows] = useState([]);
  const [customRebarRowsByFloor, setCustomRebarRowsByFloor] = useState({});

  useEffect(() => {
    const initial = {};
    if (parent?.children?.length) {
      parent.children.forEach(child => {
        if (child.checked) {
          initial[child.work_item_id] = child.compute_type === 'simple'
            ? child.simple_item_dimensions || []
            : child.custom_item_dimensions_by_floor || {};
        }
      });
    } else if (parent.checked) {
      initial[parent.work_item_id] = parent.compute_type === 'simple'
        ? parent.simple_item_dimensions || []
        : parent.custom_item_dimensions_by_floor || {};
    }
    setRebarDimensions(initial);
  }, [parent]);

  useEffect(() => {
    const fetchRebarMasterlist = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/rebar/masterlist");
        const data = await res.json();
        setRebarOptions(data);
      } catch (error) {
        console.error("Error fetching rebar masterlist", error);
      }
    };
    fetchRebarMasterlist();
  }, []);

  const handleUpdateParentChildren = (updatedParent, dimensionsData = {}) => {
    setRebarDimensions(prev => ({ ...prev, ...dimensionsData }));
  };

  const selectedItems = parent.children?.length
    ? parent.children.filter(child => child.checked)
    : parent.checked ? [parent] : [];

  const hasCustomChild = selectedItems.some(child => child.compute_type === "custom");
  const hasSimpleChild = selectedItems.some(
    child => child.compute_type === "simple" || !["custom"].includes(child.compute_type)
  );

  const firstSimpleItem = selectedItems.find(item => item.compute_type === 'simple' || !item.compute_type);
  const firstCustomItem = selectedItems.find(item => item.compute_type === 'custom');

  const handleSubmitRebar = async () => {
    const rebar_entries = [];

    // Simple rows
    (simpleRebarRows || []).forEach(item => {
      const {
        work_item_id,
        quantity,
        total_weight,
        location,
        rebar_masterlist_id,
        floor_id,
      } = item;

      if (quantity > 0 && rebar_masterlist_id) {
        rebar_entries.push({
          quantity: parseFloat(quantity),
          total_weight: parseFloat(total_weight || 0),
          rebar_masterlist_id,
          work_item_id,
          location: location || null,
          floor_id: floor_id || null,
        });
      }
    });

    // Custom rows
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
            work_item_id,
            location: location || null,
            floor_id: parseInt(floorId), // ✅ Inject floor_id from floor key
          });
        }
      });
    });

    if (rebar_entries.length === 0) {
      alert("No rebar to submit");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/rebar/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rebar_entries , sow_proposal_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Failed to submit rebar entries: " + data.message);
        return;
      }

      alert("Rebar submitted successfully!");
      onDone();
    } catch (error) {
      console.error("Failed to submit rebars", error);
      alert("An error occurred while submitting rebars.");
    }
  };

  if (selectedItems.length === 0) {
    return (
      <div className="p-4 text-gray-700 dark:text-gray-300">
        <p>No selected items to set dimensions for. Please select some items first.</p>
        <div className="mt-8 flex justify-end">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            ◀ Back
          </button>
        </div>
      </div>
    );
  }

  

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Set Rebar Dimensions</h2>
      <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
        <span className="font-semibold">{parent.item_title}</span> — Rebar Items
      </p>

      {hasCustomChild && firstCustomItem && (
        <CustomRebarInput
          selectedItems={selectedItems}
          updateChildDimensions={handleUpdateParentChildren}
          parent={parent}
          rebarOptions={rebarOptions}
          itemTitle={firstCustomItem.item_title || "Unnamed Item"}
          onRowsChange={setCustomRebarRowsByFloor}
          work_item_id={firstCustomItem.work_item_id}
          floors={floors}
        />
      )}

      {hasSimpleChild && firstSimpleItem && (
        <SimpleRebarDimensions
          selectedItems={selectedItems}
          rebarOptions={rebarOptions}
          parent={parent}
          itemTitle={firstSimpleItem.item_title || "Unnamed Item"}
          onRowsChange={setSimpleRebarRows}
          work_item_id={firstSimpleItem.work_item_id}
          floors={floors} // If needed to assign floor_id in simple mode
        />
      )}

      <div className="mt-8 flex justify-between items-center py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          ◀ Back to Children
        </button>
        <button
          onClick={handleSubmitRebar}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          Done ▶
        </button>
      </div>
    </div>
  );
};

export default RebarInputDimensions;
