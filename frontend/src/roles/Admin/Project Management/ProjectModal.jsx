import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "../../../components/ui/button/Button";
import { useEffect } from "react";

const ProjectModal = ({
    isOpen,
    onClose,
    form,
    setForm,
    formErrors,
    handleSubmit,
    isEditing,
    handleDelete,
    isConfirmOpen,
    setIsConfirmOpen,
    projectToDelete,
    clients, // Expecting clients as a prop
}) => {
    // Log when the component renders
    console.log("ProjectModal rendered", { isOpen, form, clients });

    useEffect(() => {
        console.log("ProjectModal: Clients prop received:", clients);
    }, [clients]);

    const handleClientChange = (e) => {
        const selectedClient = e.target.value;
        console.log("ProjectModal: Client selected:", selectedClient);
        setForm({ ...form, client_name: selectedClient });
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
                    <DialogTitle className="text-lg font-semibold mb-4">
                        {isEditing ? "Edit Project" : "Add a Project"}
                    </DialogTitle>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form Fields */}
                        {[{ label: "Project Name", name: "project_name" }, 
                        { label: "Location", name: "location" }, 
                        { label: "Start Date", name: "start_date", type: "date" },
                         { label: "End Date", name: "end_date", type: "date" }, 
                         { label: "Status", name: "status" }, 
                         { label: "Budget", name: "budget", type: "number" },
                          { label: "Progress", name: "progress_percent", type: "number", min: "0", max: "100" }].map(({ label, name, type = "text", ...rest }) => (
                            <div key={name}>
                                <label className="block font-medium">{label}</label>
                                <input
                                    type={type}
                                    className="w-full p-2 border rounded"
                                    value={form[name] || ''}
                                    onChange={(e) => {
                                        console.log(`ProjectModal: Input ${name} changed to:`, e.target.value);
                                        setForm({ ...form, [name]: e.target.value });
                                    }}
                                    {...rest}
                                />
                                {formErrors[name] && <p className="text-red-500 text-sm">{formErrors[name]}</p>}
                            </div>
                        ))}

                        {/* Client Dropdown */}
                        <div>
                            <label className="block font-medium">Client</label>
                            <select
                                value={form.client_name || ''}
                                onChange={handleClientChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select client</option>
                                {clients.length === 0 ? (
                                    <option disabled>No clients available</option>
                                ) : (
                                    clients.map((client) => (
                                        <option key={client.client_id} value={client.client_name}>
                                            {client.client_name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {formErrors.client_name && <p className="text-red-500 text-sm">{formErrors.client_name}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => {
                                console.log("ProjectModal: Cancel button clicked");
                                onClose();
                            }}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={() => console.log("ProjectModal: Submit button clicked")}
                                disabled={!form.client_name || !form.project_name || !form.location}
                            >
                                {isEditing ? "Update" : "Submit"}
                            </Button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ProjectModal;
