import React from "react";
import { Outlet, Link, useLocation, useOutletContext } from "react-router-dom";

const ProjectProfile = () => {
  const { project } = useOutletContext();
  const location = useLocation();
  const isInProgress = location.pathname.includes("/InProgressProjectTable");

  const isActive = (path) =>
    location.pathname.endsWith(path) || location.pathname.includes(`/${path}`);

  const tabClass = (path) =>
    `flex items-center gap-1 px-4 py-2 border-b-2 transition-all
    ${isActive(path)
      ? "border-black text-gray-900 font-medium"
      : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-400"
    }`;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white shadow px-4 py-1">
        <h1 className="text-1xl font-semibold"></h1>
      </div>

      {/* Horizontal Tabs */}
      <div className="bg-white border-b flex gap-6 px-6 align-items justify-center">
        <div>
          <Link to="info" className={tabClass("info")}>
            Project Info
          </Link>
        </div>

        <div>
          <Link to="proposals" className={tabClass("proposals")}>
            Proposals
          </Link>
        </div>

        {isInProgress && (
          <>
            <div>
              <Link to="ganttChart" className={tabClass("ganttChart")}>
                Gantt Chart
              </Link>
            </div>

            {/* Progress Billing with dropdown */}
          {/* Progress Billing with dropdown */}
<div className="relative group">
  <Link to="billing" className={tabClass("billing")}>
    Progress Billing
  </Link>

  {/* <div className="absolute hidden group-hover:block bg-white border rounded shadow-lg mt-1 z-50">
    <Link
      to={`billing/${project.billing_id}/table`}
      className="block px-4 py-2 hover:bg-gray-100"
    >
      Progress Billing Table
    </Link>
    <Link
      to={`billing/${project.billing_id}/chart`}
      className="block px-4 py-2 hover:bg-gray-100"
    >
      Recent Progress Chart
    </Link>
  </div> */}
</div>

            {/* Site Reports dropdown */}
            <div className="relative group">
              <button className={tabClass("site-reports")}>
                Site Reports
                <span className="ml-1">▾</span>
              </button>
              <div className="absolute hidden group-hover:block bg-white border rounded shadow-lg mt-1 z-50">
                <Link
                  to="site-reports/daily"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Daily Site Report
                </Link>
                <Link
                  to="site-reports/progress"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Site Progress Billing
                </Link>
              </div>
            </div>

            {/* Safety Reports dropdown */}
            <div className="relative group">
              <button className={tabClass("safety-reports")}>
                Safety Reports
                <span className="ml-1">▾</span>
              </button>
              <div className="absolute hidden group-hover:block bg-white border rounded shadow-lg mt-1 z-50">
                <Link
                  to="safety-reports/weekly-safety"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Weekly Safety Report
                </Link>
                <Link
                  to="safety-reports/monthly-safety"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Monthly Safety Report
                </Link>
                <Link
                  to="safety-reports/inspection-checklist"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Inspection Checklist
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Page Content */}
      <div className="flex-1 bg-white p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default ProjectProfile;
