import React, { useEffect } from "react";
import ReactApexChart from "react-apexcharts";

type SeriesData = {
  name: string;
  data: { x: string; y: number }[];
};

type ChartState = {
  series: SeriesData[];
  options: ApexCharts.ApexOptions;
};

type SiteApexChartProps = {
  cardClassName?: string;
};

const SiteApexChart: React.FC<SiteApexChartProps> = ({ cardClassName }) => {
  const [state, setState] = React.useState<ChartState>({
    series: [],
    options: {
      chart: {
        height: 600,
        type: "area",
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityTo: 0.7,
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
        min: 0,
        max: 100,
        tickAmount: 10,
        labels: {
          formatter: (val: number) =>
            typeof val === "number" ? `${val.toFixed(0)}%` : "0%",
        },
        title: { text: "% To Date" },
      },
      tooltip: {
        x: { formatter: (val: number) => String(val) },
        y: {
          formatter: (val: number) =>
            typeof val === "number" ? `${val.toFixed(2)}%` : "0%",
        },
      },
      legend: { position: "top", horizontalAlign: "left" },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/dashboard/project-billing-trend"
        );
        const data = await res.json();

        const grouped: Record<string, Record<string, number>> = {};
        const labelSet = new Set<string>();

        data.forEach((item: any) => {
          const label = new Date(item.billing_month + "-01").toLocaleDateString(
            "en-US",
            {
              month: "short",
              year: "2-digit",
            }
          );
          labelSet.add(label);

          if (!grouped[item.project_name]) grouped[item.project_name] = {};
          grouped[item.project_name][label] = item.wt_accomp_to_date ?? 0;
        });

        const sortedLabels = [...labelSet].sort(
          (a, b) => new Date("1 " + a).getTime() - new Date("1 " + b).getTime()
        );

        const formattedSeries: SeriesData[] = Object.entries(grouped).map(
          ([project, monthlyMap]) => {
            let lastY = 0;
            return {
              name: project,
              data: sortedLabels.map((label) => {
                if (monthlyMap[label] != null) lastY = monthlyMap[label];
                return { x: label, y: lastY };
              }),
            };
          }
        );

        setState((prev) => ({
          ...prev,
          series: formattedSeries,
          options: {
            ...prev.options,
            xaxis: { ...prev.options.xaxis, categories: sortedLabels },
          },
        }));
      } catch (err) {
        console.error("Failed to fetch project billing trend", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={`bg-white rounded shadow ${cardClassName || "p-4"}`}>
      <h2 className="text-lg font-semibold mb-2">Project Progress Over Time</h2>
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="area"
        height={375}
      />
    </div>
  );
};

export default SiteApexChart;
