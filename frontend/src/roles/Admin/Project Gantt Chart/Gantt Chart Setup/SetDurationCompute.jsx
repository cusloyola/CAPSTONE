import React, { useState } from "react";
import { useQTO } from "../../../../hooks/useQto";
import { calculateRowTotal } from "../../../../utils/workUtils";
import { toast } from "react-toastify";
import { saveTask } from "../../../../api/ganttChartApi";

const SetDurationCompute = ({ isOpen, onClose, task, tasks, setTasks, projectId, gantt_chart_id }) => {

  const [duration, setDuration] = useState(task?.duration || 0);
  const { rows, setRows, isLoading, fetchError } = useQTO(isOpen, projectId, task);

  if (!isOpen) return null;

  const row = rows[0] || { id: 1, quantity: 0, rate: 1 };

  const handleRateChange = (value) => {
    // Allow numbers and decimals
    let sanitized = value.replace(/[^0-9.]/g, ""); // keep digits and dot
    if (sanitized === "" || sanitized === ".") sanitized = "0"; // default to 0

    let rate = parseFloat(sanitized);

    // Clamp between 0 and 100
    if (isNaN(rate)) rate = 0;
    rate = Math.min(Math.max(rate, 0), 500);

    const updatedRow = { ...row, rate };
    setRows([updatedRow]);
    setDuration(calculateRowTotal(updatedRow));
  };


  const handleSave = async () => {
    try {
      const latestRow = rows[0]; // use current state
      const updatedDuration = calculateRowTotal(latestRow);

      // Optimistically update tasks
      const updatedTasks = tasks.map((t) =>
        t.itemNo === task.itemNo
          ? { ...t, duration: updatedDuration, table: [latestRow] }
          : t
      );
      setTasks(updatedTasks);

      toast.success("Saved Successfully!", { autoClose: 3000 });

      // Send to backend
      await saveTask({
        gantt_chart_id,
        sow_proposal_id: task.itemId,
        work_quantity: latestRow.quantity,
        production_rate: latestRow.rate,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save task!", { autoClose: 3000 });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 backdrop-blur-[32px]"
      onClick={onClose}
    >
      <div
        className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md w-[500px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold">{task?.description}</h2>

        {isLoading && <div className="text-center text-gray-500">Loading...</div>}
        {fetchError && <div className="text-center text-red-500">{fetchError}</div>}

        {!isLoading && !fetchError && (
          <>
            {/* Form-style inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  value={row.quantity}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Production Rate</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}   
                  value={row.rate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <p className="text-gray-500 text-sm mt-1">Enter 1–100 only</p>
              </div>
            </div>

            {/* Total Duration */}
            <div className="col-span-2 mt-2">
              <label className="block mb-1 text-sm">Total Duration:</label>
              <span className="text-green-600 font-bold">
                {duration.toFixed(2)} weeks
              </span>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SetDurationCompute;
