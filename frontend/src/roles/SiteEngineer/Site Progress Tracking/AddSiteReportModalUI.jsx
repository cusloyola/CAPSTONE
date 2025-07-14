import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { FaTrashAlt } from "react-icons/fa";

const user = JSON.parse(localStorage.getItem("user"));

const AddSiteReportModalUI = ({
    formData,
    handleChange,
    handleProjectSelect,
    handleSubmit,
    onClose,
    handleManpowerChange,
    addManpowerRow,
    removeManpowerRow,
    handleEquipmentChange,
    addEquipmentRow,
    removeEquipmentRow,
    predefinedRoles,
    predefinedEquipment,
    projectList
}) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-2xl font-bold">Add Daily Site Report</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-xl">✕</button>
                </div>
                {/* Scrollable Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-6 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative z-[9999]">
                            <label className="block text-sm font-medium mb-1">Project Name</label>
                            <select
                                name="project_name"
                                value={formData.project_name}
                                onChange={handleProjectSelect}
                                className="w-full border border-gray-300 p-2 rounded"
                                required
                            >
                                <option value="">Select Project</option>
                                {projectList
                                    .filter((proj) => proj.status === "In Progress")
                                    .map((proj) => (
                                        <option key={proj.project_id} value={proj.project_name}>
                                            {proj.project_name}
                                        </option>
                                    ))}
                            </select>
                        </div>



                        <div>
                            <label className="block text-sm font-medium mb-1">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value="Daily Work Activities Report"
                                readOnly
                                className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                readOnly
                                className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 w-full">Report Date</label>
                            <DatePicker
                                selected={formData.report_date}
                                onChange={(date) => handleChange({ target: { name: "report_date", value: date } })}
                                minDate={new Date()}
                                dateFormat="yyyy-MM-dd"
                                className="w-full border border-gray-300 p-2 rounded"
                                placeholderText="Select report date"
                                wrapperClassName="w-full"

                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Owner</label>
                            <input
                                type="text"
                                name="owner"
                                value={formData.owner}
                                readOnly
                                className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                            />
                        </div>

                    </div>
                    {/* Weather */}
                    <div>
                        <label className="block text-sm font-medium mb-2 mt-14">Weather</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1">A.M.</label>
                                <select
                                    name="weather_am"
                                    value={formData.weather_am}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                >
                                    <option value="">Select...</option>
                                    <option value="Sunny"> ☀️ Sunny</option>
                                    <option value="Cloudy">☁️ Cloudy</option>
                                    <option value="Rainy">🌧️ Rainy</option>
                                    <option value="Windy">💨 Windy</option>
                                    <option value="Stormy">⛈️ Stormy</option>
                                    <option value="Foggy">🌫️ Foggy</option>
                                </select>
                            </div>


                            <div>
                                <label className="block text-xs font-medium mb-1">P.M.</label>
                                <select
                                    name="weather_pm"
                                    value={formData.weather_pm}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 p-2 rounded"
                                    required
                                >
                                   <option value="">Select...</option>
                                    <option value="Sunny"> ☀️ Sunny</option>
                                    <option value="Cloudy">☁️ Cloudy</option>
                                    <option value="Rainy">🌧️ Rainy</option>
                                    <option value="Windy">💨 Windy</option>
                                    <option value="Stormy">⛈️ Stormy</option>
                                    <option value="Foggy">🌫️ Foggy</option>
                                </select>
                            </div>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Manpower Section */}
                        <div>
                            <label className="block text-sm font-medium mb-2 mt-4">Manpower</label>
                            <div className="space-y-4">
                                {formData.manpower.map((man, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <input
                                            list="role-options"
                                            type="text"
                                            placeholder="Role (e.g. Foreman)"
                                            className="flex border border-gray-300 p-2 rounded"
                                            value={man.role}
                                            onChange={(e) =>
                                                handleManpowerChange(index, "role", e.target.value)
                                            }
                                            required
                                        />
                                        <datalist id="role-options">
                                            {predefinedRoles.map((role, i) => (
                                                <option key={i} value={role} />
                                            ))}
                                        </datalist>


                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Count"
                                            className="w-24 border border-gray-300 p-2 rounded"
                                            value={man.count}
                                            onChange={(e) =>
                                                handleManpowerChange(index, "count", e.target.value)
                                            }
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeManpowerRow(index)}
                                            className="text-red-500 hover:underline"
                                        >
                                            <FaTrashAlt style={{ marginRight: '5px' }} />


                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addManpowerRow}
                                    className="text-blue-600 hover:underline"
                                >
                                    + Add Manpower
                                </button>
                            </div>
                        </div>


                        {/* Equipment Section */}
                        <div>
                            <label className="block text-sm font-medium mb-2 mt-4">Equipment</label>
                            <div className="space-y-4">
                                {formData.selected_equipment.map((eq, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <input
                                            list="equipment-options"
                                            type="text"
                                            placeholder="Equipment name"
                                            className="flex border border-gray-300 p-2 rounded"
                                            value={eq.name}
                                            onChange={(e) =>
                                                handleEquipmentChange(index, "name", e.target.value)
                                            }
                                            required
                                        />
                                        <datalist id="equipment-options">
                                            {predefinedEquipment.map((item, i) => (
                                                <option key={i} value={item} />
                                            ))}
                                        </datalist>


                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="Qty"
                                            className="w-24 border border-gray-300 p-2 rounded"
                                            value={eq.quantity}
                                            onChange={(e) =>
                                                handleEquipmentChange(index, "quantity", e.target.value)
                                            }
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeEquipmentRow(index)}
                                            className="text-red-500 hover:underline"
                                        >
                                            <FaTrashAlt style={{ marginRight: '5px' }} />


                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addEquipmentRow}
                                    className="text-blue-600 hover:underline"
                                >
                                    + Add Equipment
                                </button>
                            </div>
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-medium mb-1  mt-10">Activities</label>
                        <textarea
                            name="activities"
                            value={formData.activities}
                            onChange={handleChange}
                            rows={4}
                            className="w-full border border-gray-300 p-2 rounded resize-none"
                            placeholder="e.g., Excavation, Concrete pouring, Site inspection..."
                            required
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 p-2 rounded resize-none"
                            required
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium mb-1">Visitors</label>
                        <textarea
                            name="visitors"
                            value={formData.visitors}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 p-2 rounded resize-none"
                            required
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium mb-1">Prepared By:</label>
                        <input
                            type="text"
                            value={user?.name || ""}
                            readOnly
                            className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                        />
                    </div>

                    {/* Sticky Footer Buttons */}
                    <div className="sticky bottom-0 left-0 w-full bg-white border-t px-6 py-4 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"

                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                            Submit Report
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
};

export default AddSiteReportModalUI;
