import React, { useEffect, useRef, useState } from "react";
import DailySafetyReportTable from "./DailySafetyReportTable";
import AddSafetyReportModal from "./AddSafetyReportModal";

const DailySafetyReport = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const reportRefs = useRef({});
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")); // currently logged-in user

  // ✅ Load all reports from backend
const loadReports = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/safetyReports");
    const data = await res.json();

    // Since API returns an array directly
    if (Array.isArray(data)) {
      setReports(data);
    } else {
      setReports([]);
    }
  } catch (err) {
    console.error("Failed to load safety reports", err);
  }
};


  useEffect(() => {
    loadReports();
  }, []);

  // ✅ Handle modal close & table refresh
  const closeModals = (shouldRefresh = false, newReport = null) => {
    setShowAddModal(false);

    if (shouldRefresh && newReport) {
      // Add new report to the list instantly
      setReports((prev) => [newReport, ...prev]);
    }

    if (shouldRefresh && !newReport) {
      // Reload from DB if no newReport is passed
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
      />

      {showAddModal && (
        <AddSafetyReportModal
          onClose={closeModals}
          currentUser={user} // pass logged-in user to modal
        />
      )}
    </div>
  );
};

export default DailySafetyReport;
