// ViewSafetyReportAdmin.jsx
import React, { useRef, useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import html2pdf from 'html2pdf.js';
import { ActionButtons, StatusBadge } from './Buttons'; // Import the new components
import { ConfirmationModal } from './ConfirmationModal'; // Import the ConfirmationModal

const ViewSafetyReportAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null); // State for summary modal
  const [filterStatus, setFilterStatus] = useState('all'); // New state for status filter
  const [allReports, setAllReports] = useState([ // Using useState for reports to allow updates
    {
      report_id: 1,
      project_name: 'Project Alpha Construction',
      report_date: '2025-06-14',
      reviewed_at: '2025-06-15',
      status: 'approved',
      activities: [
        {
          description: 'Checked scaffolding and safety harnesses. All compliant.',
          images: ['[https://via.placeholder.com/150/007bff/ffffff?text=Image+1](https://via.placeholder.com/150/007bff/ffffff?text=Image+1)', '[https://via.placeholder.com/100/28a745/ffffff?text=Image+2](https://via.placeholder.com/100/28a745/ffffff?text=Image+2)'],
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
          images: ['[https://via.placeholder.com/120/ffc107/000000?text=Image+1](https://via.placeholder.com/120/ffc107/000000?text=Image+1)'],
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
          images: ['[https://via.placeholder.com/110/dc3545/ffffff?text=Image+1](https://via.placeholder.com/110/dc3545/ffffff?text=Image+1)', '[https://via.placeholder.com/130/6c757d/ffffff?text=Image+2](https://via.placeholder.com/130/6c757d/ffffff?text=Image+2)'],
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
          images: ['[https://via.placeholder.com/140/17a2b8/ffffff?text=Image+1](https://via.placeholder.com/140/17a2b8/ffffff?text=Image+1)'],
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
  ]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToPerform, setActionToPerform] = useState(null); // 'approve' or 'reject'
  const [reportIdToActOn, setReportIdToActOn] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter and sort reports
  const filteredAndSortedReports = allReports
    .filter((report) => {
      // Apply search query filter
      const matchesSearch =
        report.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.activities.some((act) =>
          act.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Apply status filter
      const matchesStatus =
        filterStatus === 'all' || report.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date)); // Sort by most recent date


  // useRef to hold references to elements for PDF generation
  const reportRefs = useRef({});

  // Function to download report as PDF
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

  // Function to set the selected report for summary view
  const handleViewSummary = (report) => {
    setSelectedReport(report);
  };

  // Function to close the summary modal
  const closeSummary = () => {
    setSelectedReport(null);
  };

  // Open confirmation modal for approve
  const handleApproveClick = (reportId) => {
    setActionToPerform('approve');
    setReportIdToActOn(reportId);
    setShowConfirmModal(true);
  };

  // Open confirmation modal for reject
  const handleRejectClick = (reportId) => {
    setActionToPerform('reject');
    setReportIdToActOn(reportId);
    setShowConfirmModal(true);
  };

  // Confirm action in modal
  const confirmAction = () => {
    if (actionToPerform === 'approve') {
      const updatedReports = allReports.map(report =>
        report.report_id === reportIdToActOn
          ? { ...report, status: 'approved', reviewed_at: new Date().toISOString().split('T')[0] }
          : report
      );
      setAllReports(updatedReports);
      setSuccessMessage(`Report ${reportIdToActOn} successfully APPROVED!`);
      // Update selectedReport if the approved one is currently in summary view
      if (selectedReport && selectedReport.report_id === reportIdToActOn) {
        setSelectedReport(prev => ({ ...prev, status: 'approved', reviewed_at: new Date().toISOString().split('T')[0] }));
      }
    } else if (actionToPerform === 'reject') {
      const updatedReports = allReports.map(report =>
        report.report_id === reportIdToActOn
          ? { ...report, status: 'rejected', reviewed_at: new Date().toISOString().split('T')[0] }
          : report
      );
      setAllReports(updatedReports);
      setSuccessMessage(`Report ${reportIdToActOn} successfully REJECTED!`);
      // Update selectedReport if the rejected one is currently in summary view
      if (selectedReport && selectedReport.report_id === reportIdToActOn) {
        setSelectedReport(prev => ({ ...prev, status: 'rejected', reviewed_at: new Date().toISOString().split('T')[0] }));
      }
    }
    setShowConfirmModal(false);
    setActionToPerform(null);
    setReportIdToActOn(null);
    setTimeout(() => setSuccessMessage(null), 3000); // Clear success message after 3 seconds
  };

  // Cancel action in modal
  const cancelAction = () => {
    setShowConfirmModal(false);
    setActionToPerform(null);
    setReportIdToActOn(null);
  };


  return (
    <>
      <PageMeta title="Safety Report History" description="View safety report history" />

      <div className="min-h-screen bg-gray-100 p-6 md:p-8">
        <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
            Safety Reports Management
          </h2>

          <div className="mb-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Search reports by project name or activity description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500 shadow-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-5">Recent Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredAndSortedReports.slice(0, 3).map((report) => ( // Use filteredAndSortedReports
              <div
                key={report.report_id}
                className="bg-white border border-gray-200 rounded-lg p-5 pb-20 shadow-md hover:shadow-lg transition-shadow duration-300 relative group" /* Added pb-20 for button space */
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
                  <StatusBadge status={report.status} /> {/* Using StatusBadge component */}
                </div>

                {/* Actions div visible only on hover */}
                <div className="flex justify-end absolute bottom-4 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ActionButtons
                    onViewSummary={() => handleViewSummary(report)}
                    onDownloadPDF={() => downloadPDF(report.report_id)}
                    onApprove={report.status === 'pending' ? () => handleApproveClick(report.report_id) : undefined}
                    onReject={report.status === 'pending' ? () => handleRejectClick(report.report_id) : undefined}
                  />
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
                {filteredAndSortedReports.map((report) => ( // Use filteredAndSortedReports
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
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <ul className="list-disc list-inside space-y-1">
                        {report.activities.map((act, i) => (
                          <li key={i}>{act.description}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={report.status} /> {/* Using StatusBadge component */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        onViewSummary={() => handleViewSummary(report)}
                        onDownloadPDF={() => downloadPDF(report.report_id)}
                        onApprove={report.status === 'pending' ? () => handleApproveClick(report.report_id) : undefined}
                        onReject={report.status === 'pending' ? () => handleRejectClick(report.report_id) : undefined}
                        buttonSize="small" // Keep 'small' for compact buttons in table
                      />
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
                  <strong className="font-semibold">Status:</strong> <StatusBadge status={selectedReport.status} />
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
                          <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmModal}
        title={`Confirm ${actionToPerform === 'approve' ? 'Approval' : 'Rejection'}`}
        message={`Are you sure you want to ${actionToPerform} report ID ${reportIdToActOn}?`}
        confirmText={actionToPerform === 'approve' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        onConfirm={confirmAction}
        onCancel={cancelAction}
        confirmButtonClass={actionToPerform === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
      />

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up">
          {successMessage}
        </div>
      )}
    </>
  );
};

export default ViewSafetyReportAdmin;