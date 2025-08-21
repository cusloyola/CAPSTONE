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

    console.log("🚀 formData at submit:", formData);

    const payload = { ...formData, user_id: currentUser.id };
    const newReport = await submitSafetyReport(payload);

    console.log("currentUser at mount:", currentUser);

    if (newReport) {
      const project = projectList.find(
        (p) => String(p.project_id) === String(newReport.project_id)
      );
      const userFullName = currentUser?.name || "Unknown User";

      console.log("🔍 matched project:", project);

      const reportForTable = {
        safety_report_id: newReport.safety_report_id || newReport.insertId,
        project_name: project ? project.project_name : "Unknown Project",
        description: newReport.description,

        full_name: userFullName,
        report_date: newReport.report_date,
        status: "pending",
      };

      console.log("📝 reportForTable to send to table:", reportForTable);

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
