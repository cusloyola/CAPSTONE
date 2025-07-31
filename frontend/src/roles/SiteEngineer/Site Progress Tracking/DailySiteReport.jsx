import React, { useEffect, useState, useRef } from "react";
import DailySiteReportTable from "./DailySiteReportTable";
import AddSiteReportModal from "./AddSiteReportModal";
import ViewSiteReportModal from "./ViewSiteReportModal"; // You’ll create this
import EditSiteReportModal from "./EditSiteReportModal"; // You’ll create this

import { StatusBadge } from "../../Admin/Site Report/dsrButtons";

const DailySiteReport = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [modalType, setModalType] = useState(null); // "view" | "edit"

  const reportRefs = useRef({});

  const loadReports = () => {
    fetch("http://localhost:5000/api/daily-site-report/getSiteReport")
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
      .catch((err) => console.error("Failed to load reports", err));
  };

  useEffect(() => {
    loadReports();
  }, []);


  const handleAction = (report, actionType) => {

    setSelectedReport(report);
    setModalType(actionType);
  };


  useEffect(() => {
    console.log("🟡 Modal Type:", modalType);
    console.log("🟡 Selected Report:", selectedReport);
  }, [modalType, selectedReport]);

  const closeModals = (shouldRefresh = false) => {
    if (shouldRefresh) {
      loadReports();
    }
    setShowAddModal(false);
    setSelectedReport(null);
    setModalType(null);
  };


  const dailySiteColumns = [
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
      label: "Notes",
      key: "notes",
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
      <DailySiteReportTable
        title="Daily Site Report"
        reports={reports}
        columns={dailySiteColumns}
        userRole="site_engineer"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        reportRefs={reportRefs}
        onAction={handleAction}
        onAdd={() => setShowAddModal(true)}
      />


      {showAddModal &&
        <AddSiteReportModal onClose={closeModals} />}
      {modalType === "view" && selectedReport && (
        <ViewSiteReportModal report={selectedReport} onClose={closeModals} />
      )}

      {modalType === "edit" && selectedReport && (
        <EditSiteReportModal report={selectedReport} onClose={closeModals} />
      )}

    </div>
  );
};

export default DailySiteReport;
