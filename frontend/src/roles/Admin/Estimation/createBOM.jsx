import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateBOMModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        user_id: "",
        date: new Date(),
        project_name: "",
        location: "",
        subject: "",
        owner: "",
        remarks: "",
        prepared_by: "",
        submitted_by: "",
        professional: "",
    });

    useEffect(() => {
        const storedUserId = localStorage.getItem("user_id");
        if (storedUserId) {
            setFormData((prev) => ({ ...prev, user_id: storedUserId }));
        }
    }, [isOpen]);

    const handleDateChange = (date) => {
        setFormData({ ...formData, date });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.date) {
            alert("Please select a date.");
            return;
        }

        const payload = { ...formData, date: formData.date.toISOString().split("T")[0] };

        try {
            const response = await axios.post("http://localhost:5000/api/bom/create", payload);
            const newBOMId = response.data.bom_id; // ✅ Retrieve new BOM ID

            alert(response.data.message);
            onClose(); // Close modal
            navigate(`/Estimation/BOMTable/${newBOMId}`); // ✅ Redirect to BOM Table template
        } catch (error) {
            console.error("❌ Error creating BOM:", error.response?.data || error);
            alert(error.response?.data?.message || "Error creating BOM");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
                <h2 className="text-xl font-bold mb-4">Create BOM</h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="hidden" name="user_id" value={formData.user_id} />

                    <div className="flex space-x-3">
                        <input
                            type="text"
                            name="project_name"
                            placeholder="Project Name"
                            value={formData.project_name}
                            onChange={handleChange}
                            required
                            className="w-1/2 p-2 border rounded"
                        />
                        <div className="w-1/2">
                            <DatePicker
                                selected={formData.date}
                                onChange={handleDateChange}
                                minDate={new Date()}
                                dateFormat="MMMM d, yyyy"
                                className="w-full p-2 border rounded"
                                wrapperClassName="w-full"
                            />
                        </div>
                    </div>

                    <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <input type="text" name="owner" placeholder="Owner" value={formData.owner} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <input type="text" name="prepared_by" placeholder="Prepared By" value={formData.prepared_by} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <input type="text" name="submitted_by" placeholder="Submitted By" value={formData.submitted_by} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <input type="text" name="professional" placeholder="Professional" value={formData.professional} onChange={handleChange} required className="w-full p-2 border rounded" />
                    <textarea name="remarks" placeholder="Remarks" value={formData.remarks} onChange={handleChange} className="w-full p-2 border rounded"></textarea>

                    <div className="flex justify-between mt-4">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Create</button>
                        <button type="button" onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBOMModal;
