import React from "react";
import ViewAdminSiteReportModalUI from "./ViewAdminSiteReportModalUI";


const ViewAdminSiteReportModal = ({report, onClose}) => {
    return(
     <ViewAdminSiteReportModalUI
        report={report}
        onClose={onClose}

     />
    );
};

export default ViewAdminSiteReportModal;