import React, { useState } from "react";
import { toast } from "react-toastify";
import useIncidentReportHandlers from "./useIncidentReportHandlers"; // <-- new hook
import AddIncidentReportModalUI from "./AddIncidentReportModalUI"; // <-- new UI

const AddIncidentReportModal = ({ onClose, currentUser }) => {
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
    submitIncidentReport, // <-- new submit handler
  } = useIncidentReportHandlers();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.project_id) {
      toast.error("Please select a project.");
      return;
    }

    const payload = { ...formData, user_id: currentUser.id };
    const newReport = await submitIncidentReport(payload);

    if (newReport) {
      const project = projectList.find(
        (p) => String(p.project_id) === String(newReport.project_id)
      );
      const userFullName = currentUser?.name || "Unknown User";

      const normalizePath = (path) =>
        path ? (path.startsWith("http") ? path : `http://localhost:5000${path}`) : null;

      const reportForTable = {
        incident_report_id: newReport.incident_report_id || newReport.insertId,
        project_name: project ? project.project_name : "Unknown Project",
        description: newReport.description,
        full_name: userFullName,
        report_date: newReport.report_date,
        status: "pending",
        // ✅ Supports 4 images
        image1: normalizePath(newReport.image1),
        image2: normalizePath(newReport.image2),
        image3: normalizePath(newReport.image3),
        image4: normalizePath(newReport.image4),
      };

      setIsModalOpen(false);
      if (typeof onClose === "function") onClose(true, reportForTable);
    }
  };

  if (!isModalOpen) return null;

  return (
    <AddIncidentReportModalUI
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

export default AddIncidentReportModal;
