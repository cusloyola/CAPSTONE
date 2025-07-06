import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddProgressBillingModal = ({ onClose, onSave, proposal_name, project_name, proposal_id, full_name, user_id, billing_no }) => {
    const [billingDate, setBillingDate] = useState(new Date());
    const [billingNo, setBillingNo] = useState("");
    const [evaluatedBy, setEvaluatedBy] = useState("");

    useEffect(() => {
        console.log("Modal opened with:");
        console.log("Proposal Name:", proposal_name);
        console.log("Project Name:", project_name);
        console.log("Proposal ID:", proposal_id);
        console.log("User ID:", user_id);
    }, [proposal_name, project_name, proposal_id, user_id]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const billing = {
            billing_no: billingNo, // 🟢 Include this
            proposal_id,
            subject: "Progress Billing",
            billing_date: billingDate.toISOString().split("T")[0],
            status: "Draft",
            revision: 0,
            evaluated_by: full_name || "",
            user_id: user_id,
        };

        console.log("📤 Submitting billing data:", billing);

        onSave(billing);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded p-6 w-full max-w-md shadow space-y-4">
                <h2 className="text-lg font-semibold">Add Progress Billing</h2>
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Billing Date */}
                    <div className="w-full">
                        <label className="block font-medium mb-1">Billing Date</label>
                        <DatePicker
                            selected={billingDate}
                            onChange={(date) => setBillingDate(date)}
                            dateFormat="MM-dd-yyyy"
                            className="border p-2 rounded w-full"
                            wrapperClassName={("w-full")}
                        />
                    </div>

                    {/* Billing No. */}
                    <div>
                        <label className="block font-medium mb-1">Billing No.</label>
                        <input
                            type="text"
                            value={billingNo}
                            onChange={(e) => setBillingNo(e.target.value)}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                    {/* Proposal Title */}
                    <div>
                        <label className="block font-medium mb-1">Proposal</label>
                        <input
                            type="text"
                            value={proposal_name || ""}
                            disabled
                            className="border p-2 rounded w-full bg-gray-100"
                        />
                    </div>

                    {/* Project Title */}
                    <div>
                        <label className="block font-medium mb-1">Project</label>
                        <input
                            type="text"
                            value={project_name || ""}
                            disabled
                            className="border p-2 rounded w-full bg-gray-100"
                        />
                    </div>

                    {/* Evaluated By */}
                    <div>
                        <label className="block font-medium mb-1">Evaluated By</label>
                        <input
                            type="text"
                            className="border p-2 rounded w-full bg-gray-100"
                            value={full_name || ""}
                            disabled
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProgressBillingModal;
