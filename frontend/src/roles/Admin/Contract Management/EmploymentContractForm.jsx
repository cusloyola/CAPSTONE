import React, { useState, useCallback } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "./Modal";
import { FaCalendarAlt } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha"; // Import reCAPTCHA

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
    const [captchaVerified, setCaptchaVerified] = useState(false);

    // Handles text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handles date selection from calendar
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
        setIsCalendarOpen(false); // Close the modal after selection
    }, [dateField, formData]);

    // Handles contract generation submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // if (!captchaVerified) {
        //     setError("⚠️ Please verify the reCAPTCHA before proceeding.");
        //     return;
        // }
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
                "http://localhost:5000/api/contracts/generate",
                formData,
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Employment_Contract.docx");
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
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6">
            <h2 className="text-3xl font-semibold text-gray-800 text-center">Employment Contract</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                {/* Text Inputs */}
                {["employee_name", "project_name", "project_location", "position"].map((field) => (
                    <div key={field} className="flex flex-col">
                        <label className="text-gray-700 font-medium">{field.replace("_", " ").toUpperCase()}</label>
                        <input
                            type="text"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                            className="p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                            placeholder={`Enter ${field.replace("_", " ")}`}
                        />
                    </div>
                ))}

                {/* Date Inputs */}
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

                {/* Salary Input */}
                <div className="col-span-2 flex flex-col">
                    <label className="text-gray-700 font-medium">Salary (PHP)</label>
                    <input
                        type="text"
                        name="salary"
                        value={formData.salary.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
                            setFormData((prev) => ({ ...prev, salary: value }));
                        }}
                        required
                        className="p-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-300"
                        placeholder="Enter salary"
                    />
                </div>

                {/* reCAPTCHA Section */}
                {/* <div className="col-span-2 flex flex-col items-center">
                    <ReCAPTCHA
                        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key (replace with real key for production)
                        onChange={() => {
                            setCaptchaVerified(true);
                            setError(""); // Clear previous captcha errors
                        }}
                        onExpired={() => setCaptchaVerified(false)}
                        onError={() => setError("⚠️ Please complete the reCAPTCHA.")}
                    />
                    {!captchaVerified && <p className="text-red-500 text-sm mt-2">⚠️ Please verify you are not a robot.</p>}
                </div> */}

                {/* Error Message */}
                {error && <p className="text-red-500 text-sm col-span-2">{error}</p>}

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`col-span-2 text-white px-4 py-3 rounded-lg text-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                    disabled={loading}
                >
                    {loading ? "⏳ Generating..." : "Generate Contract"}
                </button>
            </form>

            {/* FullCalendar Modal */}
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

export default ContractForm;
