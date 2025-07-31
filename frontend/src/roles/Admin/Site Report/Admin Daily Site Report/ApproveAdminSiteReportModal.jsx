import React, { useState, useEffect } from "react";
import ApproveAdminSiteReportModalUI from "./ApproveAdminSiteReportModalUI";

const ApproveAdminSiteReportModal = ({ isOpen, onClose, report, onApprove }) => {
  const [remarks, setRemarks] = useState("");

  

const handleApprove = async () => {
  try {
 const res = await fetch(`http://localhost:5000/api/daily-site-report/editStatus/${report.report_id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "Approved", admin_remarks: remarks }),
});


    const data = await res.json();
    console.log("Status Updated", data);


    onApprove(remarks); // Still notify parent
    setRemarks("");
    onClose();
  } catch (err) {
    console.error("Error approving report:", err);
  }
};




  

  return (
    <ApproveAdminSiteReportModalUI
      isOpen={isOpen}
      onClose={onClose}
      report={report}
      remarks={remarks}
      setRemarks={setRemarks}
      onApprove={handleApprove}
    />
  );
};

export default ApproveAdminSiteReportModal;
