import React, { useState } from "react";
import SetDurationCompute from "./SetDurationCompute";
import SetWeekDurationCompute from "./SetWeekDurationCompute"; 
import { useWorkDetails } from "../../../../hooks/useSOW";
import { filterWorkItems } from "../../../../utils/workUtils";

const SetDurationModal = ({
  isOpen,
  onClose,
  tasks,
  setTasks,
  project_id,
  gantt_chart_id,
  computeType = "duration" // "duration" or "week"
}) => {
  const { workItems, loading, error } = useWorkDetails(isOpen, project_id);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompute, setShowCompute] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

const handleContinue = () => {
  if (!selectedTask) return;

  // Find the corresponding Gantt task
  const taskInGantt = tasks.find(t => t.description === selectedTask.description);

  if (!taskInGantt) {
    alert("Task not found in Gantt tasks");
    return;
  }

  const taskForModal = {
    ...selectedTask, 
    ...taskInGantt,  
  };

  setSelectedTask(taskForModal);
  setShowCompute(true);
};



  const filteredWorkItems = filterWorkItems(workItems, searchTerm, categoryFilter);
  const workTypes = [...new Set(workItems.map(item => item.category).filter(Boolean))];

  if (!isOpen) return null;

  // Render the correct compute modal
  if (showCompute) {
    const computeProps = {
      isOpen: showCompute,
      onClose: () => {
        setShowCompute(false);
        setSelectedTask(null);
        onClose();
      },
      task: selectedTask,
      tasks,
      setTasks,
      projectId: project_id,
      gantt_chart_id
    };

    return computeType === "duration" ? (
      <SetDurationCompute {...computeProps} />
    ) : (
      <SetWeekDurationCompute {...computeProps} />
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-[99999]">
      <div
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
        onClick={onClose}
      />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-[800px] max-h-[90vh] shadow-xl z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-3 top-3">✕</button>
        <h2 className="text-2xl font-semibold mb-4">Select Scope of Work Items</h2>

        <div className="flex items-center gap-4 mb-6 mt-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border p-2 rounded w-48"
          >
            <option value="">All Work Types</option>
            {workTypes.map((type, idx) => (
              <option key={idx} value={type}>{type}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded flex-1"
          />
        </div>

        {loading && <div className="text-center text-gray-500">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto">
            {filteredWorkItems.map((d) => (
              <li
                key={d.itemId}
                onClick={() => setSelectedTask(d)}
                className={`cursor-pointer border rounded-lg p-4 flex flex-col ${
                  selectedTask?.itemId === d.itemId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 dark:bg-gray-700"
                }`}
              >
                <div className="font-medium text-lg">{d.description}</div>
                <div className="text-sm">{d.category}</div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedTask}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetDurationModal;
