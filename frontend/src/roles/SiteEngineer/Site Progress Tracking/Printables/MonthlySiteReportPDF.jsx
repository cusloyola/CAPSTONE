import React, { forwardRef } from "react";

const MonthlySiteReportPDF = forwardRef(({ reports }, ref) => {
  if (!reports || reports.length === 0) {
    return (
      <div ref={ref} className="p-4 bg-white">
        <p className="text-gray-600">No reports selected.</p>
      </div>
    );
  }

  const firstReport = reports[0];

  return (
    <div ref={ref} className="p-4 bg-white">
      <style>{`
        @media print {
          @page { size: landscape; }
          /* This is the key to preventing the row from breaking */
          tr {
            page-break-inside: avoid;
          }
          /* A more aggressive rule for older browsers and specific edge cases */
          tr, td, th {
            break-inside: avoid; /* Modern property for break-inside */
          }
        }
      `}</style>

      {/* Header - only once */}
      <div className="mb-6">
        <div className="flex items-center">
          <img
            src="/images/assets/drl_construction_address.png"
            alt="Logo"
            className="h-[80px]"
          />
        </div>
        <h1 className="text-center text-xl font-bold mt-6 mb-6">
          Monthly Site Report
        </h1>

        <div className="mb-4 text-xs">
          <div className="flex">
            <strong className="w-32">Project:</strong>
            <span>{firstReport.project_name}</span>
          </div>
          <div className="flex">
            <strong className="w-32">Location:</strong>
            <span>{firstReport.location}</span>
          </div>
          <div className="flex">
            <strong className="w-32">Owner:</strong>
            <span>{firstReport.client_name}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-xs mt-2">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-5 py-2">Date</th>
              <th className="border px-5 py-2">Weather AM</th>
              <th className="border px-5 py-2">Weather PM</th>
              <th className="border px-5 py-2">Manpower</th>
              <th className="border px-5 py-2">Equipment</th>
              <th className="border px-5 py-2">Activities</th>
              <th className="border px-5 py-2">Visitors</th>
              <th className="border px-5 py-2">Notes</th>
              <th className="border px-5 py-2">Prepared By</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.report_id}>
                <td className="border px-3 py-2">
                  {new Date(report.report_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="border px-3 py-2">{report.weather_am}</td>
                <td className="border px-3 py-2">{report.weather_pm}</td>
                <td className="border px-3 py-2">
                  {report.manpower?.length
                    ? report.manpower
                        .map((w) => `${w.count} ${w.role}`)
                        .join(", ")
                    : "-"}
                </td>
                <td className="border px-3 py-2">
                  {report.selected_equipment?.length
                    ? report.selected_equipment
                        .map((e) => `${e.quantity} ${e.name}`)
                        .join(", ")
                    : "-"}
                </td>
                <td className="border px-3 py-2">{report.activities || "-"}</td>
                <td className="border px-3 py-2">{report.visitors || "-"}</td>
                <td className="border px-3 py-2">{report.notes || "-"}</td>
                <td className="border px-3 py-2">{report.full_name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default MonthlySiteReportPDF;