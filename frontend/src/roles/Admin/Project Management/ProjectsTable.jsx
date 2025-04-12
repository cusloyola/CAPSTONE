import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"; // Modal (for delete confirmation)
import Button from "../../../components/ui/button/Button";
import ProjectModal from "./ProjectModal";

const API_URL = "http://localhost:5000/api/projects";
const CLIENTS_API_URL = "http://localhost:5000/api/clients"; // Define the clients API URL

export default function ProjectTable() {
    const [projectData, setProjectData] = useState([]);
    const [clients, setClients] = useState([]); // State to hold client data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editProjectId, setEditProjectId] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [form, setForm] = useState({
        project_name: "",
        location: "",
        owner: "", // Will store client_name for the dropdown (legacy, using client_name now)
        start_date: "",
        end_date: "",
        status: "",
        budget: "",
        client_name: "",
        progress_percent: 0, // Add this line
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchProjects();
        fetchClients(); // Fetch clients when the component mounts
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch projects: ${response.status}`);
            }
            const data = await response.json();
            setProjectData(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching projects:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch(CLIENTS_API_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch clients: ${response.status}`);
            }
            const data = await response.json();
            setClients(data);
            console.log("Fetched clients:", data); // Log fetched clients
        } catch (error) {
            console.error('Error fetching clients:', error);
            setError(error.message); // Set error state if fetching clients fails
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    const formatBudget = (amount) => {
        if (!amount) return "₱0.00";
        return `₱${parseFloat(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        console.log("Current form state:", form);
        const selectedClient = clients.find((c) => c.client_name === form.client_name);
        console.log("Selected client object:", selectedClient);
        const client_id = selectedClient?.client_id;
        console.log("Extracted client_id:", client_id);
    
        const errors = {};
        if (!form.project_name) errors.project_name = "Project name is required";
        if (!client_id) errors.client_name = "Client is required";
    
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;
    
        if (!client_id) {
            console.error("Error: client_id is missing. Ensure a client is selected.");
            alert("Please select a client for the project.");
            return;
        }
    
        const payload = {
            project_name: form.project_name,
            location: form.location,
            start_date: form.start_date,
            end_date: form.end_date,
            status: form.status,
            budget: parseFloat(form.budget || 0),
            actual_cost: parseFloat(form.budget || 0),
            progress_percent: form.progress_percent || 0,  // Use form.progress_percent here
            client_id: client_id,
        };
        console.log("Payload being sent:", payload);
        console.log("Submitting to:", isEditing ? `${API_URL}/${editProjectId}` : API_URL, "with method:", isEditing ? "PUT" : "POST");
    
        try {
            const response = await fetch(isEditing ? `${API_URL}/${editProjectId}` : API_URL, {
                method: isEditing ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
    
            const responseText = await response.text();
            console.log("Response Status:", response.status);
            console.log("Response Text:", responseText);
    
            if (!response.ok) {
                console.error("Create/Edit Project Failed:", response.status, responseText);
                setError(`Failed to ${isEditing ? 'update' : 'create'} project: ${response.status} - ${responseText}`);
                alert(`Failed to ${isEditing ? 'update' : 'create'} project. Please check the console for details.`);
                return;
            }
    
            setIsModalOpen(false);
            setForm(initialFormState);
            setFormErrors({});
            fetchProjects();
        } catch (error) {
            console.error("Create/Edit Project Error:", error);
            setError(error.message);
            alert(`Error ${isEditing ? 'updating' : 'creating'} project: ${error.message}`);
        }
    };
    
    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_URL}/${projectToDelete}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete project: ${response.status} - ${errorText}`);
            }
            setIsConfirmOpen(false);
            setProjectToDelete(null);
            fetchProjects(); // Refresh list
        } catch (err) {
            console.error("Error deleting project:", err);
            alert(err.message);
            setError(err.message);
        }
    };

    const handleEdit = (project) => {
        setIsEditing(true); // This sets a flag that indicates you're editing an existing project
        setEditProjectId(project.project_id); // This stores the `project_id` of the project being edited
        
        // Find the client that owns the project (this is based on the `client_id` of the project)
        const ownerClient = clients.find(client => client.client_id === project.client_id);
    
        setForm({
            project_name: project.project_name || "", 
            location: project.location || "", 
            start_date: project.start_date?.split("T")[0] || "",
            end_date: project.end_date?.split("T")[0] || "", 
            status: project.status || "", 
            budget: project.budget?.toString() || "",
            client_name: ownerClient?.client_name || "", 
            progress_percent: project.progress_percent || 0, 
        });
    
        // Open the modal for editing
        setIsModalOpen(true);
    };
    

    const initialFormState = {
        project_name: "",
        location: "",
        owner: "",
        start_date: "",
        end_date: "",
        status: "",
        budget: "",
        client_name: "",
    };

    const handleAddProjectClick = () => {
        setForm({ ...initialFormState });
        setFormErrors({});
        setIsEditing(false); // Ensure it's in create mode
        setIsModalOpen(true);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Projects</h2>
                <Button onClick={handleAddProjectClick}>+ Add a Project</Button>
            </div>

            {/* Project Modal for Create/Edit */}
            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                form={form}
                setForm={setForm}
                formErrors={formErrors}
                handleSubmit={handleSubmit}
                isEditing={isEditing}
                handleDelete={handleDelete}
                isConfirmOpen={isConfirmOpen}
                setIsConfirmOpen={setIsConfirmOpen}
                projectToDelete={projectToDelete}
                clients={clients} // Pass the clients data as a prop
            />

            {loading ? (
                <p>Loading projects...</p>
            ) : error ? (
                <p className="text-red-500">Error: {error}</p>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[1102px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        {[
                                            "Project ID",
                                            "Project Name",
                                            "Location",
                                            "Client",
                                            "Start Date",
                                            "End Date",
                                            "Status",
                                            "Budget",
                                            "Progress Percent",
                                            "Edit",
                                            "Delete",
                                        ].map((heading) => (
                                            <TableCell
                                                key={heading}
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                            >
                                                {heading}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {projectData.map((project) => {
                                        // Find the client name for display
                                        const ownerClient = clients.find(client => client.client_id === project.client_id);
                                        return (
                                            <TableRow key={project.project_id}>
                                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                                    {project.project_id}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500">
                                                    {project.project_name}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500">
                                                    {project.location}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500">
                                                    {ownerClient?.client_name || "N/A"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500">
                                                    {formatDate(project.start_date)}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500">
                                                    {formatDate(project.end_date)}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500">
                                                    <Badge
                                                        size="sm"
                                                        color={
                                                            project.status === "Completed"
                                                                ? "success"
                                                                : project.status === "In Progress"
                                                                    ? "warning"
                                                                    : "error"
                                                        }
                                                    >
                                                        {project.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500">
                                                    {formatBudget(project.budget)}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500">
                                                    {project.progress_percent}%
                                                </TableCell>


                                                <TableCell className="px-4 py-3 space-x-2">
                                                    <Button size="sm" onClick={() => handleEdit(project)}>
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-gray-500">
                                                    <Button
                                                        variant="destructive"
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"

                                                        size="sm"
                                                        onClick={() => {
                                                            setProjectToDelete(project.project_id);
                                                            setIsConfirmOpen(true);
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog
                open={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                className="fixed z-50 inset-0 overflow-y-auto"
            >
                <div className="flex items-center justify-center min-h-screen px-4">
                    <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
                        <DialogTitle className="text-lg font-semibold mb-4">
                            Confirm Delete
                        </DialogTitle>
                        <p>Are you sure you want to delete this project?</p>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
}