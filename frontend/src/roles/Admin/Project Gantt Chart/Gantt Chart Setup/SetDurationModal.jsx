import React, { useState, useEffect } from "react";
import SetDurationCompute from "./SetDurationCompute";

const SetDurationModal = ({ isOpen, onClose, tasks, setTasks, project_id }) => {
    const [durations, setDurations] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCompute, setShowCompute] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const SOW_API_URL = "http://localhost:5000/api/gantt-chart/work-details";

    useEffect(() => {
        if (!isOpen) return;

        const fetchWorkDetails = async () => {
            try {
                const res = await fetch(`${SOW_API_URL}?project_id=${project_id}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    const filtered = data.filter(item => Number(item.amount) > 0);
                    const mappedData = filtered.map(item => ({
                        itemId: item.sow_proposal_id,
                        description: item.item_title,
                        category: "Placeholder Category",
                        // FIX: Add the work_item_id here
                        work_item_id: item.work_item_id,
                    }));

                    setDurations(mappedData);
                }
            } catch (err) {
                console.error("Failed to fetch work details:", err);
            }
        };

        fetchWorkDetails();
    }, [isOpen, project_id]);

    const handleSelect = (item) => setSelectedTask(item);

    const handleContinue = () => {
        if (!selectedTask) return;
        setShowCompute(true);
    };

    const filteredWorkItems = durations.filter(item => {
        const matchesSearch =
            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            !categoryFilter || item.category?.toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const workTypes = [...new Set(durations.map(item => item.category).filter(Boolean))];

    if (!isOpen) return null;

    if (showCompute) return (
        <SetDurationCompute
            isOpen={showCompute}
            onClose={() => setShowCompute(false)}
            task={selectedTask}
            tasks={tasks}
            setTasks={setTasks}
            projectId={project_id}
        />
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-[99999]">
            <div
                className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
                onClick={onClose}
            />
            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-[800px] max-h-[90vh] shadow-xl z-10 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute right-3 top-3">✕</button>
                <h2 className="text-2xl font-semibold mb-4">Select Scope of Work Items</h2>

                <div className="flex items-center gap-4 mb-6 mt-4">
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
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
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded flex-1"
                    />
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto">
                    {filteredWorkItems.map(d => (
                        <li
                            key={d.itemId}
                            onClick={() => handleSelect(d)}
                            className={`cursor-pointer border rounded-lg p-4 flex flex-col ${selectedTask?.itemId === d.itemId ? "bg-blue-600 text-white" : "bg-gray-50 dark:bg-gray-700"
                                }`}
                        >
                            <div className="font-medium text-lg">{d.description}</div>
                            <div className="text-sm">{d.category}</div>
                        </li>
                    ))}
                </ul>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400">Cancel</button>
                    <button onClick={handleContinue} className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Continue</button>
                </div>
            </div>
        </div>
    );
};

export default SetDurationModal;