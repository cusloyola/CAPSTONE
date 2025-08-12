import React, { useEffect, useState, useRef } from "react";
import { useModal } from "../../../../hooks/useModal"; // Adjust path as needed
import { Modal } from "../../../../components/ui/modal"; // Adjust path as needed
import Button from "../../../../components/ui/button/Button"; // Adjust path as needed
import Input from "../../../../components/form/input/InputField"; // Adjust path as needed
import Label from "../../../../components/form/Label"; // Adjust path as needed

// Define the Project structure using JSDoc for better readability in JS files
/**
 * @typedef {object} Project
 * @property {number} project_id
 * @property {number} client_id
 * @property {number} user_id
 * @property {string} project_name
 * @property {string} location
 * @property {string} locationArea
 * @property {string} priority
 * @property {string} projectManager
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
 * @property {string} [client_name] // Added client_name
 * @property {string} [floor_labels] // Added floor_labels (as a comma-separated string)
 * @property {string} [projectCategory] // Existing optional field
 */

// API endpoint for projects (used for fetching and updating a single project)
const PROJECT_INFO_API_URL = "http://localhost:5000/api/project-info/"; // Specific endpoint for single project info
const CLIENT_API_URL = "http://localhost/clientInfoController.php"; // PHP endpoint for client updates

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
        <div className={`fixed inset-x-0 bottom-8 mx-auto ${bgColor} text-white px-8 py-4 text-xl rounded-lg shadow-xl z-50 flex items-center justify-center w-fit animate-fade-in-up`}>
            {message}
            <button onClick={onClose} className="ml-5 text-white font-bold text-2xl" aria-label="Close notification">&times;</button>
        </div>
    );
};

/**
 * @param {object} props
 * @param {string} props.project_id - Expecting project_id as a string from URL params
 * @param {() => void} props.onProjectUpdate - Callback to notify parent of update
 */
export default function ProjectInfoDetailedCard({ project_id, onProjectUpdate }) {
    const { isOpen, openModal, closeModal } = useModal();
    /** @type {[Project | null, React.Dispatch<React.SetStateAction<Project | null>>]} */
    const [projectData, setProjectData] = useState(null);
    /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
    const [loading, setLoading] = useState(true);
    /** @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]} */
    const [error, setError] = useState(null);
    /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} */
    const [isSaving, setIsSaving] = useState(false); // To prevent multiple saves
    /** @type {[({ message: string; type: 'success' | 'error' | 'info' } | null), React.Dispatch<React.SetStateAction<({ message: string; type: 'success' | 'error' | 'info' } | null)>]} */
    const [toast, setToast] = useState(null);

    // State for editable fields in the modal
    const [editProjectName, setEditProjectName] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editLocationArea, setEditLocationArea] = useState('');
    const [editPriority, setEditPriority] = useState('');
    const [editProjectManager, setEditProjectManager] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [editBudget, setEditBudget] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editClientName, setEditClientName] = useState(''); // New editable field for client name
    const [editFloorLabels, setEditFloorLabels] = useState(''); // New editable field for floor labels

    // Ref to track if the component is mounted to prevent state updates on unmounted component
    const isMounted = useRef(true);
    // Ref for modal's first focusable element
    const firstInputRef = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchProjectDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${PROJECT_INFO_API_URL}${project_id}`, { signal });
                if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                    throw new Error(`HTTP error! Status: ${response.status}. ${errorBody.message || ''}`);
                }
                /** @type {Project} */
                const data = await response.json();
                if (isMounted.current) {
                    setProjectData(data);
                    // Initialize modal fields with fetched data
                    setEditProjectName(data.project_name || '');
                    setEditLocation(data.location || '');
                    setEditLocationArea(data.locationArea || '');
                    setEditPriority(data.priority || '');
                    setEditProjectManager(data.projectManager || '');
                    setEditStartDate(data.start_date && !isNaN(new Date(data.start_date).getTime()) ? new Date(data.start_date).toISOString().split('T')[0] : '');
                    setEditEndDate(data.end_date && !isNaN(new Date(data.end_date).getTime()) ? new Date(data.end_date).toISOString().split('T')[0] : '');
                    setEditBudget(data.budget?.toString() || '');
                    setEditStatus(data.status || '');
                    setEditClientName(data.client_name || ''); // Initialize client name
                    setEditFloorLabels(data.floor_labels || ''); // Initialize floor labels
                }
            } catch (err) {
                if (isMounted.current && err.name !== 'AbortError') {
                    console.error("Failed to fetch detailed project data:", err);
                    setError(`Failed to load detailed project information: ${err.message}`);
                    setToast({ message: `Failed to load detailed project information: ${err.message}`, type: 'error' });
                }
            } finally {
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        if (project_id) {
            fetchProjectDetails();
        }

        return () => {
            isMounted.current = false;
            controller.abort();
        };
    }, [project_id]);

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

    const handleSave = async () => {
        if (!projectData || isSaving) return;

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

        // Check for changes before attempting to save
        const hasProjectDataChanged =
            editProjectName !== projectData.project_name ||
            editLocation !== projectData.location ||
            editLocationArea !== projectData.locationArea ||
            editPriority !== projectData.priority ||
            editProjectManager !== projectData.projectManager ||
            (editStartDate !== (projectData.start_date ? new Date(projectData.start_date).toISOString().split('T')[0] : '') && startDateObj.getTime() !== (projectData.start_date ? new Date(projectData.start_date).getTime() : NaN)) ||
            (editEndDate !== (projectData.end_date ? new Date(projectData.end_date).toISOString().split('T')[0] : '') && endDateObj.getTime() !== (projectData.end_date ? new Date(projectData.end_date).getTime() : NaN)) ||
            parsedBudget !== projectData.budget ||
            editStatus !== projectData.status;

        const hasClientNameChanged = editClientName !== projectData.client_name;
        const hasFloorLabelsChanged = editFloorLabels !== projectData.floor_labels;

        if (!hasProjectDataChanged && !hasClientNameChanged && !hasFloorLabelsChanged) {
            setToast({ message: "No changes to save.", type: 'info' });
            closeModal();
            return;
        }

        setIsSaving(true);
        let projectUpdateSuccess = false;
        let clientUpdateSuccess = false;
        let floorLabelsUpdateSuccess = true; // Assume success if not explicitly handled by backend

        try {
            // 1. Update Project table fields
            if (hasProjectDataChanged) {
                const updatedProjectData = {
                    project_name: editProjectName,
                    location: editLocation,
                    locationArea: editLocationArea,
                    priority: editPriority,
                    projectManager: editProjectManager,
                    start_date: editStartDate,
                    end_date: editEndDate,
                    status: editStatus,
                    budget: parsedBudget,
                };

                const projectResponse = await fetch(`${PROJECT_INFO_API_URL}${project_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProjectData),
                });

                if (!projectResponse.ok) {
                    const errorBody = await projectResponse.json().catch(() => ({ message: projectResponse.statusText }));
                    throw new Error(`Failed to update project data: ${projectResponse.status}. ${errorBody.message || ''}`);
                }
                projectUpdateSuccess = true;
            } else {
                projectUpdateSuccess = true; // No changes, so consider it successful
            }

            // 2. Update Client Name (if changed)
            if (hasClientNameChanged && projectData.client_id) {
                const updatedClientData = { client_name: editClientName };
                const clientResponse = await fetch(`${CLIENT_API_URL}?id=${projectData.client_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedClientData),
                });

                if (!clientResponse.ok) {
                    const errorBody = await clientResponse.json().catch(() => ({ message: clientResponse.statusText }));
                    throw new Error(`Failed to update client name: ${clientResponse.status}. ${errorBody.message || ''}`);
                }
                clientUpdateSuccess = true;
            } else {
                clientUpdateSuccess = true; // No changes or no client_id, so consider it successful
            }

            // 3. Handle Floor Labels (if changed)
            if (hasFloorLabelsChanged) {
                // IMPORTANT: This part assumes you will have a backend endpoint
                // capable of updating floor_labels in the project_floors table.
                // The current projectInfoController.js does NOT handle this directly.
                // You would need a separate endpoint (e.g., /api/project-floors/:projectId)
                // that accepts an array or comma-separated string of floor labels
                // and updates/replaces entries in the project_floors table accordingly.
                // For now, this will just log a message.
                console.warn("Floor labels changed, but no backend endpoint is implemented to save them to the 'project_floors' table.");
                console.log("New floor labels to save:", editFloorLabels);
                // If you had an endpoint, it would look something like:
                /*
                const floorResponse = await fetch(`/api/project-floors/${project_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ floor_labels: editFloorLabels.split(',').map(s => s.trim()) }),
                });
                if (!floorResponse.ok) {
                    const errorBody = await floorResponse.json().catch(() => ({ message: floorResponse.statusText }));
                    throw new Error(`Failed to update floor labels: ${floorResponse.status}. ${errorBody.message || ''}`);
                }
                floorLabelsUpdateSuccess = true;
                */
            }

            if (isMounted.current) {
                // Update local state with all edited fields after successful API calls
                setProjectData(prevData => ({
                    ...prevData,
                    project_name: editProjectName,
                    location: editLocation,
                    locationArea: editLocationArea,
                    priority: editPriority,
                    projectManager: editProjectManager,
                    start_date: editStartDate,
                    end_date: editEndDate,
                    status: editStatus,
                    budget: parsedBudget,
                    client_name: editClientName, // Update client name in local state
                    floor_labels: editFloorLabels, // Update floor labels in local state
                }));
                if (onProjectUpdate) {
                    onProjectUpdate(); // Notify parent of update
                }
                setToast({ message: "Project updated successfully!", type: 'success' });
                closeModal();
            }
        } catch (err) {
            if (isMounted.current) {
                console.error("Error saving project:", err);
                setToast({ message: `Failed to update project: ${err.message}`, type: 'error' });
            }
        } finally {
            if (isMounted.current) {
                setIsSaving(false);
            }
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-xl text-gray-600 dark:text-gray-400">Loading detailed project information...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-xl text-red-600 dark:text-red-400">Error: {error}</div>;
    }

    if (!projectData) {
        return <div className="text-center py-8 text-xl text-gray-600 dark:text-gray-400">No detailed project data available.</div>;
    }

    return (
        <>
                    {/* <div className="p-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-8"> */}

            <div className="p-6  rounded-2xl dark:border-gray-800 lg:p-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h6 className="text-2xl font-bold text-gray-800 dark:text-white/90 lg:mb-8 uppercase">
                                Project Information
                            {/* {projectData.project_name} */}
                        </h6>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 2xl:gap-x-36">
                            {/* Display only requested fields */}
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Project Name</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{projectData.project_name}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Client Name</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{projectData.client_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Location</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{projectData.location}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Location Area</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{projectData.locationArea || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Priority</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{projectData.priority}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Project Manager</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{projectData.projectManager || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Status</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{projectData.status}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Start Date</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{new Date(projectData.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">End Date</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{new Date(projectData.end_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Budget</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">${projectData.budget?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Actual Cost</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">${projectData.actual_cost?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Progress Percent</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">{projectData.progress_percent}%</p>
                            </div>
                            {/* Floor labels should still span across to handle potentially long lists */}
                            <div className="lg:col-span-3">
                                <p className="mb-2 text-l leading-normal text-gray-500 dark:text-gray-400">Floor Labels</p>
                                <p className="text-l font-medium text-gray-800 dark:text-white/90">
                                    {projectData.floor_labels ? projectData.floor_labels.split(',').map(label => label.trim()).join(', ') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={openModal}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-xl font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                        aria-label="Edit Detailed Project Information"
                    >
                        <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.05470 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.27340 14.6934 5.56629L14.0440 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.63590 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.12620 13.0737 7.25666 13.0030 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                                fill=""
                            />
                        </svg>
                        Edit
                    </button>
                </div>
            </div>
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[750px] m-4" aria-modal="true" role="dialog" onKeyDown={handleKeyDown}>
                <div className="no-scrollbar relative w-full max-w-[750px] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-12">
                    <div className="px-2 pr-16">
                        <h4 className="mb-3 text-3xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Project Information
                        </h4>
                        <p className="mb-7 text-base text-gray-500 dark:text-gray-400 lg:mb-8">
                            Update project details.
                        </p>
                    </div>
                    <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="custom-scrollbar h-[480px] overflow-y-auto px-2 pb-4">
                            <div>
                                <h5 className="mb-6 text-2xl font-medium text-gray-800 dark:text-white/90 lg:mb-8">
                                    General Information
                                </h5>

                                <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3"> {/* Changed to lg:grid-cols-3 here */}
                                    {/* Editable fields */}
                                    <div>
                                        <Label htmlFor="editProjectName" className="text-base">Project Name</Label>
                                        <Input
                                            id="editProjectName"
                                            type="text"
                                            value={editProjectName}
                                            onChange={(e) => setEditProjectName(e.target.value)}
                                            aria-label="Edit Project Name"
                                            required
                                            ref={firstInputRef}
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editClientName" className="text-base">Client Name</Label>
                                        <Input
                                            id="editClientName"
                                            type="text"
                                            value={editClientName}
                                            onChange={(e) => setEditClientName(e.target.value)}
                                            aria-label="Edit Client Name"
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editLocation" className="text-base">Location</Label>
                                        <Input
                                            id="editLocation"
                                            type="text"
                                            value={editLocation}
                                            onChange={(e) => setEditLocation(e.target.value)}
                                            aria-label="Edit Location"
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editLocationArea" className="text-base">Location Area</Label>
                                        <Input
                                            id="editLocationArea"
                                            type="text"
                                            value={editLocationArea}
                                            onChange={(e) => setEditLocationArea(e.target.value)}
                                            aria-label="Edit Location Area"
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editPriority" className="text-base">Priority</Label>
                                        <Input
                                            id="editPriority"
                                            type="text"
                                            value={editPriority}
                                            onChange={(e) => setEditPriority(e.target.value)}
                                            aria-label="Edit Priority"
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editProjectManager" className="text-base">Project Manager</Label>
                                        <Input
                                            id="editProjectManager"
                                            type="text"
                                            value={editProjectManager}
                                            onChange={(e) => setEditProjectManager(e.target.value)}
                                            aria-label="Edit Project Manager"
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editStatus" className="text-base">Status</Label>
                                        <Input
                                            id="editStatus"
                                            type="text"
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value)}
                                            aria-label="Edit Status"
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editStartDate" className="text-base">Start Date</Label>
                                        <Input
                                            id="editStartDate"
                                            type="date"
                                            value={editStartDate}
                                            onChange={(e) => setEditStartDate(e.target.value)}
                                            aria-label="Edit Start Date"
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editEndDate" className="text-base">End Date</Label>
                                        <Input
                                            id="editEndDate"
                                            type="date"
                                            value={editEndDate}
                                            onChange={(e) => setEditEndDate(e.target.value)}
                                            aria-label="Edit End Date"
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editBudget" className="text-base">Budget</Label>
                                        <Input
                                            id="editBudget"
                                            type="number"
                                            value={editBudget}
                                            onChange={(e) => setEditBudget(e.target.value)}
                                            aria-label="Edit Budget"
                                            className="text-lg px-4 py-2"
                                        />
                                    </div>
                                    {/* Actual Cost and Progress Percent are not in the editable modal, but if they were, they'd follow the same pattern */}
                                    <div className="lg:col-span-3"> {/* Floor labels should span all three columns in the modal */}
                                        <Label htmlFor="editFloorLabels" className="text-base">Floor Labels 
                                            {/* (Comma-separated) */}
                                            </Label>
                                        <textarea
                                            id="editFloorLabels"
                                            rows="4"
                                            value={editFloorLabels}
                                            onChange={(e) => setEditFloorLabels(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md shadow-sm p-3 text-l focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                            aria-label="Edit Floor Labels"
                                            placeholder="e.g., Ground Floor, First Floor, Mezzanine"
                                        ></textarea>
                                        {/* <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Enter multiple floor labels separated by commas.
                                        </p> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                      <div className="flex items-center gap-4 px-2 mt-8 lg:justify-end">
  <Button
    type="button"
    onClick={closeModal}
    variant="outline"
    className="px-6 py-3 text-lg"
  >
    Close
  </Button>
  <Button
    type="submit"
    onClick={handleSave}
    disabled={isSaving}
    className="px-6 py-3 text-lg"
  >
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
}