import React, { useEffect, useRef, useState } from "react";
import DailySafetyReportTable from "./DailySafetyReportTable";
import AddSafetyReportModal from "./AddSafetyReportModal";

const DailySafetyReport = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Handle modal close & table refresh
  const closeModals = (shouldRefresh = false, newReport = null) => {
    setShowAddModal(false);

    if (shouldRefresh && newReport) {
      setReports((prev) => [newReport, ...prev]);
      setCurrentPage(1);
    }

    if (shouldRefresh && !newReport) {
      loadReports();
    }
  };

  const dailySafetyColumns = [
    { label: "Project", key: "project_name" }, // now project_name is directly in report
    {
      label: "Report Date",
      key: "report_date",
      format: (value) => new Date(value).toLocaleDateString(),
    },
    { label: "Safety Notes", key: "description" },
    { label: "Status", key: "status" },

    { label: "Prepared By", key: "full_name" },
  ];

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
        selectedReports={selectedReports}
        setSelectedReports={setSelectedReports}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        fetchReports={loadReports}
      />

      {showAddModal && (
        <AddSafetyReportModal
          onClose={closeModals}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default DailySafetyReport;
