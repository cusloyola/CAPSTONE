import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
const AddSafetyReportModalUI = ({ onClose }) => {
  const [formData, setFormData] = useState({
    project_id: "",
    project_name: "",
    report_date: new Date().toLocaleDateString("en-CA"), // ✅ local date, no offset
    description: "",
    image1: null,
    image2: null,
  });

  const [previewImages, setPreviewImages] = useState({
    image1: null,
    image2: null,
  });

  const [projectList, setProjectList] = useState([]);

  // 📌 Fetch projects dynamically
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects");
        const data = await res.json();
        setProjectList(data);
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  // 📌 Handle text/date inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 📌 Handle project selection
  const handleProjectSelect = (e) => {
    const selectedName = e.target.value;
    const selectedProject = projectList.find(
      (p) => p.project_name === selectedName
    );
    if (selectedProject) {
      setFormData((prev) => ({
        ...prev,
        project_name: selectedProject.project_name,
        project_id: selectedProject.project_id,
      }));
    }
  };

  // 📌 Handle file uploads + preview
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPreviewImages((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(files[0]),
      }));
    }
  };

  // 📌 Remove uploaded image
  const handleRemoveImage = (field) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    setPreviewImages((prev) => ({ ...prev, [field]: null }));
  };

  // 📌 Submit to backend
  // 📌 Submit to backend
  const handleSubmit = async () => {
    try {
      const payload = new FormData();
      payload.append("project_id", formData.project_id);
      payload.append("report_date", formData.report_date);
      payload.append("description", formData.description);

      if (formData.image1) payload.append("image1", formData.image1);
      if (formData.image2) payload.append("image2", formData.image2);

      const response = await fetch("http://localhost:5000/api/safetyReports", {
        method: "POST",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit safety report");
      }

      console.log("✅ Safety Report submitted:", data);

      toast.success("Safety report submitted successfully!");

      // ✅ pass new report back to parent
      onClose?.(true, data);
    } catch (err) {
      console.error("❌ Submit failed:", err.message);
      toast.error("Failed to submit report. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add Safety Report
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Project
            </label>
            <select
              name="project_name"
              value={formData.project_name}
              onChange={handleProjectSelect}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Project --</option>
              {projectList.map((project) => (
                <option key={project.project_id} value={project.project_name}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* Report Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Report Date
            </label>
            <input
              type="date"
              name="report_date"
              value={formData.report_date}   // ✅ already a YYYY-MM-DD string
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Write a short description of safety observations..."
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Image Uploads with Preview */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Image 1
            </label>
            <div className="w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 cursor-pointer">
              <input
                type="file"
                name="image1"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image1"
              />
              <label htmlFor="image1" className="cursor-pointer text-center">
                📷 Click to upload or drag & drop
              </label>
              {previewImages.image1 && (
                <div className="relative mt-3">
                  <img
                    src={previewImages.image1}
                    alt="Preview 1"
                    className="rounded-lg shadow max-h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("image1")}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Image 2
            </label>
            <div className="w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 cursor-pointer">
              <input
                type="file"
                name="image2"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image2"
              />
              <label htmlFor="image2" className="cursor-pointer text-center">
                📷 Click to upload or drag & drop
              </label>
              {previewImages.image2 && (
                <div className="relative mt-3">
                  <img
                    src={previewImages.image2}
                    alt="Preview 2"
                    className="rounded-lg shadow max-h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage("image2")}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSafetyReportModalUI;
