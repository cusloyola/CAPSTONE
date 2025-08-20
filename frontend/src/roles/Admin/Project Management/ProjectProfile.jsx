import React, { useState } from "react";
import { Outlet, Link, useLocation, useOutletContext } from "react-router-dom";

const ProjectProfile = () => {
    const { project } = useOutletContext(); // Must include billing_id in project
    const location = useLocation();
    const isInProgress = location.pathname.includes("/InProgressProjectTable");
    const [hovered, setHovered] = useState("");

    const isActive = (path) =>
        location.pathname.endsWith(path) || location.pathname.includes(`/${path}`);

    const linkClass = (path) =>
        `flex items-center justify-between px-4 py-4 border-l-4 w-full transition-all relative
        ${isActive(path)
            ? "text-gray-900 border-black font-medium"
            : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-400"
        }`;

    return (
        <div className="flex h-screen gap-4">
            {/* Sidebar */}
            <div className="w-1/6 bg-white shadow rounded flex flex-col items-center relative">
                <nav className="w-full flex flex-col gap-2">
                    <Link to="info" className={linkClass("info")}>
                        <span>Project Info</span>
                    </Link>

                    <Link to="proposals" className={linkClass("proposals")}>
                        <span>Proposals</span>
                    </Link>

                    {isInProgress && (
                        <>
                            {/* <Link to="calendar" className={linkClass("calendar")}>
                                <span>Project Calendar</span>
                            </Link> */}
                            <Link to="materials" className={linkClass("materials")}>
                                <span>Material Request</span>
                            </Link>
                            <div
                                className="relative"
                                onMouseEnter={() => setHovered("billing")}
                                onMouseLeave={() => setHovered("")}
                            >
                                <Link to="billing" className={linkClass("billing")} >
                                    <span>Progress Billing</span>
                                    <svg
                                        className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 10 10"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 1l5 4-5 4" />
                                    </svg>
                                </Link>

                                {hovered === "billing" && (
                                    <div className="absolute top-0 left-full ml-1 bg-white border rounded shadow-lg z-50 w-60">
                                        <Link
                                            to={`/${project.billing_id}/table`}
                                            className="flex items-center justify-between px-4 py-4 hover:bg-gray-100"
                                        >
                                            Progress Billing Table
                                        </Link>
                                        <Link
                                            to={`billing/${project.billing_id}/chart`}
                                            className="flex items-center justify-between px-4 py-4 hover:bg-gray-100"
                                        >
                                            Recent Progress Chart
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Site Reports */}
                            <div
                                className="relative"
                                onMouseEnter={() => setHovered("site-reports")}
                                onMouseLeave={() => setHovered("")}
                            >
                                <Link to="site-reports/daily" className={linkClass("site-reports")}>
                                    <span>Site Reports</span>
                                    <svg className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 1l5 4-5 4" />
                                    </svg>
                                </Link>

                                {hovered === "site-reports" && (
                                    <div className="absolute top-0 left-full ml-1 bg-white border rounded shadow-lg z-50 w-60">
                                        <Link to="site-reports/daily" className="flex items-center justify-between px-4 py-4 hover:bg-gray-100">
                                            Daily Site Report
                                        </Link>
                                        <Link to="site-reports/progress" className="flex items-center justify-between px-4 py-4 hover:bg-gray-100">
                                            Site Progress Billing
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Safety Reports */}
                            <div
                                className="relative"
                                onMouseEnter={() => setHovered("safety-reports")}
                                onMouseLeave={() => setHovered("")}
                            >
                                <Link to="safety-reports" className={linkClass("safety-reports")}>
                                    <span>Safety Reports</span>
                                    <svg className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 1l5 4-5 4" />
                                    </svg>
                                </Link>

                                {hovered === "safety-reports" && (
                                    <div className="absolute top-0 left-full ml-1 bg-white border rounded shadow-lg z-50 w-60">
                                        <Link to="safety-reports/weekly-safety" className="flex items-center justify-between px-4 py-4 hover:bg-gray-100">
                                            Weekly Safety Report
                                        </Link>
                                        <Link to="safety-reports/monthly-safety" className="flex items-center justify-between px-4 py-4 hover:bg-gray-100">
                                            Monthly Safety Report
                                        </Link>
                                         <Link to="safety-reports/inspection-checklist" className="flex items-center justify-between px-4 py-4 hover:bg-gray-100">
                                           Inspection Checklist
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </nav>
            </div>

            {/* Right Panel */}
            <div className="flex-1 bg-white p-4 shadow rounded overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default ProjectProfile;
