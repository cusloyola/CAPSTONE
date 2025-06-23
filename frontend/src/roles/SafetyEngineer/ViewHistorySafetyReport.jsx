import React, { useRef, useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import html2pdf from 'html2pdf.js';

const ViewSafetyHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null); // New state for summary

  const reports = [
    {
      report_id: 1,
      project_name: 'Project Alpha Construction',
      report_date: '2025-06-14',
      reviewed_at: '2025-06-15',
      status: 'approved',
      activities: [
        {
          description: 'Checked scaffolding and safety harnesses. All compliant.',
          images: ['https://via.placeholder.com/150/007bff/ffffff?text=Image+1', 'https://via.placeholder.com/100/28a745/ffffff?text=Image+2'],
        },
        {
          description: 'Daily toolbox meeting conducted, focusing on fall prevention.',
          images: [],
        },
      ],
    },
    {
      report_id: 2,
      project_name: 'Project Beta Renovation',
      report_date: '2025-06-13',
      reviewed_at: null,
      status: 'pending',
      activities: [
        {
          description: 'Site clean-up and hazard identification completed. Found minor debris.',
          images: ['https://via.placeholder.com/120/ffc107/000000?text=Image+1'],
        },
        {
          description: 'Electrical wiring inspection, identified one loose connection.',
          images: [],
        },
      ],
    },
    {
      report_id: 3,
      project_name: 'Project Gamma Infrastructure',
      report_date: '2025-06-12',
      reviewed_at: '2025-06-12',
      status: 'rejected',
      activities: [
        {
          description: 'Equipment inspection and maintenance. Found faulty hoist mechanism.',
          images: [],
        },
        {
          description: 'Emergency drill conducted. Evacuation time exceeded target.',
          images: ['https://via.placeholder.com/110/dc3545/ffffff?text=Image+1', 'https://via.placeholder.com/130/6c757d/ffffff?text=Image+2'],
        },
      ],
    },
    {
      report_id: 4,
      project_name: 'Project Delta Expansion',
      report_date: '2025-06-11',
      reviewed_at: '2025-06-11',
      status: 'approved',
      activities: [
        {
          description: 'New safety signage installed across the site.',
          images: [],
        },
        {
          description: 'Fire extinguisher checks completed, all in good condition.',
          images: ['https://via.placeholder.com/140/17a2b8/ffffff?text=Image+1'],
        },
      ],
    },
    {
      report_id: 5,
      project_name: 'Project Epsilon Demolition',
      report_date: '2025-06-10',
      reviewed_at: null,
      status: 'pending',
      activities: [
        {
          description: 'Demolition area secured and safety barriers erected.',
          images: [],
        },
        {
          description: 'Asbestos removal procedure reviewed with team.',
          images: [],
        },
      ],
    },
  ];

  const filteredReports = reports.filter(
    (report) =>
      report.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.activities.some((act) =>
        act.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const reportRefs = useRef({});

  const downloadPDF = (reportId) => {
    const element = reportRefs.current[reportId] || reportRefs.current[`table-${reportId}`];
    if (!element) {
      console.error(`Element for report ID ${reportId} not found.`);
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `Safety_Report_${reportId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleViewSummary = (report) => {
    setSelectedReport(report);
  };

  const closeSummary = () => {
    setSelectedReport(null);
  };

  // Helper function for status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900">
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-500 text-white">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-300 text-gray-800">
            Unknown
          </span>
        );
    }
  };
  return (
    <>
      <PageMeta title="Safety Report History" description="View safety report history" />

      <div className="min-h-screen bg-gray-100 p-6 md:p-8">
        <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
            Safety Report History
          </h2>

          <div className="mb-8">
            <input
              type="text"
              placeholder="Search reports by project name or activity description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500 shadow-sm"
            />
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-5">Recent Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredReports.slice(-3).map((report) => (
              <div
                key={report.report_id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300 relative group"
                ref={(el) => (reportRefs.current[report.report_id] = el)}
              >
                <h4 className="text-lg font-bold text-gray-900 mb-2">{report.project_name}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong className="font-medium">Report Date:</strong>{' '}
                  {new Date(report.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {report.reviewed_at && (
                  <p className="text-sm text-gray-600 mb-3">
                    <strong className="font-medium">Reviewed At:</strong>{' '}
                    {new Date(report.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
                <div className="text-sm mb-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Key Activities:</h5>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {report.activities.slice(0, 2).map((act, idx) => ( // Show first 2 activities
                      <li key={idx} className="truncate">{act.description}</li>
                    ))}
                    {report.activities.length > 2 && (
                      <li className="text-blue-600 font-medium cursor-pointer" onClick={() => handleViewSummary(report)}>
                        ... and {report.activities.length - 2} more
                      </li>
                    )}
                  </ul>
                </div>
                <div className="mb-4">
                  <span className="text-sm font-semibold text-gray-700">Status: </span>
                  {getStatusBadge(report.status)}
                </div>

                <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-4 right-5">
                  <button
                    onClick={() => handleViewSummary(report)}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    title="View Full Summary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Summary
                  </button>
                  <button
                    onClick={() => downloadPDF(report.report_id)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    title="Download Report as PDF"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mt-10 mb-5">All Reports</h3>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewed At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activities
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr
                    key={report.report_id}
                    ref={(el) => (reportRefs.current[`table-${report.report_id}`] = el)}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.project_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(report.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {report.reviewed_at
                        ? new Date(report.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : <span className="text-gray-500 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      <ul className="list-disc list-inside space-y-1">
                        {report.activities.map((act, i) => (
                          <li key={i} className="truncate">
                            {act.description}
                            {act.images?.length > 0 && (
                              <span className="text-blue-500 text-xs ml-1">(Images)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleViewSummary(report)}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition ease-in-out duration-150"
                        >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M20.77 12c0-.359-.194-.594-.582-1.066C18.768 9.21 15.636 6 12 6s-6.768 3.21-8.188 4.934c-.388.472-.582.707-.582 1.066s.194.594.582 1.066C5.232 14.79 8.364 18 12 18s6.768-3.21 8.188-4.934c.388-.472.582-.707.582-1.066M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6" clip-rule="evenodd"/></svg>
                          View Summary
                        </button>
                        <button
                          onClick={() => downloadPDF(report.report_id)}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ease-in-out duration-150"
                        >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/></svg>
                         Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-2xl max-w-2xl w-full relative transform scale-95 animate-scale-in">
            <button
              onClick={closeSummary}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200 text-3xl font-bold leading-none"
              aria-label="Close summary"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
              Report Summary: <span className="text-blue-600">{selectedReport.project_name}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
              <div>
                <p className="mb-1">
                  <strong className="font-semibold">Report ID:</strong> {selectedReport.report_id}
                </p>
                <p className="mb-1">
                  <strong className="font-semibold">Report Date:</strong>{' '}
                  {new Date(selectedReport.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                {selectedReport.reviewed_at && (
                  <p className="mb-1">
                    <strong className="font-semibold">Reviewed At:</strong>{' '}
                    {new Date(selectedReport.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
                <p className="mb-1">
                  <strong className="font-semibold">Status:</strong> {getStatusBadge(selectedReport.status)}
                </p>
              </div>
            </div>

            <h4 className="text-xl font-semibold text-gray-800 mb-3">Activities</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2 max-h-60 overflow-y-auto pr-2">
              {selectedReport.activities.map((act, idx) => (
                <li key={idx} className="flex flex-col mb-2">
                  <span className="font-medium">{act.description}</span>
                  {act.images?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {act.images.map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Image {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 text-right">
              <button
                onClick={closeSummary}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition ease-in-out duration-150 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewSafetyHistory;