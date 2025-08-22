import React, { useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const ApexChart = () => {
  const [state, setState] = React.useState({
    series: [],
    options: {
      chart: {
        height: 600,
        type: "area", // changed to area
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
    opacityTo: 0.7,   // fade to transparent at top
    stops: [0, 90, 100],
        },
      },
      title: {
        text: "Billing Progress by Project",
        align: "left",
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"],
          opacity: 0.5,
        },
      },
      xaxis: {
        type: "category",
        categories: [],
        title: { text: "Billing Month" },
      },
      yaxis: {
  min: 0,          // start at 0
  max: 100,        // maximum value (or adjust as needed)
  tickAmount: 10,  // number of ticks (0,10,20,...,100)
  labels: {
    formatter: (val) => (typeof val === "number" ? `${val.toFixed(0)}%` : "0%"),
  },
  title: { text: "% To Date" },
},

      tooltip: {
        x: { formatter: (val) => val },
        y: { formatter: (val) => (typeof val === "number" ? `${val.toFixed(2)}%` : "0%") },
      },
      legend: { position: "top", horizontalAlign: "left" },
    },
  });

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
          });
          labelSet.add(label);

          if (!grouped[item.project_name]) grouped[item.project_name] = {};
          grouped[item.project_name][label] = item.wt_accomp_to_date ?? 0;
        });

        const sortedLabels = [...labelSet].sort(
          (a, b) => new Date("1 " + a) - new Date("1 " + b)
        );

        const formattedSeries = Object.entries(grouped).map(([project, monthlyMap]) => {
          let lastY = 0;
          return {
            name: project,
            data: sortedLabels.map((label) => {
              if (monthlyMap[label] != null) lastY = monthlyMap[label];
              return { x: label, y: lastY };
            }),
          };
        });

        setState((prev) => ({
          ...prev,
          series: formattedSeries,
          options: { ...prev.options, xaxis: { ...prev.options.xaxis, categories: sortedLabels } },
        }));
      } catch (err) {
        console.error("Failed to fetch project billing trend", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Project Progress Over Time</h2>
      <ReactApexChart options={state.options} series={state.series} type="area" height={600} />
    </div>
  );
};

export default ApexChart;
