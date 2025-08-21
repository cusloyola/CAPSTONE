import React, { useState } from "react";
import useSafetyReportHandlers from "./useSafetyReportHandlers";
import AddSafetyReportModalUI from "./AddSafetyReportModalUI";

const AddSafetyReportModal = ({ onClose, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const {
    formData,
    previewImages,
    projectList,
    handleChange,
    handleProjectSelect,
    handleFileChange,
    handleRemoveImage,
    submitSafetyReport,
  } = useSafetyReportHandlers(async (success, newReport) => {
    if (success) {
      setIsModalOpen(false);
      if (typeof onClose === "function") {
        onClose(true, { ...newReport, full_name: currentUser.full_name });
      }
    } else {
      // Optionally handle error
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, user_id: currentUser.id };

    const data = await submitSafetyReport(payload);
    if (data) {
      console.log("✅ Report submitted:", data);
      onClose(true, data); // refresh table with new data
    }
  };



  return (
    isModalOpen && (
      <AddSafetyReportModalUI
        formData={formData}
        previewImages={previewImages}
        projectList={projectList}
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
    )
  );
};

export default AddSafetyReportModal;