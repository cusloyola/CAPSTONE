import React from "react";
import { FILE_URL } from "../../../api/api";

const EditSafetyReportModalUI = ({
  formData,
  previewImages,
  projectList,
  loadingProjects,
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
          Edit Safety Report
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto"
        >
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Project
            </label>
            <select
              value={formData.project_id || ""}
              onChange={handleProjectSelect}
              disabled={loadingProjects || projectList.length === 0}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Project --</option>
              {projectList.map((p, idx) => (
                <option key={`${p.project_id}-${idx}`} value={p.project_id}>
                  {p.project_name}
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
              value={formData.report_date || ""}
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
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Write a short description of safety observations..."
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>
{/* Image Uploads */}
{["image1", "image2"].map((imgKey) => (
  <div key={imgKey}>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {`Upload ${imgKey === "image1" ? "Image 1" : "Image 2"}`}
    </label>
    <div className="w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 cursor-pointer">
      <input
        type="file"
        name={imgKey}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={imgKey}
      />
      <label htmlFor={imgKey} className="cursor-pointer text-center">
        📷 Click to upload or drag & drop
      </label>

      {previewImages[imgKey] && (
        <div className="relative mt-3">
          <img
            src={previewImages[imgKey].src} // ✅ use .src here
            alt={`Preview ${imgKey}`}
            className="rounded-lg shadow max-h-40 object-cover"
          />
          <button
            type="button"
            onClick={() => handleRemoveImage(imgKey)}
            className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  </div>
))}


          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Update Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSafetyReportModalUI;
