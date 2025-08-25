import React, { useState } from "react";
import { useQTO } from "../../../../hooks/useQto";
import { calculateRowTotal } from "../../../../utils/workUtils";
import { toast } from "react-toastify";
import { saveTask } from "../../../../api/ganttChartApi";

const SetDurationCompute = ({ isOpen, onClose, task, tasks, setTasks, projectId }) => {
  const [duration, setDuration] = useState(task?.duration || 0);
  const { rows, setRows, isLoading, fetchError } = useQTO(isOpen, projectId, task);

  if (!isOpen) return null;

  // Default: first row
  const row = rows[0] || { id: 1, quantity: 0, rate: 0 };

  const handleChange = (field, value) => {
    const updatedRow = { ...row, [field]: Number(value) };
    setRows([updatedRow]);
    setDuration(calculateRowTotal(updatedRow));
  };

 const handleSave = async () => {
  try {
    const payload = {
      sow_proposal_id: task.itemId, 
      work_quantity: row.quantity,
      production_rate: row.rate,
    };

    console.log("Payload to backend:", payload);

    const savedTask = await saveTask(payload);
    console.log("Backend response:", savedTask);

    const updatedTask = { ...task, duration, table: rows };
    const updatedTasks = tasks.map((t) =>
      t.itemId === task.itemId ? updatedTask : t
    );
    setTasks(updatedTasks);

    toast.success("Saved Successfully!", { autoClose: 3000 });
    onClose(); 
  } catch (error) {
    console.error("Save Failed:", error);

    if (error.response) {
      console.error("Server response:", error.response);
    }

    toast.error("Failed to save task!", { autoClose: 3000 });

    // ❗ Optional: close even on failure
    // onClose();
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
                  value={row.rate}
                  onChange={(e) => handleChange("rate", e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Total Duration */}
            <div className="col-span-2">
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
