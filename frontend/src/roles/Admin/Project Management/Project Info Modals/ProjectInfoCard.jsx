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
 * @property {string} [client_name]
 * @property {string} [client_contact]
 * @property {string} [projectCategory]
 */

// API endpoint for projects (used for fetching and updating a single project)
const PROJECT_INFO_API_URL = "http://localhost:5000/api/project-info/"; // Specific endpoint for single project info

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
                    // Format dates for input type="date"
                    setEditStartDate(data.start_date && !isNaN(new Date(data.start_date).getTime()) ? new Date(data.start_date).toISOString().split('T')[0] : '');
                    setEditEndDate(data.end_date && !isNaN(new Date(data.end_date).getTime()) ? new Date(data.end_date).toISOString().split('T')[0] : '');
                    setEditBudget(data.budget?.toString() || '');
                    setEditStatus(data.status || '');
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
        const hasChanged =
            editProjectName !== projectData.project_name ||
            editLocation !== projectData.location ||
            editLocationArea !== projectData.locationArea ||
            editPriority !== projectData.priority ||
            editProjectManager !== projectData.projectManager ||
            (editStartDate !== (projectData.start_date ? new Date(projectData.start_date).toISOString().split('T')[0] : '') && startDateObj.getTime() !== (projectData.start_date ? new Date(projectData.start_date).getTime() : NaN)) ||
            (editEndDate !== (projectData.end_date ? new Date(projectData.end_date).toISOString().split('T')[0] : '') && endDateObj.getTime() !== (projectData.end_date ? new Date(projectData.end_date).getTime() : NaN)) ||
            parsedBudget !== projectData.budget ||
            editStatus !== projectData.status;

        if (!hasChanged) {
            setToast({ message: "No changes to save.", type: 'info' });
            closeModal();
            return;
        }

        setIsSaving(true);
        const updatedData = {
            // Only send fields that are editable as per new requirements
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

        try {
            // Send PUT request to your backend API
            const response = await fetch(`${PROJECT_INFO_API_URL}${project_id}`, {
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

            // Assuming the backend returns the updated project data
            /** @type {Project} */
            const result = await response.json();
            // Merge the updated fields back into the full projectData state
            if (isMounted.current) {
                setProjectData(prevData => ({ ...prevData, ...updatedData })); // Update local state with edited fields
                if (onProjectUpdate) {
                    onProjectUpdate(result); // Notify parent if needed
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
        return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading detailed project information...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-600 dark:text-red-400">Error: {error}</div>;
    }

    if (!projectData) {
        return <div className="text-center py-8 text-gray-600 dark:text-gray-400">No detailed project data available.</div>;
    }

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                            Detailed Information for Project: {projectData.project_name}
                        </h4>

                        {/* This grid remains 3 columns as per previous update and user's implicit approval of its layout */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-7 2xl:gap-x-32">
                            {/* Display only requested fields */}
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Project Name</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{projectData.project_name}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Location</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{projectData.location}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Location Area</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{projectData.locationArea || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Priority</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{projectData.priority}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Project Manager</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{projectData.projectManager || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Status</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{projectData.status}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Start Date</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{new Date(projectData.start_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">End Date</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{new Date(projectData.end_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Budget</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">${projectData.budget?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Actual Cost</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">${projectData.actual_cost?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Progress Percent</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{projectData.progress_percent}%</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={openModal}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                        aria-label="Edit Detailed Project Information"
                    >
                        <svg
                            className="fill-current"
                            width="18"
                            height="18"
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

                                {/* Reverted to lg:grid-cols-2 for the edit modal */}
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    {/* Editable fields */}
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
                                        <Label htmlFor="editLocationArea">Location Area</Label>
                                        <Input
                                            id="editLocationArea"
                                            type="text"
                                            value={editLocationArea}
                                            onChange={(e) => setEditLocationArea(e.target.value)}
                                            aria-label="Edit Location Area"
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
                                        <Label htmlFor="editStartDate">Start Date</Label>
                                        <Input
                                            id="editStartDate"
                                            type="date" // Ensures native date picker is available
                                            value={editStartDate}
                                            onChange={(e) => setEditStartDate(e.target.value)}
                                            aria-label="Edit Start Date"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="editEndDate">End Date</Label>
                                        <Input
                                            id="editEndDate"
                                            type="date" // Ensures native date picker is available
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
}
