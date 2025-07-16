import React, { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';

import { useModal } from "../../../../../hooks/useModal";
import { Modal } from "../../../../../components/ui/modal";
import Button from "../../../../../components/ui/button/Button";
import Input from "../../../../../components/form/input/InputField";
import Label from "../../../../../components/form/Label";

/**
 * @typedef {object} Project1
 * @property {number} project_id
 * @property {number} client_id
 * @property {number} user_id
 * @property {string} project_name
 * @property {string} location
 * @property {string} locationArea
 * @property {string} priority
 * @property {string} ProjectManager
 * @property {string} start_date
 * @property {string} end_date
 * @property {string} status
 * @property {number} budget
 * @property {number} actual_cost
 * @property {number} progress_percent
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string | null} completed_at
 * @property {number} category_id
 * @property {string} [client_name]
 * @property {string} [client_contact]
 * @property {string} [projectCategory]
 */

// API endpoint for projects
const PROJECTS_API_URL = "http://localhost:5000/api/projects/";

// Inline Toast Message Component for React-friendly notifications
/**
 * @typedef {object} ToastMessageProps
 * @property {string} message
 * @property {'success' | 'error' | 'info'} type
 * @property {() => void} onClose
 */

/**
 * @param {ToastMessageProps} props
 */
const ToastMessage = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            onClose();
        }, 3000);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [onClose]);

    return (
        <div className={`fixed inset-x-0 bottom-6 mx-auto ${bgColor} text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center justify-center w-fit animate-fade-in-up`}>
            {message}
            <button onClick={onClose} className="ml-4 text-white font-bold text-lg" aria-label="Close notification">&times;</button>
        </div>
    );
};

const InProgressProjectTable = () => {
    /** @type {[Project[], React.Dispatch<React.SetStateAction<Project[]>>]} */
    const [projects, setProjects] = useState([]);
    /** @type {[Project[], React.Dispatch<React.SetStateAction<Project[]>>]} */
    const [filteredProjects, setFilteredProjects] = useState([]);

    const { isOpen, openModal, closeModal } = useModal();
    /** @type {[Project | null, React.Dispatch<React.SetStateAction<Project | null>>]} */
    const [editingProject, setEditingProject] = useState(null);
    /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
    const [isSaving, setIsSaving] = useState(false);
    /** @type {[({ message: string; type: 'success' | 'error' | 'info' } | null), React.Dispatch<React.SetStateAction<({ message: string; type: 'success' | 'error' | 'info' } | null)>]} */
    const [toast, setToast] = useState(null);

    // State for editable fields in the modal
    const [editProjectName, setEditProjectName] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editPriority, setEditPriority] = useState('');
    const [editProjectManager, setEditProjectManager] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [editBudget, setEditBudget] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editClientName, setEditClientName] = useState('');
    const [editClientContact, setEditClientContact] = useState('');
    const [editProjectCategory, setEditProjectCategory] = useState('');

    // Ref for modal's first focusable element
    const firstInputRef = useRef(null);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState("");
    const [clientFilter, setClientFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [projectmanagerFilter, setProjectManagerFilter] = useState("");
    const [search, setSearch] = useState("");

    // Pagination
    const [entriesPerPage, setEntriesPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    const visibleProjects = filteredProjects.slice(startIdx, endIdx);
    const totalPages = Math.ceil(filteredProjects.length / entriesPerPage);

    // Unique filter options
    const categories = [...new Set(projects.map(p => p.projectCategory).filter(Boolean))];
    const clientNames = [...new Set(projects.map(p => p.client_name).filter(Boolean))];
    const priorities = [...new Set(projects.map(p => p.priority).filter(Boolean))];
    const projectManagers = [...new Set(projects.map(p => p.ProjectManager).filter(Boolean))]; // Corrected to ProjectManager

    // Fetch projects on component mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(PROJECTS_API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                /** @type {Project[]} */
                const data = await response.json();
                const inProgressProjects = data.filter(p => p.status?.toLowerCase() === "in progress");
                setProjects(inProgressProjects);
                setFilteredProjects(inProgressProjects);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                setToast({ message: `Failed to load projects: ${err.message}`, type: 'error' });
            }
        };
        fetchProjects();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let filtered = projects;

        filtered = filtered.filter(p => p.status?.toLowerCase() === "in progress");

        if (categoryFilter) {
            filtered = filtered.filter((p) =>
                p.projectCategory?.toLowerCase().includes(categoryFilter.toLowerCase())
            );
        }

        if (clientFilter) {
            filtered = filtered.filter((p) =>
                p.client_name?.toLowerCase().includes(clientFilter.toLowerCase())
            );
        }

        if (priorityFilter) {
            filtered = filtered.filter((p) =>
                p.priority?.toLowerCase().includes(priorityFilter.toLowerCase())
            );
        }

        if (projectmanagerFilter) {
            filtered = filtered.filter((p) =>
                p.ProjectManager?.toLowerCase().includes(projectmanagerFilter.toLowerCase())
            );
        }

        if (search) {
            filtered = filtered.filter((p) =>
                p.project_name.toLowerCase().includes(search.toLowerCase()) ||
                p.location.toLowerCase().includes(search.toLowerCase()) ||
                p.ProjectManager.toLowerCase().includes(search.toLowerCase()) ||
                p.client_name.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredProjects(filtered);
        setCurrentPage(1); // Reset to first page on filter change
    }, [categoryFilter, clientFilter, priorityFilter, projectmanagerFilter, search, projects]);

    // Effect for modal focus management
    useEffect(() => {
        if (isOpen && firstInputRef.current) {
            firstInputRef.current.focus();
        }
    }, [isOpen]);

    // Handle Escape key to close modal
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        // Initialize modal fields with fetched data
        setEditProjectName(project.project_name || '');
        setEditLocation(project.location || '');
        setEditPriority(project.priority || '');
        setEditProjectManager(project.ProjectManager || '');
        setEditStartDate(project.start_date && !isNaN(new Date(project.start_date).getTime()) ? new Date(project.start_date).toISOString().split('T')[0] : '');
        setEditEndDate(project.end_date && !isNaN(new Date(project.end_date).getTime()) ? new Date(project.end_date).toISOString().split('T')[0] : '');
        setEditBudget(project.budget?.toString() || '');
        setEditStatus(project.status || '');
        setEditClientName(project.client_name || '');
        setEditClientContact(project.client_contact || '');
        setEditProjectCategory(project.projectCategory || '');
        openModal();
    };

    const handleSave = async () => {
        if (!editingProject || isSaving) return;

        const parsedBudget = parseFloat(editBudget);
        if (isNaN(parsedBudget)) {
            setToast({ message: "Budget must be a valid number.", type: 'error' });
            return;
        }

        const startDateObj = new Date(editStartDate);
        const endDateObj = new Date(editEndDate);
        if (editStartDate && editEndDate && startDateObj.getTime() > endDateObj.getTime()) {
            setToast({ message: "End Date cannot be before Start Date.", type: 'error' });
            return;
        }

        const hasChanged =
            editProjectName !== editingProject.project_name ||
            editLocation !== editingProject.location ||
            editPriority !== editingProject.priority ||
            editProjectManager !== editingProject.ProjectManager ||
            (editStartDate !== (editingProject.start_date ? new Date(editingProject.start_date).toISOString().split('T')[0] : '') && startDateObj.getTime() !== (editingProject.start_date ? new Date(editingProject.start_date).getTime() : NaN)) ||
            (editEndDate !== (editingProject.end_date ? new Date(editingProject.end_date).toISOString().split('T')[0] : '') && endDateObj.getTime() !== (editingProject.end_date ? new Date(editingProject.end_date).getTime() : NaN)) ||
            parsedBudget !== editingProject.budget ||
            editStatus !== editingProject.status ||
            editClientName !== editingProject.client_name ||
            editClientContact !== editingProject.client_contact ||
            editProjectCategory !== editingProject.projectCategory;

        if (!hasChanged) {
            setToast({ message: "No changes to save.", type: 'info' });
            closeModal();
            return;
        }

        setIsSaving(true);
        const updatedData = {
            ...editingProject,
            project_name: editProjectName,
            location: editLocation,
            priority: editPriority,
            ProjectManager: editProjectManager,
            start_date: editStartDate,
            end_date: editEndDate,
            budget: parsedBudget,
            status: editStatus,
            client_name: editClientName,
            client_contact: editClientContact,
            projectCategory: editProjectCategory,
        };

        try {
            const response = await fetch(`${PROJECTS_API_URL}${editingProject.project_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Failed to update project: ${response.status}. ${errorBody.message || ''}`);
            }

            /** @type {Project} */
            const result = await response.json();
            setProjects((prev) =>
                prev.map((proj) =>
                    proj.project_id === result.project_id ? result : proj
                )
            );
            setToast({ message: "Project updated successfully!", type: 'success' });
            closeModal();
        } catch (err) {
            console.error("Error updating project:", err);
            setToast({ message: `Failed to update project: ${err.message}`, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="p-4 space-y-6 bg-white shadow rounded">

                {/* Section 1: Header */}
                <div className="bg-blue-600 text-white flex justify-between items-center p-4 rounded">
                    <h1 className="text-lg font-semibold">List of all in progress projects</h1>
                    <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100">
                        Add New Project
                    </button>
                </div>

                {/* Section 2: Filters */}
                <div className="flex flex-wrap gap-4">

                    {/* Project Category Filter Group */}
                    <div className="flex flex-col gap-2">
                        <label className="block font-medium text-gray-700">
                            Project Category:
                        </label>
                        <select
                            id="projectCategory"
                            className="border p-2 rounded w-48"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">All Project Categories</option>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Client Filter Group */}
                    <div className="flex flex-col gap-2">
                        <label className="block font-medium text-gray-700">
                            Client:
                        </label>
                        <select
                            value={clientFilter}
                            onChange={(e) => setClientFilter(e.target.value)}
                            className="border p-2 rounded w-48"
                        >
                            <option value="">All Clients</option>
                            {clientNames.map((client, idx) => (
                                <option key={idx} value={client}>
                                    {client}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority Filter Group */}
                    <div className="flex flex-col gap-2">
                        <label className="block font-medium text-gray-700">
                            Priorities:
                        </label>
                        <select
                            id="prioritySelect"
                            className="border p-2 rounded w-48"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="">All Priorities</option>
                            {priorities.map((priority, index) => (
                                <option key={index} value={priority}>
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* Project Manager Filter Group */}
                    <div className="flex flex-col gap-2">
                        <label className="block font-medium text-gray-700">
                            Project Manager:
                        </label>
                        <select
                            id="projectManagerSelect"
                            className="border p-2 rounded w-48"
                            value={projectmanagerFilter}
                            onChange={(e) => setProjectManagerFilter(e.target.value)}
                        >
                            <option value="">All Project Managers</option>
                            {projectManagers.map((pm, index) => (
                                <option key={index} value={pm}>
                                    {pm}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <label className="text-sm">
                            Show
                            <select
                                className="mx-2 border p-1 rounded"
                                value={entriesPerPage}
                                onChange={(e) => {
                                    setEntriesPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={1}>1</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            entries
                        </label>
                    </div>
                    <div className="flex items-center gap-2"> <label className="block font-medium text-gray-700">
                        Search:
                    </label>
                        <input
                            id="searchInput"
                            type="text"
                            className="border p-2 rounded w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Section 4: Table */}
                <table className="table-auto w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2 text-left">Project Name</th>
                            <th className="border px-4 py-2 text-left">Project Category</th>
                            <th className="border px-4 py-2 text-left">Project Manager</th>
                            <th className="border px-4 py-2 text-left">Client Name</th>
                            <th className="border px-4 py-2 text-left">Client Contacts</th>
                            <th className="border px-4 py-2 text-left">Priority</th>
                            <th className="border px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleProjects.length > 0 ? (
                            visibleProjects.map((project) => (
                                <tr key={project.project_id}>
                                    <td className="border px-4 py-2">
                                        {project.project_id && (
                                            <Link
                                                to={`/InProgressProjectTable/${project.project_id}/profile`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {project.project_name}
                                            </Link>
                                        )}
                                    </td>
                                    <td className="border px-4 py-2">{project.projectCategory}</td>
                                    <td className="border px-4 py-2">{project.ProjectManager || 'N/A'}</td>
                                    <td className="border px-4 py-2">{project.client_name}</td>
                                    <td className="border px-4 py-2">{project.client_contact}</td>
                                    <td className="border px-4 py-2">{project.priority}</td>
                                    <td className="border px-4 py-2">
                                        <div className="flex gap-x-2">
                                            <button
                                                onClick={() => handleEditClick(project)}
                                                className="bg-yellow-500 text-white px-6 h-10 rounded hover:bg-yellow-700"
                                            >
                                                Edit
                                            </button>
                                            <button className="bg-red-600 text-white px-6 h-10 rounded hover:bg-red-700">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center border px-4 py-2">
                                    No projects found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                    <p>
                        Showing {startIdx + 1} to {Math.min(endIdx, filteredProjects.length)} of {filteredProjects.length} entries
                    </p>

                    <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Project Modal */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4" aria-modal="true" role="dialog" onKeyDown={handleKeyDown}>
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Project Information
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Update project details.
                        </p>
                    </div>
                    <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div>
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    General Information
                                </h5>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div>
                                        <Label htmlFor="editProjectName">Project Name</Label>
                                        <Input
                                            id="editProjectName"
                                            type="text"
                                            value={editProjectName}
                                            onChange={(e) => setEditProjectName(e.target.value)}
                                            aria-label="Edit Project Name"
                                            required
                                            ref={firstInputRef}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editProjectCategory">Project Category</Label>
                                        <Input
                                            id="editProjectCategory"
                                            type="text"
                                            value={editProjectCategory}
                                            onChange={(e) => setEditProjectCategory(e.target.value)}
                                            aria-label="Edit Project Category"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editLocation">Location</Label>
                                        <Input
                                            id="editLocation"
                                            type="text"
                                            value={editLocation}
                                            onChange={(e) => setEditLocation(e.target.value)}
                                            aria-label="Edit Location"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editPriority">Priority</Label>
                                        <Input
                                            id="editPriority"
                                            type="text"
                                            value={editPriority}
                                            onChange={(e) => setEditPriority(e.target.value)}
                                            aria-label="Edit Priority"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editProjectManager">Project Manager</Label>
                                        <Input
                                            id="editProjectManager"
                                            type="text"
                                            value={editProjectManager}
                                            onChange={(e) => setEditProjectManager(e.target.value)}
                                            aria-label="Edit Project Manager"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editStartDate">Start Date</Label>
                                        <Input
                                            id="editStartDate"
                                            type="date"
                                            value={editStartDate}
                                            onChange={(e) => setEditStartDate(e.target.value)}
                                            aria-label="Edit Start Date"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editEndDate">End Date</Label>
                                        <Input
                                            id="editEndDate"
                                            type="date"
                                            value={editEndDate}
                                            onChange={(e) => setEditEndDate(e.target.value)}
                                            aria-label="Edit End Date"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editBudget">Budget</Label>
                                        <Input
                                            id="editBudget"
                                            type="number"
                                            value={editBudget}
                                            onChange={(e) => setEditBudget(e.target.value)}
                                            aria-label="Edit Budget"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editStatus">Status</Label>
                                        <Input
                                            id="editStatus"
                                            type="text"
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value)}
                                            aria-label="Edit Status"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editClientName">Client Name</Label>
                                        <Input
                                            id="editClientName"
                                            type="text"
                                            value={editClientName}
                                            onChange={(e) => setEditClientName(e.target.value)}
                                            aria-label="Edit Client Name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editClientContact">Client Contact</Label>
                                        <Input
                                            id="editClientContact"
                                            type="text"
                                            value={editClientContact}
                                            onChange={(e) => setEditClientContact(e.target.value)}
                                            aria-label="Edit Client Contact"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={closeModal} type="button">
                                Close
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving} type="submit">
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {toast && (
                <ToastMessage
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default InProgressProjectTable;
