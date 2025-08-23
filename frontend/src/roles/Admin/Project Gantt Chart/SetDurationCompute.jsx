import React, { useState, useEffect } from "react";

const SetDurationCompute = ({ isOpen, onClose, task, tasks, setTasks, projectId }) => {
  const [duration, setDuration] = useState(task?.duration || 4);
  const [rows, setRows] = useState([]);
  const [qtoList, setQtoList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const QTO_API_URL = "http://localhost:5000/api/qto/parent-totals";

  useEffect(() => {
    if (!isOpen || !projectId) {
      return;
    }

    const fetchQTO = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const res = await fetch(`${QTO_API_URL}/${projectId}`);

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const { data } = await res.json();
         
    console.log("QTO Data from API:", data); // <-- Add this line
    console.log("Task object received:", task); // <-- Add this line
        setQtoList(data);

        // If task already has table rows, keep them
        if (task?.table) {
          setRows(task.table);
          setDuration(task.duration || 4);
        } else if (data.length > 0) {
          // FINAL FIX: Match using the unique work_item_id
          const match = data.find(q => q.work_item_id === task?.work_item_id);

          console.log("🔎 Matched QTO:", match);
          
          setRows([
            {
              id: Date.now(),
              // quantity will be the correct total from the matched item
              quantity: match ? match.total || 0 : 0,
              rate: 0,
            },
          ]);
        } else {
          setRows([{ id: Date.now(), quantity: 0, rate: 0 }]);
        }
      } catch (err) {
        console.error("❌ Error fetching QTO:", err);
        setFetchError("Failed to load QTO data");
      } finally {
        // This ensures the loading state is always turned off
        setIsLoading(false);
      }
    };

    fetchQTO();
  }, [isOpen, projectId, task]);

  const handleSave = () => {
    const updatedTasks = tasks.map((t) =>
      t.itemId === task.itemId
        ? { ...t, duration, table: rows }
        : t
    );
    setTasks(updatedTasks);
    onClose();
  };

  const handleRowChange = (id, field, value) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: Number(value) } : r));
  };

  const removeRow = (id) => setRows(rows.filter(r => r.id !== id));
  const calculateTotal = (row) => row.quantity / row.rate;
  const calculateGrandTotal = () => rows.reduce((sum, row) => sum + calculateTotal(row), 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 backdrop-blur-[32px]"
      onClick={onClose}
    >
      <div
        className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md w-[700px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold">{task?.description}</h2>
        {isLoading && <div className="text-center text-gray-500">Loading...</div>}
        {fetchError && <div className="text-center text-red-500">{fetchError}</div>}
        {!isLoading && !fetchError && (
          <>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Production Rate</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2">{row.quantity}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={0}
                          value={row.rate}
                          onChange={(e) => handleRowChange(row.id, "rate", e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        {calculateTotal(row).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="text-red-600"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                        No rows yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded"
              >
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