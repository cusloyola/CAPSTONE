import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import AdminDailySiteReportTable from "./AdminDailySiteReportTable";
import ViewAdminSiteReportModal from "./ViewAdminSiteReportModal";
import { StatusBadge } from "../../../Admin/Site Report/dsrButtons";
import ApproveAdminSiteReportModal from "./ApproveAdminSiteReportModal";
import { FcInspection, FcExport  } from "react-icons/fc";
import { FaEyeSlash } from 'react-icons/fa';



const AdminDailySiteReport = () => {
  const { project_id } = useParams();

  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [modalType, setModalType] = useState(null); // "view" | "edit"

  const reportRefs = useRef({});

  const loadReports = () => {
    fetch(`http://localhost:5000/api/daily-site-report/getAdminSiteReport/${project_id}`)
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

  // Derived stats
  const totalReports = reports.length;
  const unviewedReports = reports.filter((r) => !r.last_viewed).length;
  const viewedReports = reports.filter(r => r.last_viewed !== null).length;


  const handleAction = async (report, actionType) => {
    if (actionType === "view") {
      try {
        await fetch(`http://localhost:5000/api/daily-site-report/markViewed/${report.report_id}`, {
          method: "PUT",
        });

        const updatedReport = {
          ...report,
          last_viewed: new Date().toISOString(),
        };

        handleUpdateReport(updatedReport);
      } catch (err) {
        console.error("Failed to mark as viewed", err);
      }
    }

    setSelectedReport(report);
    setModalType(actionType);
  };


  const handleUpdateReport = (updatedReport) => {
    setReports((prevReports) =>
      prevReports.map((r) =>
        r.report_id === updatedReport.report_id ? updatedReport : r
      )
    );
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
      label: "Prepared By",
      key: "full_name",
    },

    {
      label: "Last Viewed",
      key: "last_viewed",
      format: (value) =>
        value
          ? new Date(value).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })
          : "Unviewed",


    },
    {
      label: "Status",
      key: "status",
      customRender: (report) => <StatusBadge status={report.status} />,
    },
  ];


  return (
    <div className="p-6 min-h-screen space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4zm0 4h10v2H4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Daily Site Reports
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
          <p className="text-sm text-gray-500">Reports Submitted</p>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-800">{totalReports}</h2>
            <FcInspection className="text-3xl" />
          </div>
          <p className="text-blue-600 text-sm">Daily logs compiled</p>
        </div>

        {/* Unviewed Reports */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow space-y-2">
          <p className="text-sm text-gray-500">Unviewed Reports</p>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-800">{unviewedReports}</h2>
            <FaEyeSlash className="text-3xl text-gray-600" />
          </div>
          <p className="text-blue-600 text-sm">Up to date</p>
        </div>

        <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow space-y-2 col-span-1 md:col-span-2 lg:col-span-2">
          <p className="text-sm text-gray-500">Site Activity Completion</p>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-700 h-full"
              style={{
                width: `${((totalReports - unviewedReports) / totalReports) * 100 || 0}%`,
              }}
            ></div>
            <div
              className="bg-blue-300 h-full"
              style={{
                width: `${(unviewedReports / totalReports) * 100 || 0}%`,
              }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-1 flex justify-between">
            <span className="text-blue-700">
              {Math.round(
                ((totalReports - unviewedReports) / totalReports) * 100 || 0
              )}
              % Viewed
            </span>
            <span className="text-blue-400">
              {Math.round((unviewedReports / totalReports) * 100 || 0)}% Unviewed
            </span>
          </div>
        </div>
      </div>



      <AdminDailySiteReportTable
        title="Daily Site Report"
        reports={reports}
        columns={dailySiteColumns}
        userRole="admin"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        reportRefs={reportRefs}
        onAction={handleAction}
        onAdd={() => setShowAddModal(true)}
        onUpdateReport={handleUpdateReport}
      />


      {modalType === "view" && selectedReport && (
        <ViewAdminSiteReportModal report={selectedReport} onClose={closeModals} />
      )}

      {modalType === "edit" && selectedReport && (
        <ApproveAdminSiteReportModal report={selectedReport} onClose={closeModals} />
      )}






    </div>
  );
};


export default AdminDailySiteReport;