import React, { useState, useCallback } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "./Modal";

const ContractForm = () => {
    const [formData, setFormData] = useState({
        employee_name: "",
        project_name: "",
        project_location: "",
        position: "",
        start_date: "",
        end_date: "",
        salary: "",
    });

    const [loading, setLoading] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateField, setDateField] = useState(null);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateSelect = useCallback((selectInfo) => {
        if (dateField) {
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
        }
    }, [dateField, formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (new Date(formData.end_date) < new Date(formData.start_date)) {
            setError("⚠️ End date must be after the start date.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post(
                "http://localhost:5000/api/contracts/generate",
                formData,
                { responseType: "blob" }
            );

            let fileName = "Employment_Contract.docx";
            const contentDisposition = response.headers["content-disposition"];
            if (contentDisposition) {
                const match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
                if (match) {
                    fileName = decodeURIComponent(match[1]);
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert("✅ Contract generated successfully!");
        } catch (error) {
            console.error("Error generating contract:", error);
            setError("❌ Failed to generate contract. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center">
                Generate Employment Contract
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                {["employee_name", "project_name", "project_location", "position"].map((field) => (
                    <div key={field} className="flex flex-col">
                        <label className="text-gray-700 font-medium mb-1">
                            {field.replace("_", " ").toUpperCase()}
                        </label>
                        <input
                            type="text"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                            placeholder={`Enter ${field.replace("_", " ")}`}
                            className="p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
                        />
                    </div>
                ))}

                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Start Date</label>
                    <input
                        type="text"
                        name="start_date"
                        value={formData.start_date}
                        onClick={() => { setDateField("start_date"); setIsCalendarOpen(true); }}
                        readOnly
                        required
                        className="p-3 border rounded-lg bg-gray-100 cursor-pointer focus:ring focus:ring-blue-300"
                        placeholder="Select start date"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">End Date</label>
                    <input
                        type="text"
                        name="end_date"
                        value={formData.end_date}
                        onClick={() => { setDateField("end_date"); setIsCalendarOpen(true); }}
                        readOnly
                        required
                        className="p-3 border rounded-lg bg-gray-100 cursor-pointer focus:ring focus:ring-blue-300"
                        placeholder="Select end date"
                    />
                </div>

                <div className="col-span-2 flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Salary (PHP)</label>
                    <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setFormData((prev) => ({ ...prev, salary: value }));
                        }}
                        required
                        placeholder="Enter salary amount"
                        className="p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300 focus:outline-none"
                    />
                </div>

                {error && <p className="text-red-500 text-sm col-span-2">{error}</p>}

                <button
                    type="submit"
                    className={`col-span-2 text-white px-4 py-2 rounded-lg text-lg font-medium transition-all duration-300 ${
                        loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    disabled={loading}
                >
                    {loading ? "⏳ Generating..." : "📄 Generate Contract"}
                </button>
            </form>

            {isCalendarOpen && (
                <Modal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} className="max-w-lg p-6">
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

export default ContractForm;
