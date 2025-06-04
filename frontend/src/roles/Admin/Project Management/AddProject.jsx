import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';

const PROJECTS_API_URL = "http://localhost:5000/api/projects";

const CLIENTS_API_URL = "http://localhost:5000/api/clients";


const AddNewProjectForm = () => {
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({
        project_name: '',
        projectCategory: '',
        location: '',
        locationArea: '',
        start_date: null,
        end_date: null,
        priority: '',
        client_id: '',
        budget: '',
        status: 'Proposed',
        projectManager: '',
        number_of_floors: '',

    });

    useEffect(() => {
        axios.get(CLIENTS_API_URL)
            .then(response => {
                setClients(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch clients', error);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,

        }));
    };

    const handleStartDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            start_date: date,

        }));
    };

    const handleCompletionDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            end_date: date,

        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                budget: parseFloat(formData.budget),
                client_id: parseInt(formData.client_id, 10),
                start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : null,
                end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null,
            };

            console.log('Submitting project payload:', payload);

            const response = await axios.post(PROJECTS_API_URL, payload);
            console.log('Project created:', response.data);

        } catch (error) {
            console.error('Error creating project: ', error);
        }
    };


    return (
        <div className="flex justify-center items-start py-10 min-h-screen">
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-md w-full max-w-5xl">
                <h1 className="text-3xl font-bold mb-8">Add New Project</h1>

                {/* Row 1 */}
                <div className="grid gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Project Name</label>
                        <input
                            type="text"
                            name="project_name"
                            className="w-full border rounded px-4 py-2"
                            value={formData.project_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/*Row 2 */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Project Category</label>
                        <select
                            name="projectCategory"
                            className="w-full border rounded px-4 py-2"
                            value={formData.projectCategory}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Industrial">Industrial</option>
                        </select>
                    </div>

                     <div>
                        <label className="block text-gray-700 font-medium mb-1">Number of Floors</label>
                        <input
                            type="text"
                            name="number_of_floors"
                            className="w-full border rounded px-4 py-2"
                            value={formData.number_of_floors}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>


                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Project Location</label>
                        <input
                            type="text"
                            name="location"
                            className="w-full border rounded px-4 py-2"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Location Area</label>
                        <select
                            name="locationArea"
                            className="w-full border rounded px-4 py-2"
                            value={formData.locationArea}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Area</option>
                            <option value="Urban">Urban</option>
                            <option value="Suburban">Suburban</option>
                            <option value="Rural">Rural</option>
                        </select>
                    </div>
                </div>

                {/* Row 3 - Dates and Priority */}
                <div className="grid grid-cols-6 gap-4 mb-6 items-start">
                    <div className="col-span-2">
                        <label className="block text-gray-700 font-medium mb-1">Starting Date</label>
                        <DatePicker
                            selected={formData.start_date}
                            onChange={handleStartDateChange}
                            className="w-full border rounded px-4 py-2 cursor-pointer bg-white"
                            placeholderText="Select start date"
                            dateFormat="yyyy-MM-dd"
                            required
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-gray-700 font-medium mb-1">Completion Date</label>
                        <DatePicker
                            selected={formData.end_date}
                            onChange={handleCompletionDateChange}
                            className="w-full border rounded px-4 py-2 cursor-pointer bg-white"
                            placeholderText="Select completion date"
                            dateFormat="yyyy-MM-dd"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Priority</label>
                        <div className="flex flex-col md:flex-row gap-4 mt-2">
                            {['High', 'Medium', 'Low'].map((level) => (
                                <label key={level} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={level}
                                        checked={formData.priority === level}
                                        onChange={handleChange}
                                        className="accent-blue-600"
                                    />
                                    {level}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 4 - Client & Project Manager */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Select Client</label>
                        <select
                            name="client_id"
                            className="w-full border rounded px-4 py-2"
                            value={formData.client_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Client</option>
                            {clients.map(client => (
                                <option key={client.client_id} value={client.client_id}>
                                    {client.client_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Project Manager</label>
                        <input
                            type="text"
                            name="projectManager"
                            value={formData.projectManager}
                            className="w-full border rounded px-4 py-2"
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Row 5 - Budget & Status */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Estimated Budget</label>
                        <input
                            type="number"
                            name="budget"
                            className="w-full border rounded px-4 py-2"
                            value={formData.budget}
                            onChange={handleChange}
                            min={0}
                            max={0}
                            step={0}
                            required
                        />

                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Status</label>
                        <input
                            type="text"
                            name="status"
                            value={formData.status}
                            readOnly
                            className="w-full border rounded px-4 py-2 bg-gray-100"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="text-right">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddNewProjectForm;
