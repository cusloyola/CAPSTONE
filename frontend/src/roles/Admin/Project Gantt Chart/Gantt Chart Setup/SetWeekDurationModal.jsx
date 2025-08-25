import React, { useState } from "react";

const SetWeekDuration = ({ isOpen, onClose, weeks, setWeeks }) => {
  const [weekCount, setWeekCount] = useState(weeks.length);

  const handleSave = () => {
    const updatedWeeks = [];
    for (let i = 1; i <= weekCount; i++) {
      updatedWeeks.push({ label: `W${i}`, weekIndex: i });
    }
    setWeeks(updatedWeeks);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-lg font-bold mb-4">Set Number of Weeks</h2>
        <div className="mb-4">
          <input
            type="number"
            min={1}
            value={weekCount}
            onChange={e => setWeekCount(Number(e.target.value))}
            className="border px-2 py-1 rounded w-full"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetWeekDuration;
