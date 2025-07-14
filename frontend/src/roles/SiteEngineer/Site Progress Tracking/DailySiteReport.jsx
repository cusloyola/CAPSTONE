import React, { useEffect, useState, useRef } from "react";
import ReportTable from "../../../components/tables/ReportTables/ReportTable";
import AddSiteReportModal from "./AddSiteReportModal";

const DailySiteReport = () => {
    const [reports, setReports] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const reportRefs = useRef({});

    // useEffect(() => {
    //     fetch("http://localhost:5000/api/safety-reports/mine") // Fetch only their reports
    //         .then((res) => res.json())
    //         .then(setReports);
    // }, []);

    return (
        <div>
            <ReportTable
                title="Daily Site Report"
                reports={reports}
                userRole="site_engineer"
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                reportRefs={reportRefs}
                onViewSummary={(r) => console.log("View summary", r)}
                onDownloadPDF={(id) => console.log("Download PDF", id)}
                onAdd={() => setShowModal(true)} 

            />

            {showModal && (
                <AddSiteReportModal onClose={() => setShowModal(false)} />
            )}
        </div>

    );
};

export default DailySiteReport;
