import React from "react";
import { toast } from "react-toastify";

const AddSafetyReportModalUI = ({
  formData,
  previewImages,
  projectList,
  handleChange,
  handleProjectSelect,
  handleFileChange,
  handleRemoveImage,
  handleSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Add Safety Report
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Project
            </label>
            <select
              id="project"
              name="project_id"
              value={formData.project_id}
              onChange={handleProjectSelect}
            >
              <option value="">Select Project</option>
              {projectList.map((project) => (
                <option key={project.project_id} value={project.project_id}>
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
              value={formData.report_date}
              onChange={handleChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              required
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
              required
            />
          </div>

          {/* Image Upload 1 */}
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

          {/* Image Upload 2 */}
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

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => onClose(false, null)}
              className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSafetyReportModalUI;