import React, { useState, useCallback } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "./Modal";
import { FaCalendarAlt } from "react-icons/fa";

const LeaveContractForm = () => {
    const [formData, setFormData] = useState({
        employee_name: "",
        start_date: "",
        end_date: "",
        reason_for_leave: "", // 🔹 Updated field name
    });

    const [loading, setLoading] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateField, setDateField] = useState(null);
    const [error, setError] = useState("");

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle date selection from FullCalendar
    const handleDateSelect = useCallback((selectInfo) => {
        if (!dateField) return;

        const selectedDate = selectInfo.startStr;

        if (dateField === "end_date" && formData.start_date && new Date(selectedDate) < new Date(formData.start_date)) {
            setError("⚠️ End date must be after the start date.");
            return;
        }
        if (dateField === "start_date" && formData.end_date && new Date(selectedDate) > new Date(formData.end_date)) {
            setError("⚠️ Start date must be before the end date.");
            return;
        }

        setFormData((prev) => ({ ...prev, [dateField]: selectedDate }));
        setError("");
        setIsCalendarOpen(false);
    }, [dateField, formData]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("📤 Sending data:", formData); // Debugging

        if (!formData.start_date || !formData.end_date) {
            setError("⚠️ Please select both start and end dates.");
            return;
        }
        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setError("⚠️ End date must be after the start date.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "http://localhost:5000/api/leave-contract/generate",
                formData,
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Leave_Contract.docx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert("✅ Leave contract generated successfully!");
        } catch (error) {
            console.error("Error generating leave contract:", error);
            setError("❌ Failed to generate leave contract. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6">
            <h2 className="text-3xl font-semibold text-gray-800 text-center">Leave Contract</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium">Employee Name</label>
                    <input
                        type="text"
                        name="employee_name"
                        value={formData.employee_name}
                        onChange={handleChange}
                        required
                        className="p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                        placeholder="Enter employee name"
                    />
                </div>

                {["start_date", "end_date"].map((field) => (
                    <div key={field} className="relative flex flex-col">
                        <label className="text-gray-700 font-medium">{field.replace("_", " ").toUpperCase()}</label>
                        <div className="relative">
                            <input
                                type="text"
                                name={field}
                                value={formData[field]}
                                onClick={() => { setDateField(field); setIsCalendarOpen(true); }}
                                readOnly
                                required
                                className="p-3 border rounded-lg bg-gray-100 cursor-pointer focus:ring focus:ring-blue-300 w-full pr-10"
                                placeholder="Select date"
                            />
                            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>
                ))}

                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium">Reason for Leave</label>
                    <textarea
                        name="reason_for_leave" // 🔹 Updated field name
                        value={formData.reason_for_leave}
                        onChange={handleChange}
                        required
                        className="p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                        placeholder="Enter reason for leave"
                        rows={3}
                    ></textarea>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className={`text-white px-4 py-3 rounded-lg text-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                    disabled={loading}
                >
                    {loading ? "⏳ Generating..." : "Generate Leave Contract"}
                </button>
            </form>

            {isCalendarOpen && (
                <Modal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)}>
                    <h3 className="text-lg font-semibold mb-4">📅 Select a Date</h3>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        selectable={true}
                        select={handleDateSelect}
                    />
                </Modal>
            )}
        </div>
    );
};

export default LeaveContractForm;
