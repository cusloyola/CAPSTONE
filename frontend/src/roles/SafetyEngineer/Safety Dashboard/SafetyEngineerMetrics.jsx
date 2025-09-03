import React, { useEffect, useState } from "react";
// import {
//   ArrowDownIcon,
//   ArrowUpIcon,
//   // BoxIconLine,
//   // GroupIcon,
//   // FileCheckIcon,
// } from "../../../icons";
// import Badge from "../../../components/ui/badge/Badge";
import { fetchDashboardMetrics } from "../../../api/dashboardMetricsApi";

export default function SafetyEngineerMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMetrics = async () => {
      try {
        const data = await fetchDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    };

    getMetrics();
  }, []);

  if (loading) {
    return <div>Loading dashboard metrics...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        {/* Total Assigned Projects */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {/* Check icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M8 17q.425 0 .713-.288T9 16t-.288-.712T8 15t-.712.288T7 16t.288.713T8 17m0-4q.425 0 .713-.288T9 12t-.288-.712T8 11t-.712.288T7 12t.288.713T8 13m0-4q.425 0 .713-.288T9 8t-.288-.712T8 7t-.712.288T7 8t.288.713T8 9m3 8h6v-2h-6zm0-4h6v-2h-6zm0-4h6V7h-6zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z"
              />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-base text-gray-500 dark:text-gray-400">
                Total Assigned Projects
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                {metrics?.totalProjects ?? "N/A"}
              </h4>
            </div>
          </div>
        </div>

        {/* On Going Projects */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {/* Dots icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17 22q-2.075 0-3.537-1.463T12 17t1.463-3.537T17 12t3.538 1.463T22 17t-1.463 3.538T17 22m1.675-2.625l.7-.7L17.5 16.8V14h-1v3.2zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h4.175q.275-.875 1.075-1.437T12 1q1 0 1.788.563T14.85 3H19q.825 0 1.413.588T21 5v6.25q-.45-.325-.95-.55T19 10.3V5h-2v3H7V5H5v14h5.3q.175.55.4 1.05t.55.95zm7-16q.425 0 .713-.288T13 4t-.288-.712T12 3t-.712.288T11 4t.288.713T12 5"
              />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-base text-gray-500 dark:text-gray-400">
                On Going Projects
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                {metrics?.inProgressProjects ?? "N/A"}
              </h4>
            </div>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {/* Completed icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path fill="currentColor" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z" />
            </svg>
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-base text-gray-500 dark:text-gray-400">
                Completed Projects
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                {metrics?.completedProjects ?? "N/A"}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* New layout: left column for totals, right column for project progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Left column */}
        <div className="flex flex-col gap-4 col-span-1 h-full">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col gap-4 h-full">
              {/* Weekly Safety Report */}
              <div className="rounded-2xl border border-gray-200 bg-white p-2 flex-1 min-h-[100px] dark:border-gray-800 dark:bg-white/[0.03] flex flex-col items-start justify-center pl-2">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-2">
                  {/* Calendar icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zM5 8h14V6H5zm0 0V6z" />
                  </svg>
                </div>
                <span className="text-base text-gray-500 dark:text-gray-400 mt-1">
                  Total Submitted Weekly Safety Report
                </span>
                <h4 className="mt-1 font-bold text-gray-800 text-2xl dark:text-white/90">
                  {metrics?.weeklySafetyReports ?? "N/A"}
                </h4>
              </div>

              {/* Inspection Checklist */}
              <div className="rounded-2xl border border-gray-200 bg-white p-2 flex-1 min-h-[100px] dark:border-gray-800 dark:bg-white/[0.03] flex flex-col items-start justify-center pl-2">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-2">
                  {/* Clipboard icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14 22v-3.075l5.525-5.5q.225-.225.5-.325t.55-.1q.3 0 .575.113t.5.337l.925.925q.2.225.313.5t.112.55t-.1.563t-.325.512l-5.5 5.5zm7.5-6.575l-.925-.925zm-6 5.075h.95l3.025-3.05l-.45-.475l-.475-.45l-3.05 3.025zM6 22q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h8l6 6v3h-2V9h-5V4H6v16h6v2zm13.025-5.025l-.475-.45l.925.925z" />
                  </svg>
                </div>
                <span className="text-base text-gray-500 dark:text-gray-400 mt-1">
                  Total Submitted Inspection Checklist Report
                </span>
                <h4 className="mt-1 font-bold text-gray-800 text-2xl dark:text-white/90">
                  {metrics?.inspectionReports ?? "N/A"}
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Right column placeholder */}
        <div className="col-span-2 flex flex-col justify-between"></div>
      </div>
    </>
  );
}
