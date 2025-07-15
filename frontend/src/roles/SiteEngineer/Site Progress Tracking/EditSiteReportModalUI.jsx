import React from "react";
import DatePicker from "react-datepicker";
import { FaTrashAlt } from "react-icons/fa";

const EditSiteReportModalUI = ({
  formData,
  handleChange,
  handleProjectSelect,
  handleSubmit,
  handleManpowerChange,
  addManpowerRow,
  removeManpowerRow,
  handleEquipmentChange,
  addEquipmentRow,
  removeEquipmentRow,
  predefinedRoles,
  predefinedEquipment,
  projectList,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-400/50 backdrop-blur-[32px] z-999">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">Edit Daily Site Report</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-xl">✕</button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project */}
            <div className="relative z-[9999]">
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <select
                name="project_name"
                value={formData.project_name}
                onChange={handleProjectSelect}
                className="w-full border border-white-300 p-2 rounded"
              >
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
                value="Daily Work Activities Report"
                readOnly
                className="w-full border border-gray-300 p-2 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                readOnly
                className="w-full border border-gray-300 p-2 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 w-full">Report Date</label>
              <DatePicker
                selected={formData.report_date ? new Date(formData.report_date) : null}
                onChange={(date) => handleChange({ target: { name: "report_date", value: date } })}
                dateFormat="yyyy-MM-dd"
                className="w-full border border-gray-300 p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Owner</label>
              <input
                type="text"
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
                >
                  <option value="">Select...</option>
                  <option value="Sunny">☀️ Sunny</option>
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
                >
                  <option value="">Select...</option>
                  <option value="Sunny">☀️ Sunny</option>
                  <option value="Cloudy">☁️ Cloudy</option>
                  <option value="Rainy">🌧️ Rainy</option>
                  <option value="Windy">💨 Windy</option>
                  <option value="Stormy">⛈️ Stormy</option>
                  <option value="Foggy">🌫️ Foggy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Manpower and Equipment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manpower */}
            <div>
              <label className="block text-sm font-medium mb-2 mt-4">Manpower</label>
              <div className="space-y-4">
                {formData.manpower.map((man, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <input
                      type="text"
                      list="roles"
                      className="flex border border-gray-300 p-2 rounded"
                      value={man.role}
                      onChange={(e) => handleManpowerChange(index, "role", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      className="w-24 border border-gray-300 p-2 rounded"
                      value={man.count}
                      onChange={(e) => handleManpowerChange(index, "count", e.target.value)}
                    />
                    <button type="button" onClick={() => removeManpowerRow(index)} className="text-red-500">
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}
                <datalist id="roles">
                  {predefinedRoles.map((r, i) => <option key={i} value={r} />)}
                </datalist>
                <button type="button" onClick={addManpowerRow} className="text-blue-600 hover:underline">
                  + Add Manpower
                </button>
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium mb-2 mt-4">Equipment</label>
              <div className="space-y-4">
                {formData.selected_equipment.map((eq, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <input
                      type="text"
                      list="equipments"
                      className="flex border border-gray-300 p-2 rounded"
                      value={eq.name}
                      onChange={(e) => handleEquipmentChange(index, "name", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      className="w-24 border border-gray-300 p-2 rounded"
                      value={eq.quantity}
                      onChange={(e) => handleEquipmentChange(index, "quantity", e.target.value)}
                    />
                    <button type="button" onClick={() => removeEquipmentRow(index)} className="text-red-500">
                      <FaTrashAlt />
                    </button>
                  </div>
                ))}
                <datalist id="equipments">
                  {predefinedEquipment.map((e, i) => <option key={i} value={e} />)}
                </datalist>
                <button type="button" onClick={addEquipmentRow} className="text-blue-600 hover:underline">
                  + Add Equipment
                </button>
              </div>
            </div>
          </div>

          {/* Activities, Notes, Visitors */}
          <div>
            <label className="block text-sm font-medium mb-1 mt-10">Activities</label>
            <textarea
              name="activities"
              rows="4"
              value={formData.activities}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visitors</label>
            <textarea
              name="visitors"
              rows="3"
              value={formData.visitors}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prepared By:</label>
            <input
              type="text"
              value={formData.prepared_by}
              readOnly
              className="w-full border border-gray-300 p-2 rounded bg-gray-100"
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 left-0 w-full bg-white border-t px-6 py-4 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSiteReportModalUI;
