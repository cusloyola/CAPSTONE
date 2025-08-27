import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { saveTask } from "../../../../api/ganttChartApi";

const SetWeekDurationCompute = ({ isOpen, onClose, task, tasks, setTasks, gantt_chart_id, projectStartDate }) => {
  const [startWeek, setStartWeek] = useState(task?.startWeek || "");
  const duration = task?.duration ? Math.ceil(task.duration) : 0;

  // Reset startWeek whenever a new task is selected
  useEffect(() => {
    setStartWeek(task?.startWeek || "");
  }, [task]);

  // Convert week number to date
  const weekToDate = (week) => {
    const date = new Date(projectStartDate);
    date.setDate(date.getDate() + (week - 1) * 7);
    return date;
  };

 const handleSave = async () => {
  if (!startWeek) return;

  const updatedTasks = tasks.map((t) =>
    t.itemNo === task.itemNo
      ? {
          ...t,
          startWeek: Number(startWeek),
          finishWeek: Number(startWeek) + duration - 1,
        }
      : t
  );
  setTasks(updatedTasks);

  try {
    await saveTask({
      gantt_chart_id,
      sow_proposal_id: task.itemId,
      start_date: Number(startWeek),                     // just an int
      finish_date: Number(startWeek) + duration - 1,     // just an int
    });

    toast.success("Weeks updated successfully!");
    onClose();
  } catch (err) {
    console.error(err);
    toast.error("Failed to update weeks!");
  }
};


  if (!isOpen || !task) return null;

  const handleStartWeekChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // only numbers
    if (value === "") {
      setStartWeek("");
    } else {
      let num = Math.min(Math.max(Number(value), 1), 50);
      setStartWeek(num);
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
        <h2 className="text-2xl font-bold">{task.description}</h2>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block mb-1 text-sm font-medium">Start Week</label>
            <input
              type="number"
              min={1}
              max={50}
              value={startWeek}
              onChange={handleStartWeekChange}
              placeholder="Insert start week"
              className="w-full p-2 border rounded"
            />
            {!startWeek && (
              <p className="text-gray-500 text-sm mt-1">
                Please insert the start week
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Finish Week</label>
            <input
              type="number"
              value={startWeek ? Number(startWeek) + duration - 1 : ""}
              readOnly
              className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="col-span-2">
          <label className="block mb-1 text-sm">Total Duration:</label>
          <span className="text-green-600 font-bold">
            {duration.toFixed(2)} weeks
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!startWeek}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetWeekDurationCompute;
