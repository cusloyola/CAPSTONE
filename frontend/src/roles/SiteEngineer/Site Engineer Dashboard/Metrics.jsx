import React, { useEffect, useState } from "react";
import { fetchDashboardMetrics } from "../../../api/dashboardMetricsApi";

export default function SiteEngineerMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMetrics = async () => {
      try {
        const data = await fetchDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err.message || "Error fetching metrics");
      } finally {
        setLoading(false);
      }
    };
    getMetrics();
  }, []);

  if (loading) return <div>Loading dashboard metrics...</div>;
  if (error) return <div>Error: {error}</div>;

  const cards = [
    {
      title: "Total Projects",
      value: metrics?.totalProjects ?? "N/A",
      iconColor: "#ffffff",
      bgColor: "#6890f9",
      iconPath: "M12 2L2 12h3v8h6v-6h2v6h6v-8h3z",
    },
    {
      title: "On Going Projects",
      value: metrics?.inProgressProjects ?? "N/A",
      iconColor: "#ffffff",
      bgColor: "#fcc764",
      iconPath:
        "M17 22q-2.075 0-3.537-1.463T12 17t1.463-3.537T17 12t3.538 1.463T22 17t-1.463 3.538T17 22",
    },
    {
      title: "Completed Projects",
      value: metrics?.completedProjects ?? "N/A",
      iconColor: "#ffffff",
      bgColor: "#ff9062",
      iconPath: "m9.55 18l-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z",
    },
    {
      title: "Total Reports",
      value: metrics?.totalReports ?? "N/A",
      iconColor: "#ffffff",
      bgColor: "#855bf9",
      iconPath:
        "M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22z",
    },
  ];

  return (
    <div className="h-full">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 h-full">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-200 p-4 flex flex-col justify-between h-full min-h-[160px]"
            style={{ backgroundColor: card.bgColor }}
          >
            {/* Icon */}
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg mb-3 p-2"
              style={{ backgroundColor: card.iconColor }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d={card.iconPath} />
              </svg>
            </div>

            {/* Title */}
            <span className="text-sm font-semibold text-white">
              {card.title}
            </span>

            {/* Value */}
            <h4 className="mt-1 font-bold text-white text-2xl">
              {card.value}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
}
