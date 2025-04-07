import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"; // Modal
import Button from "../../../components/ui/button/Button";
import ProjectModal from "./ProjectModal";

const API_URL = "http://localhost:5000/api/projects";

export default function ProjectTable() {
  const [projectData, setProjectData] = useState([]);
  const [clients, setClients] = useState([]);
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
    owner: "",
    start_date: "",
    end_date: "",
    status: "",
    budget: "",
    client_name: "", // changed from client_id
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setProjectData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatBudget = (amount) => {
    return `₱${parseFloat(amount).toLocaleString("en-PH")}`;
  };

  const validateForm = () => {
    const errors = {};
    if (!form.project_name) errors.project_name = "Project name is required.";
    if (!form.location) errors.location = "Location is required.";
    if (!form.owner) errors.owner = "Owner is required.";
    if (!form.start_date) errors.start_date = "Start date is required.";
    if (!form.end_date) errors.end_date = "End date is required.";
    if (!form.status) errors.status = "Status is required.";
    if (!form.budget || isNaN(form.budget)) errors.budget = "Valid budget is required.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Map client name to ID
    const selectedClient = clients.find((c) => c.client_name === form.client_name);
    const client_id = selectedClient?.client_id;

    // Basic validation
    const errors = {};
    if (!form.project_name) errors.project_name = "Project name is required";
    if (!client_id) errors.client_id = "Client is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Build final payload
    const payload = {
      project_name: form.project_name,
      location: form.location,
      owner: form.owner,
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
      budget: form.budget,
      client_id,
    };

    // If editing, include the project ID and log the final URL
    const url = isEditing ? `${API_URL}/${editProjectId}` : API_URL;
    const method = isEditing ? "PUT" : "POST";

    console.log("Submitting form with method:", method);
    console.log("Target URL:", url);
    console.log("Payload:", payload);

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Response:", response.status, responseText);

      setIsModalOpen(false);
      setForm({
        project_name: "",
        location: "",
        owner: "",
        start_date: "",
        end_date: "",
        status: "",
        budget: "",
      });
      setFormErrors({});
      fetchProjects(); // Refresh table
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/${projectToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      setIsConfirmOpen(false);
      setProjectToDelete(null);
      fetchProjects(); // Refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (project) => {
    setIsEditing(true);
    setEditProjectId(project.project_id);
    const client = clients.find((c) => c.client_id === project.client_id);
    setForm({
      project_name: project.project_name,
      location: project.location,
      owner: project.owner,
      start_date: project.start_date.split("T")[0],
      end_date: project.end_date.split("T")[0],
      status: project.status,
      budget: project.budget,
      client_name: client?.client_name || "", // show name in the modal
    });
    setIsModalOpen(true);
  };

  // Add an initial empty state for the form
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

  // Handle when the "Create Project" button is clicked
  const handleCreateProjectClick = () => {
    setForm(initialFormState); // Reset form fields
    setFormErrors({}); // Reset any previous form errors
    setIsModalOpen(true); // Open modal for new project
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button onClick={handleCreateProjectClick}>+ Create Project</Button>
      </div>

      {/* Project Modal for Create/Edit */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        formErrors={formErrors}
        handleSubmit={handleSubmit}
        isEditing={isEditing} // isEditing is false for create mode
        clients={clients}
        handleDelete={handleDelete}
        isConfirmOpen={isConfirmOpen}
        setIsConfirmOpen={setIsConfirmOpen}
        projectToDelete={projectToDelete}
      />

      {/* Confirmation Modal */}
      <Dialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
            <DialogTitle className="text-lg font-semibold mb-4">
              Create New Project
            </DialogTitle>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Project Name", name: "project_name" },
                { label: "Location", name: "location" },
                { label: "Owner", name: "owner" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="block font-medium">{label}</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  />
                  {formErrors[name] && (
                    <p className="text-red-500 text-sm">{formErrors[name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block font-medium">Start Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
                {formErrors.start_date && (
                  <p className="text-red-500 text-sm">{formErrors.start_date}</p>
                )}
              </div>

              <div>
                <label className="block font-medium">End Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
                {formErrors.end_date && (
                  <p className="text-red-500 text-sm">{formErrors.end_date}</p>
                )}
              </div>

              <div>
                <label className="block font-medium">Status</label>
                <select
                  className="w-full p-2 border rounded"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="">Select status</option>
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                {formErrors.status && (
                  <p className="text-red-500 text-sm">{formErrors.status}</p>
                )}
              </div>

              <div>
                <label className="block font-medium">Budget (₱)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                />
                {formErrors.budget && (
                  <p className="text-red-500 text-sm">{formErrors.budget}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Project Table */}
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
                    "Owner",
                    "Start Date",
                    "End Date",
                    "Status",
                    "Budget",
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      {heading}
                    </TableCell>
                  ))}
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Edit
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Delete
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {projectData.map((project) => (
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
                      {project.owner}
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
                    <TableCell className="px-4 py-3 space-x-2">
                      <Button size="sm" onClick={() => handleEdit(project)}>
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500">
                      <Button
                        variant="destructive"
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
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}