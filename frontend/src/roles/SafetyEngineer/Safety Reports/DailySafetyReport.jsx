import React, { useEffect, useState, useRef } from "react";
import DailySafetyReportTable from "./DailySafetyReportTable";
import AddSafetyReportModal from "./AddSafetyReportModal";
import { StatusBadge } from "../../Admin/Site Report/dsrButtons";

const DailySafetyReport = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const reportRefs = useRef({});
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const loadReports = () => {
    fetch("http://localhost:5000/api/safetyReports")
      .then((res) => res.json())
      .then((res) => {
        if (Array.isArray(res.data)) {
          setReports(res.data);
        } else if (res.data) {
          setReports([res.data]);
        } else {
          setReports([]);
        }
      })
      .catch((err) => console.error("Failed to load safety reports", err));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const closeModals = (shouldRefresh = false, newReport = null) => {
    if (shouldRefresh && newReport) {
      // ✅ Optimistically add new report at the top of the list
      setReports((prev) => [newReport, ...prev]);
    } else if (shouldRefresh) {
      // ✅ fallback if no newReport returned
      loadReports();
    }

    setShowAddModal(false);
  };


  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]); // deselect all
    } else {
      const allIds = filteredReports.map((r) => r.report_id); // only current filtered reports
      setSelectedReports(allIds); // select all
    }
    setSelectAll(!selectAll);
  };

  const dailySafetyColumns = [
    {
      label: "Project",
      key: "project_name",
    },
    {
      label: "Report Date",
      key: "report_date",
      format: (value) => new Date(value).toLocaleDateString(),
    },
    {
      label: "Safety Notes",
      key: "safety_notes",
    },
    {
      label: "Prepared By",
      key: "full_name",
    },
    {
      label: "Status",
      key: "status",
      customRender: (report) => <StatusBadge status={report.status} />,
    },
  ];

  return (
    <div>
      <DailySafetyReportTable
        title="Daily Safety Report"
        reports={reports}
        columns={dailySafetyColumns}
        userRole="site_engineer"
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

      {showAddModal && <AddSafetyReportModal onClose={closeModals} />}
    </div>
  );
};

export default DailySafetyReport;
