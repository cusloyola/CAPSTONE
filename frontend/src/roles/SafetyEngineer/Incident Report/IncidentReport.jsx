import React, { useEffect, useRef, useState } from "react";
import IncidentReportTable from "./IncidentReportTable";
import AddIncidentReportModal from "./AddIncidentReportModal";
import ViewIncidentReportModal from "./ViewIncidentReportModal"; // to create
import EditIncidentReportModal from "./EditIncidentReportModal"; // to create

const IncidentReport = () => {
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

  // Load all incident reports
  const loadReports = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/incidentReports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load incident reports", err);
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
    setShowAddModal(false);
    setSelectedReport(null);
    setModalType(null);

    if (shouldRefresh && newReport) {
      setTimeout(() => {
        if (newReport.image1 && !newReport.image1.startsWith("http")) {
          newReport.image1 = `http://localhost:5000${newReport.image1}`;
        }
        if (newReport.image2 && !newReport.image2.startsWith("http")) {
          newReport.image2 = `http://localhost:5000${newReport.image2}`;
        }

        setReports((prev) => [newReport, ...prev]);
        setCurrentPage(1);
      }, 500);
    }

    if (shouldRefresh && !newReport) {
      loadReports();
    }
  };

  const incidentReportColumns = [
    { label: "Project", key: "project_name" },
    {
      label: "Incident Date",
      key: "incident_date",
      format: (value) => new Date(value).toLocaleDateString(),
    },
    { label: "Incident Description", key: "description" },
    { label: "Status", key: "status" },
    { label: "Reported By", key: "full_name" },
  ];

  const handleUpdateSuccess = () => {
    loadReports();
  };

  return (
    <div>
      <IncidentReportTable
        title="Incident Report"
        reports={reports}
        columns={incidentReportColumns}
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
        <AddIncidentReportModal onClose={closeModals} currentUser={user} />
      )}

      {modalType === "view" && selectedReport && (
        <ViewIncidentReportModal report={selectedReport} onClose={closeModals} />
      )}

      {modalType === "edit" && selectedReport && (
        <EditIncidentReportModal
          report={selectedReport}
          onClose={closeModals}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default IncidentReport;
