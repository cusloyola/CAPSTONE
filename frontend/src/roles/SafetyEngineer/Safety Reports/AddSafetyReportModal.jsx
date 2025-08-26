import React, { useState } from "react";
import { toast } from "react-toastify";
import useSafetyReportHandlers from "./useSafetyReportHandlers";
import AddSafetyReportModalUI from "./AddSafetyReportModalUI";

const AddSafetyReportModal = ({ onClose, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const {
    formData,
    previewImages,
    projectList,
    loadingProjects,
    handleChange,
    handleProjectSelect,
    handleFileChange,
    handleRemoveImage,
    submitSafetyReport,
  } = useSafetyReportHandlers();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_id) {
      toast.error("Please select a project.");
      return;
    }

    const payload = { ...formData, user_id: currentUser.id };
    const newReport = await submitSafetyReport(payload);

    if (newReport) {
      const project = projectList.find(
        (p) => String(p.project_id) === String(newReport.project_id)
      );
      const userFullName = currentUser?.name || "Unknown User";

      const normalizePath = (path) =>
        path ? (path.startsWith("http") ? path : `http://localhost:5000${path}`) : null;

      const reportForTable = {
        safety_report_id: newReport.safety_report_id || newReport.insertId,
        project_name: project ? project.project_name : "Unknown Project",
        description: newReport.description,
        full_name: userFullName,
        report_date: newReport.report_date,
        status: "pending",
        // ✅ Always normalized
        image1: normalizePath(newReport.image1),
        image2: normalizePath(newReport.image2),
      };

      setIsModalOpen(false);
      if (typeof onClose === "function") onClose(true, reportForTable);
    }
  };

  if (!isModalOpen) return null;

  return (
    <AddSafetyReportModalUI
      formData={formData}
      previewImages={previewImages}
      projectList={projectList}
      loadingProjects={loadingProjects}
      handleChange={handleChange}
      handleProjectSelect={handleProjectSelect}
      handleFileChange={handleFileChange}
      handleRemoveImage={handleRemoveImage}
      handleSubmit={handleSubmit}
      onClose={() => {
        setIsModalOpen(false);
        if (typeof onClose === "function") onClose(false, null);
      }}
    />
  );
};

export default AddSafetyReportModal;
