import { useEffect, useRef, useState } from "react";

const CLIENTS_API_URL = "http://localhost:5000/api/clients/";

const EditModal = ({
    isOpen,
    onClose,
    onSubmit,
    project,
    isEdit,
    isFullscreen = false,  // I added this so you can pass this prop if needed
    showCloseButton = true,
    className = "",
    contentClasses = "relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-xl",
    children,
}) => {
    const modalRef = useRef(null);

    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({
        project_id: project.project_id || "",
        project_name: project?.project_name || "",
        projectCategory: project?.projectCategory || "",
        location: project?.location || "",
        locationArea: project?.locationArea || "",
        priority: project?.priority || "",
        projectManager: project?.projectManager || "",
        start_date: project?.start_date || "",
        end_date: project?.end_date || "",
        client_id: project?.client_id || null,
    });

    useEffect(() => {
        if (project) {
            setFormData({
                project_id: project.project_id || "",
                project_name: project?.project_name || "",
                projectCategory: project?.projectCategory || "",
                location: project?.location || "",
                locationArea: project?.locationArea || "",
                priority: project?.priority || "",
                projectManager: project?.projectManager || "",
                start_date: project?.start_date || "",
                end_date: project?.end_date || "",
                client_id: project?.client_id || null,
            });
        } else {
            setFormData({
                project_id: "",
                project_name: "",
                projectCategory: "",
                location: "",
                locationArea: "",
                priority: "",
                projectManager: "",
                start_date: "",
                end_date: "",
                client_id: null,
            });
        }
    }, [project, isOpen]);

    useEffect(() => {
        fetch(CLIENTS_API_URL)
            .then((res) => res.json())
            .then((data) => setClients(data))
            .catch((err) => console.error("Failed to fetch clients", err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    // If modal is not open, render nothing
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[99999]">
            {!isFullscreen && (
                <div
                    className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
                    onClick={onClose}
                ></div>
            )}
            <div
                ref={modalRef}
                className={`${contentClasses} ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 z-10 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
                        aria-label="Close modal"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                )}

                {/* Modal content: your form */}
                <>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                        {isEdit ? "Edit Project" : "Create New Project"}
                    </h3>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        {/* Project Name */}
                        <div>
                            <label
                                htmlFor="project_name"
                                className="block font-medium text-gray-700 dark:text-gray-300"
                            >
                                Project Name
                            </label>
                            <input
                                type="text"
                                id="project_name"
                                name="project_name"
                                value={formData.project_name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                            />
                        </div>

                        {/* Project Category */}
                        <div>
                            <label
                                htmlFor="projectCategory"
                                className="block font-medium text-gray-700 dark:text-gray-300"
                            >
                                Project Category
                            </label>
                            <input
                                type="text"
                                id="projectCategory"
                                name="projectCategory"
                                value={formData.projectCategory}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                            />
                        </div>

                        {/* Project Manager */}
                        <div>
                            <label
                                htmlFor="projectManager"
                                className="block font-medium text-gray-700 dark:text-gray-300"
                            >
                                Project Manager
                            </label>
                            <input
                                type="text"
                                id="projectManager"
                                name="projectManager"
                                value={formData.projectManager}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label
                                htmlFor="priority"
                                className="block font-medium text-gray-700 dark:text-gray-300"
                            >
                                Priority
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>

                        {/* Client Select */}
                        <div>
                            <label
                                htmlFor="client_id"
                                className="block font-medium text-gray-700 dark:text-gray-300"
                            >
                                Client
                            </label>
                            <select
                                id="client_id"
                                name="client_id"
                                value={formData.client_id || ""}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                            >
                                <option value="" disabled>
                                    Select a client
                                </option>
                                {clients.map((client) => (
                                    <option key={client.client_id} value={client.client_id}>
                                        {client.client_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {isEdit ? "Update Project" : "Create Project"}
                            </button>
                        </div>
                    </form>
                </>
            </div>
        </div>
    );
};

export default EditModal;
