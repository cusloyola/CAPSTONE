import React, { useState } from "react";

const DailyProgressLogging = () => {
  const [formData, setFormData] = useState({
    project: "",
    taskUpdate: "",
    status: "In Progress",
    remarks: "",
    photo: null,
  });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("Progress logged successfully!");
    // You can integrate API call here to send data to backend
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Daily Progress Logging</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Selection */}
        <div>
          <label className="block font-medium">Project:</label>
          <select
            name="project"
            value={formData.project}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Project</option>
            <option value="Project A">Project A</option>
            <option value="Project B">Project B</option>
          </select>
        </div>

        {/* Task Updates */}
        <div>
          <label className="block font-medium">Task Updates:</label>
          <input
            type="text"
            name="taskUpdate"
            value={formData.taskUpdate}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Describe work completed"
            required
          />
        </div>

        {/* Status Update */}
        <div>
          <label className="block font-medium">Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Photo Uploads */}
        <div>
          <label className="block font-medium">Upload Photo:</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Remarks & Notes */}
        <div>
          <label className="block font-medium">Remarks:</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Additional comments"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Submit Progress
        </button>
      </form>
    </div>
  );
};

export default DailyProgressLogging;
