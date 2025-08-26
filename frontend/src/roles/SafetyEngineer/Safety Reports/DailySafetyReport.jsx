import React, { useEffect, useRef, useState } from "react";
import DailySafetyReportTable from "./DailySafetyReportTable";
import AddSafetyReportModal from "./AddSafetyReportModal";
import ViewSafetyReportModal from "./ViewSafetyReportModal"; // to create
import EditSafetyReportModal from "./EditSafetyReportModal"; // to create

const DailySafetyReport = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReport, setSelectedReport] = useState(null);
  const [modalType, setModalType] = useState(null); // "view" | "edit"

  const reportRefs = useRef({});
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Load all reports
  const loadReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/safetyReports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load safety reports", err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Handle view/edit action
  const handleAction = (report, actionType) => {
    setSelectedReport(report);
    setModalType(actionType);
  };

  // Handle modal close & table refresh
  const closeModals = (shouldRefresh = false, newReport = null) => {
    // 1. Close all modals by resetting their state
    setShowAddModal(false);
    setSelectedReport(null);
    setModalType(null);

    // 2. If a new report was created, handle it with a delay
    if (shouldRefresh && newReport) {
      // Add a short delay to give the server time to save the images
      setTimeout(() => {
        // Check if image paths are relative and make them absolute
        if (newReport.image1 && !newReport.image1.startsWith("http")) {
          newReport.image1 = `http://localhost:5000${newReport.image1}`;
        }
        if (newReport.image2 && !newReport.image2.startsWith("http")) {
          newReport.image2 = `http://localhost:5000${newReport.image2}`;
        }

        // Update the main reports list
        setReports((prev) => [newReport, ...prev]);
        setCurrentPage(1);

      }, 500); // 500 milliseconds is a reliable delay
    }

    // 3. If a full refresh is required (e.g., after a delete operation)
    // and no new report data is provided, reload all reports from the API.
    if (shouldRefresh && !newReport) {
      loadReports();
    }
  };

  const dailySafetyColumns = [
    { label: "Project", key: "project_name" },
    {
      label: "Report Date",
      key: "report_date",
      format: (value) => new Date(value).toLocaleDateString(),
    },
    { label: "Safety Notes", key: "description" },
    { label: "Status", key: "status" },
    { label: "Prepared By", key: "full_name" },
  ];

  const handleUpdateSuccess = () => {
    loadReports(); // Re-fetch the list to get the updated data
  };

  return (
    <div>
      <DailySafetyReportTable
        title="Daily Safety Report"
        reports={reports}
        columns={dailySafetyColumns}
        userRole="safety_engineer"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        reportRefs={reportRefs}
        onAdd={() => setShowAddModal(true)}
        onAction={handleAction}
        selectedReports={selectedReports}
        setSelectedReports={setSelectedReports}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        fetchReports={loadReports}
      />

      {showAddModal && (
        <AddSafetyReportModal onClose={closeModals} currentUser={user} />
      )}

      {modalType === "view" && selectedReport && (
        <ViewSafetyReportModal report={selectedReport} onClose={closeModals} />
      )}

      {modalType === "edit" && selectedReport && (
        <EditSafetyReportModal report={selectedReport} onClose={closeModals} onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default DailySafetyReport;
