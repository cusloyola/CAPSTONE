import React, { useState } from "react";
import useSafetyReportHandlers from "./useSafetyReportHandlers";
import AddSafetyReportModalUI from "./AddSafetyReportModalUI";

const AddSafetyReportModal = ({ onClose }) => {
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
  } = useSafetyReportHandlers((refresh, newReport) => {
    setIsModalOpen(false);
    if (typeof onClose === "function") {
      onClose(refresh, newReport);  // ✅ pass up to parent
    }
  });

  return (
    <AddSafetyReportModalUI
      formData={formData}
      previewImages={previewImages}
      projectList={projectList}
      handleChange={handleChange}
      handleProjectSelect={handleProjectSelect}
      handleFileChange={handleFileChange}
      handleRemoveImage={handleRemoveImage}
      handleSubmit={submitSafetyReport}
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        if (typeof onClose === "function") {
          onClose(false, null); // 👈 cancel without refresh
        }
      }}
    />
  );
};

export default AddSafetyReportModal;
