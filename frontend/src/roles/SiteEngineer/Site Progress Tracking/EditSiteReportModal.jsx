    import React from "react";
import { useSiteReportHandlers } from "./useSiteReportHandlers";
    import EditSiteReportModalUI from "./EditSiteReportModalUI";

    const EditSiteReportModal = ({ report, onClose }) => {
        const {
            formData,
            handleChange,
            handleProjectSelect,
            submitEditedSiteReport,
            handleSubmit,
            handleManpowerChange,
            addManpowerRow,
            removeManpowerRow,
            handleEquipmentChange,
            addEquipmentRow,
            removeEquipmentRow,
            predefinedRoles,
            predefinedEquipment,
            projectList
        } = useSiteReportHandlers(onClose, report);


        return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white w-[90%] md:w-[60%] max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-xl">
                    <EditSiteReportModalUI
                        formData={formData}
                        handleChange={handleChange}
                        handleProjectSelect={handleProjectSelect}
    handleSubmit={handleSubmit} 
onClose={(shouldRefresh) => onClose?.(shouldRefresh)}
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
                </div>
            </div>
        );
    };

    export default EditSiteReportModal;
