import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const ProgressLineGraph = () => {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dashboard/project-billing-trend");
        const data = await res.json();

        const grouped = {};
        const labelSet = new Set();

        data.forEach((item) => {
          const label = new Date(item.billing_month + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }); // ➜ "Jul 24"
          labelSet.add(label);

          if (!grouped[item.project_name]) grouped[item.project_name] = [];
          grouped[item.project_name].push({
            x: label,
            y: item.wt_accomp_to_date ?? 0,
          });
        });

        const sortedLabels = [...labelSet].sort(
          (a, b) => new Date("1 " + a) - new Date("1 " + b)
        );
const formattedSeries = Object.keys(grouped).map((project) => {
  const map = Object.fromEntries(grouped[project].map((d) => [d.x, d.y]));
  let lastY = 0;

  return {
    name: project,
    data: sortedLabels.map((label) => {
      if (map[label] != null) {
        lastY = map[label];
      }
      return {
        x: label,
        y: lastY,
      };
    }),
  };
});

        setSeries(formattedSeries);
        setCategories(sortedLabels);
      } catch (err) {
        console.error("Failed to fetch project billing trend", err);
      }
    };

    fetchData();
  }, []);

  const options = {
    chart: {
      type: "line",
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    title: {
      text: "Billing Progress by Project",
      align: "left",
    },
    xaxis: {
      type: "category",
      categories: categories,
      title: { text: "Billing Month" },
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val) =>
          typeof val === "number" ? `${val.toFixed(0)}%` : "0%",
      },
      title: {
        text: "% To Date",
      },
    },
    tooltip: {
      x: {
        formatter: (val) => val,
      },
      y: {
        formatter: (val) =>
          typeof val === "number" ? `${val.toFixed(2)}%` : "0%",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Project Progress Over Time</h2>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
};

export default ProgressLineGraph;
