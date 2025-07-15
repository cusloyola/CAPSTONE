import React from "react";
import ViewSiteReportModalUI from "./ViewSiteReportModalUI";

const ViewSiteReportModal = ({ report, onClose }) => {
    return (
        <ViewSiteReportModalUI
            report={report}
            onClose={onClose}
        />
    );
};

export default ViewSiteReportModal;
