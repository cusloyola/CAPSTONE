import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useIncidentReportHandlers from "./useIncidentReportHandlers";
import EditIncidentReportModalUI from "./EditIncidentReportModalUI";
import { FILE_URL } from "../../../api/api";


const EditIncidentReportModal = ({ report, onClose, onUpdateSuccess }) => {
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
        submitIncidentReportUpdate,
    } = useIncidentReportHandlers();

    // Populate the form when the modal opens
    useEffect(() => {
        if (report) {
            const today = new Date().toISOString().split("T")[0];
            setFormData({
                incident_report_id: report.incident_report_id,
                project_id: report.project_id,
                project_name: report.project_name,
                incident_date: report.report_date ? new Date(report.report_date).toISOString().split("T")[0] : today,
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
                image3: report.image2
                    ? { src: `${FILE_URL}/${report.image2}`, file: null }
                    : null,
                image4: report.image4
                    ? { src: `${FILE_URL}/${report.image4}`, file: null }
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

        // Convert incident_date back to report_date for backend compatibility
        const submitData = {
            ...formData,
            report_date: formData.incident_date,
        };
        delete submitData.incident_date;

        const updatedReport = await submitIncidentReportUpdate(submitData);

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
        <EditIncidentReportModalUI
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

export default EditIncidentReportModal;
