import React, { useState, useEffect } from "react";
import SumPerColumnsTable from './SumPerColumnsTable';
import SumPerFloorsCards from './SumPerFloorCards';
import SimpleDimensionCard from './SimpleDimensionCard';
import CustomVolumeInput from './CustomVolumeInput';

const calculateVolume = (length, width, depth, units = 1) => {
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const d = parseFloat(depth) || 0;
  const u = parseFloat(units) || 1;
  return l * w * d * u;
};

const QtoDimensionInput = ({
  parent,
  updateChildDimensions = () => { },
  floors = [],
  onBack = () => { },
  onDone = () => { },
}) => {

  const sow_proposal_id = parent?.sow_proposal_id;
  console.log("✅ sow_proposal_id from parent:", sow_proposal_id);

  const initialQtoDimensions = () => {
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

  const [qtoDimensions, setQtoDimensions] = useState(initialQtoDimensions);


  useEffect(() => {
    setQtoDimensions(initialQtoDimensions());
  }, [parent]);

  if (!parent || floors.length === 0) {
    return <div className="p-4 text-gray-700 dark:text-gray-300">Loading dimensions... Please ensure parent and floor data are provided.</div>;
  }

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
  const handleUpdateParentChildren = (updatedParent, dimensionsData = {}) => {
    console.log("🛠️ Updating QTO dimensions");
    console.log("📌 updatedParent:", updatedParent);
    console.log("📥 new dimensionsData:", dimensionsData);

    setQtoDimensions(prev => {
      const merged = { ...prev };

      for (const [key, value] of Object.entries(dimensionsData)) {
        merged[key] = value; // ✅ merge or replace only that work_item_id
      }

      return merged;
    });
  };

  useEffect(() => {
    console.log("🔁 [QTO] qtoDimensions state changed:", qtoDimensions);
  }, [qtoDimensions]);


  const handleSubmitQTO = async () => {
    const qto_entries = [];
    const totalVolumes = {};

    selectedItems.forEach(item => {
      let total = 0;

      if (
        item.compute_type === "custom" &&
        typeof qtoDimensions[item.work_item_id] === "object"
      ) {
        Object.entries(qtoDimensions[item.work_item_id]).forEach(([floorId, rows]) => {

          rows.forEach(row => {
            const computedValue = calculateVolume(row.length, row.width, row.depth, row.count);
            total += computedValue;

            qto_entries.push({
              sow_proposal_id,
              work_item_id: parseInt(item.work_item_id),
              label: row.label || null,
              length: parseFloat(row.length) || 0,
              width: parseFloat(row.width) || 0,
              depth: parseFloat(row.depth) || 0,
              units: parseFloat(row.count) || 1,
              computed_value: parseFloat(computedValue.toFixed(2)),
              floor_id: parseInt(floorId) || null
            });
          });
        });

      } else if (
        item.compute_type === "simple" &&
        Array.isArray(qtoDimensions[item.work_item_id])
      ) {
        qtoDimensions[item.work_item_id].forEach(row => {
          const computedValue = calculateVolume(row.length, row.width, row.depth, row.count || row.units);
          total += computedValue;

          qto_entries.push({
            sow_proposal_id,
            work_item_id: parseInt(item.work_item_id),
            label: row.label || null,
            length: parseFloat(row.length) || 0,
            width: parseFloat(row.width) || 0,
            depth: parseFloat(row.depth) || 0,
            units: parseFloat(row.count || row.units) || 1,
            computed_value: parseFloat(computedValue.toFixed(2)),
            floor_id: null
          });
        });
      }

      console.log("📌 Submitting QTO - current qtoDimensions:", qtoDimensions);
      console.log("📋 Selected Items:", selectedItems);

      console.log(`🧪 Found ${item.compute_type?.toUpperCase()} item:`, item.work_item_id, qtoDimensions[item.work_item_id]);
      totalVolumes[item.work_item_id] = total;
    });

    console.log("✅ Final QTO Entries (pre-submit):", qto_entries);


    if (qto_entries.length === 0) {
      alert("❌ No QTO entries to submit.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/qto/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qto_entries }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("❌ Failed to submit QTO entries: " + data.message);
        return;
      }

      const totalsPayload = Object.entries(totalVolumes).map(([work_item_id, total_volume]) => ({
        sow_proposal_id,
        work_item_id: parseInt(work_item_id),
        total_volume: parseFloat(total_volume.toFixed(2))
      }));

      const totalsResponse = await fetch("http://localhost:5000/api/qto/save-totals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totals: totalsPayload }),
      });

      const totalsData = await totalsResponse.json();

      if (!totalsResponse.ok) {
        alert("⚠ QTO entries saved, but failed to save totals: " + totalsData.message);
      } else {
        alert("✅ QTO entries and totals submitted successfully!");
      }

      onDone();
    } catch (error) {
      console.error("QTO submission error:", error);
      alert("❌ An error occurred while submitting QTO entries.");
    }

    try {
      const parentTotalsResponse = await fetch("http://localhost:5000/api/qto/save-parent-totals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal_id: sow_proposal_id }),
      });

      const parentTotalsData = await parentTotalsResponse.json();

      if (!parentTotalsResponse.ok) {
        alert("⚠ Child totals saved, but failed to save parent totals: " + parentTotalsData.message);
      } else {
        console.log("✅ Parent totals saved.");
      }
    } catch (error) {
      console.error("❌ Failed to save parent totals:", error);
      alert("❌ An error occurred while saving parent totals.");
    }
  };


  const hasCustomChild = selectedItems.some(child => child.compute_type === "custom");
  const hasSimpleDimensionChild = selectedItems.some(child => child.compute_type === "simple");

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Set Dimensions</h2>
      <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
        <span className="font-semibold">{parent.item_title}</span> — {parent.category || "General Items"}
      </p>
      {hasCustomChild && (
        <CustomVolumeInput
          selectedItems={selectedItems}
          updateChildDimensions={handleUpdateParentChildren}
          parent={parent}
          floors={floors}
        />
      )}
      {hasSimpleDimensionChild && (
        <SimpleDimensionCard
          selectedItems={selectedItems}
          updateChildDimensions={handleUpdateParentChildren}
          parent={parent}
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
          onClick={handleSubmitQTO}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
        >
          Done ▶
        </button>
      </div>
    </div>
  );
};

export default QtoDimensionInput;
