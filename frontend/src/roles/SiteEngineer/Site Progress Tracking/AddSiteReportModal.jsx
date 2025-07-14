import React from "react";
import useSiteReportHandlers from "./useSiteReportHandlers";
import AddSiteReportModalUI from "./AddSiteReportModalUI";

const AddSiteReportModal = ({ onClose }) => {
    const {
        formData,
        handleChange,
        handleProjectSelect,
        submitSiteReport,
        handleManpowerChange,
        addManpowerRow,
        removeManpowerRow,
        handleEquipmentChange,
        addEquipmentRow,
        removeEquipmentRow,
        predefinedRoles,
        predefinedEquipment,
        projectList
    } = useSiteReportHandlers(onClose);

    return (
        <AddSiteReportModalUI
            formData={formData}
            handleChange={handleChange}
            handleProjectSelect={handleProjectSelect}
            handleSubmit={submitSiteReport}
            onClose={onClose}
            handleManpowerChange={handleManpowerChange}
            addManpowerRow={addManpowerRow}
            removeManpowerRow={removeManpowerRow}
            handleEquipmentChange={handleEquipmentChange}
            addEquipmentRow={addEquipmentRow}
            removeEquipmentRow={removeEquipmentRow}
            predefinedRoles={predefinedRoles}
            predefinedEquipment={predefinedEquipment}
            projectList={projectList}
        />
    );
};

export default AddSiteReportModal;
