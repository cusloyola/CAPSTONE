import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useParams } from "react-router-dom";

const PROGRESSBILL_API_URL = "http://localhost:5000/api/progress-billing";

const ProgressCharts = () => {
  const { billing_id } = useParams();
  const [progressData, setProgressData] = useState([]);
  const [accomplishments, setAccomplishments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, accompRes] = await Promise.all([
          fetch(`${PROGRESSBILL_API_URL}/summary/${billing_id}`),
          fetch(`${PROGRESSBILL_API_URL}/accomp/${billing_id}`)
        ]);

        const summary = await summaryRes.json();
        const accomp = await accompRes.json();

        const safeArray = Array.isArray(summary) ? summary : [summary];
        const grandTotal = safeArray.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

        const withPercent = safeArray.map((item) => {
          const amount = parseFloat(item.amount || 0);
          const wt_percent = grandTotal !== 0 ? (amount / grandTotal) * 100 : 0;
          return {
            ...item,
            amount,
            wt_percent,
          };
        });

        // 🔧 Deduplicate based on trimmed lowercase item_title
        const seen = new Set();
        const dedupedData = withPercent.filter(item => {
          const normalized = item.item_title.trim().toLowerCase();
          if (seen.has(normalized)) return false;
          seen.add(normalized);
          return true;
        });

        const accFormatted = {};
        (accomp?.data || accomp).forEach(row => {
          accFormatted[row.sow_proposal_id] = {
            percent_previous: parseFloat(row.percent_previous) || 0,
            percent_present: parseFloat(row.percent_present) || 0
          };
        });

        setProgressData(dedupedData);
        setAccomplishments(accFormatted);
      } catch (err) {
        console.error("❌ Error loading chart data:", err);
        setProgressData([]);
        setAccomplishments({});
      } finally {
        setLoading(false);
      }
    };

    if (billing_id) fetchData();
  }, [billing_id]);

  if (loading) return <p>Loading chart...</p>;
  if (progressData.length === 0) return <p>No chart data available.</p>;

  const categories = progressData.map(item =>
    item.item_title.length > 50 ? item.item_title.slice(0, 50) + "..." : item.item_title
  );

  const seriesPrevious = [];
  const seriesPresent = [];

  progressData.forEach(item => {
    const acc = accomplishments?.[item.sow_proposal_id] || {};
    seriesPrevious.push(acc.percent_previous || 0);
    seriesPresent.push(acc.percent_present || 0);
  });

  const series = [
    {
      name: "Previous",
      data: seriesPrevious
    },
    {
      name: "Present",
      data: seriesPresent
    }
  ];

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    grid: {
      padding: {
        top: 50,
        bottom: 30,
        left: 20,
        right: 20,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
        dataLabels: {
          total: {
            enabled: true,
            formatter: function (_, opts) {
              const index = opts.dataPointIndex;
              const prev = opts.w.globals.series[0][index];
              const pres = opts.w.globals.series[1][index];
              const total = prev + pres;
              return total.toFixed(2) + "%";
            },
            style: {
              fontSize: "13px",
              fontWeight: 600,
            },
          },
        },
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "13px",
        },
        formatter: (val) => val.toFixed(2) + "%",
      },
      max: 100,
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "13px",
        },
        maxWidth: 400,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => val.toFixed(2) + "%",
      },
    },
    legend: {
      position: "top",
      fontSize: "13px",
      offsetY: 40,
    },
    fill: {
      opacity: 1,
    },
  };

  const dynamicHeight = categories.length * 60;

  return (
    <div>
      <h2 className="text-[30px] text-center font-semibold mb-4 mt-4">Progress by Works</h2>
      <ReactApexChart options={options} series={series} type="bar" height={dynamicHeight} />
    </div>
  );
};

export default ProgressCharts;
