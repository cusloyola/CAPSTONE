import React, { useState, useEffect } from "react";

const TaskTable = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [newTask, setNewTask] = useState({
        task_name: "",
        start_date: "",
        end_date: "",
        status: "",
        project_id: ""
    });
    const [editingTask, setEditingTask] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const mockProjects = [
            { project_id: "1", project_name: "Project Alpha" },
            { project_id: "2", project_name: "Project Beta" },
        ];

        const mockTasks = [
            {
                id: 1,
                task_name: "Foundation Work",
                start_date: "2025-04-01",
                end_date: "2025-04-10",
                status: "In Progress",
                project_id: "1",
                project_name: "Project Alpha"
            },
            {
                id: 2,
                task_name: "Roof Installation",
                start_date: "2025-04-11",
                end_date: "2025-04-20",
                status: "Pending",
                project_id: "2",
                project_name: "Project Beta"
            }
        ];

        setProjects(mockProjects);
        setTasks(mockTasks);
    }, []);

    const handleAddTask = () => {
        const selectedProject = projects.find(p => p.project_id === newTask.project_id);
        const newId = tasks.length + 1;
        const newTaskWithId = {
            ...newTask,
            id: newId,
            project_name: selectedProject?.project_name || "N/A"
        };
        setTasks([...tasks, newTaskWithId]);
        setNewTask({ task_name: "", start_date: "", end_date: "", status: "", project_id: "" });
        setShowModal(false);
    };

    const handleDeleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const handleUpdateTask = () => {
        const updated = tasks.map(task =>
            task.id === editingTask.id
                ? {
                    ...editingTask,
                    project_name: projects.find(p => p.project_id === editingTask.project_id)?.project_name || "N/A"
                }
                : task
        );
        setTasks(updated);
        setEditingTask(null);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Task Scheduler</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Task
                </button>
            </div>

            <table className="min-w-full divide-y divide-gray-200 shadow rounded overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Task Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Start Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">End Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Project</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                        <tr key={task.id}>
                            <td className="px-4 py-2">{task.task_name}</td>
                            <td className="px-4 py-2">{task.start_date}</td>
                            <td className="px-4 py-2">{task.end_date}</td>
                            <td className="px-4 py-2">{task.status}</td>
                            <td className="px-4 py-2">{task.project_name}</td>
                            <td className="px-4 py-2 text-right space-x-2">
                                <button onClick={() => setEditingTask(task)} className="text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => handleDeleteTask(task.id)} className="text-red-600 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            {(showModal || editingTask) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">{editingTask ? "Edit Task" : "Add New Task"}</h3>
                        <input
                            type="text"
                            placeholder="Task Name"
                            className="w-full border p-2 rounded mb-2"
                            value={editingTask ? editingTask.task_name : newTask.task_name}
                            onChange={(e) => {
                                const val = e.target.value;
                                editingTask
                                    ? setEditingTask({ ...editingTask, task_name: val })
                                    : setNewTask({ ...newTask, task_name: val });
                            }}
                        />
                        <input
                            type="date"
                            className="w-full border p-2 rounded mb-2"
                            value={editingTask ? editingTask.start_date : newTask.start_date}
                            onChange={(e) => {
                                const val = e.target.value;
                                editingTask
                                    ? setEditingTask({ ...editingTask, start_date: val })
                                    : setNewTask({ ...newTask, start_date: val });
                            }}
                        />
                        <input
                            type="date"
                            className="w-full border p-2 rounded mb-2"
                            value={editingTask ? editingTask.end_date : newTask.end_date}
                            onChange={(e) => {
                                const val = e.target.value;
                                editingTask
                                    ? setEditingTask({ ...editingTask, end_date: val })
                                    : setNewTask({ ...newTask, end_date: val });
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Status"
                            className="w-full border p-2 rounded mb-2"
                            value={editingTask ? editingTask.status : newTask.status}
                            onChange={(e) => {
                                const val = e.target.value;
                                editingTask
                                    ? setEditingTask({ ...editingTask, status: val })
                                    : setNewTask({ ...newTask, status: val });
                            }}
                        />
                        <select
                            className="w-full border p-2 rounded mb-4"
                            value={editingTask ? editingTask.project_id : newTask.project_id}
                            onChange={(e) => {
                                const val = e.target.value;
                                editingTask
                                    ? setEditingTask({ ...editingTask, project_id: val })
                                    : setNewTask({ ...newTask, project_id: val });
                            }}
                        >
                            <option value="">Select a Project</option>
                            {projects.map((project) => (
                                <option key={project.project_id} value={project.project_id}>
                                    {project.project_name}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingTask(null);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingTask ? handleUpdateTask : handleAddTask}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                {editingTask ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskTable;
