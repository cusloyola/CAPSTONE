import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"; // Make sure you import necessary Dialog components
import Button from "../../../components/ui/button/Button";
const ProjectModal = ({
    isOpen,
    onClose,
    form,
    setForm,
    formErrors,
    handleSubmit,
    isEditing,
    clients,
    handleDelete,
    isConfirmOpen,
    setIsConfirmOpen,
    projectToDelete,
}) => {
    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <DialogPanel className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
                    <DialogTitle className="text-lg font-semibold mb-4">
                        {isEditing ? "Edit Project" : "Add a Project"}
                    </DialogTitle>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Form Fields */}
                        {[
                            { label: "Project Name", name: "project_name" },
                            { label: "Location", name: "location" },
                            { label: "Owner", name: "owner" },
                            { label: "Start Date", name: "start_date", type: "date" },
                            { label: "End Date", name: "end_date", type: "date" },
                            { label: "Status", name: "status" },
                            { label: "Budget", name: "budget", type: "number" },
                        ].map(({ label, name, type = "text" }) => (
                            <div key={name}>
                                <label className="block font-medium">{label}</label>
                                <input
                                    type={type}
                                    className="w-full p-2 border rounded"
                                    value={form[name]}
                                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                                />
                                {formErrors[name] && <p className="text-red-500 text-sm">{formErrors[name]}</p>}
                            </div>
                        ))}

                        {/* Client Dropdown */}
                        <div>
                            <label className="block font-medium">Client</label>
                            <select
                                value={form.client_name}
                                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                            >
                                <option value="">Select client</option>
                                {clients.map((client) => (
                                    <option key={client.client_id} value={client.client_name}>
                                        {client.client_name}
                                    </option>
                                ))}
                            </select>


                            {formErrors.client_id && <p className="text-red-500 text-sm">{formErrors.client_id}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit">{isEditing ? "Update" : "Submit"}</Button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ProjectModal;
