import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useSafetyReportHandlers from "./useSafetyReportHandlers";
import EditSafetyReportModalUI from "./EditSafetyReportModalUI";
import { FILE_URL } from "../../../api/api";


const EditSafetyReportModal = ({ report, onClose, onUpdateSuccess }) => {
    const [isModalOpen, setIsModalOpen] = useState(true);

    const {
        formData,
        setFormData,
        previewImages,
        setPreviewImages,
        projectList,
        loadingProjects,
        handleChange,
        handleProjectSelect,
        handleFileChange,
        handleRemoveImage,
        submitSafetyReportUpdate,
    } = useSafetyReportHandlers();

    // Populate the form when the modal opens
    useEffect(() => {
        if (report) {
            setFormData({
                safety_report_id: report.safety_report_id,
                project_id: report.project_id,
                project_name: report.project_name,
                report_date: report.report_date ? new Date(report.report_date).toISOString().split("T")[0] : today,
                description: report.description,
                status: report.status,
                image1: null, // We'll use previewImages to show existing images
                image2: null,
                user_id: report.user_id,
            });

            setPreviewImages({
                image1: report.image1
                    ? { src: `${FILE_URL}/${report.image1}`, file: null }
                    : null,
                image2: report.image2
                    ? { src: `${FILE_URL}/${report.image2}`, file: null }
                    : null,
            });
        }
    }, [report, setFormData, setPreviewImages]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.project_id) {
            toast.error("Please select a project.");
            return;
        }

        const updatedReport = await submitSafetyReportUpdate(formData);

        if (updatedReport) {
            // ✅ Trigger the callback function from the parent
            // This is the core of "Step 2"
            if (typeof onUpdateSuccess === "function") {
                onUpdateSuccess(updatedReport);
            }

            // Close the modal and reset states
            setIsModalOpen(false);
            if (typeof onClose === "function") onClose();
        }


    };

    if (!isModalOpen) return null;

    return (
        <EditSafetyReportModalUI
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
                if (typeof onClose === "function") onClose();
            }}
        />
    );
};

export default EditSafetyReportModal;
