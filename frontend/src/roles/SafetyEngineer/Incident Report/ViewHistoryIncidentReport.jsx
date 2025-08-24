// import React, { useRef, useState } from 'react';
// import html2pdf from 'html2pdf.js'; // Ensure html2pdf.js is loaded in your environment if not already

// const IncidentReportHistory = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedReport, setSelectedReport] = useState(null); // State for full report summary modal
//   const [selectedImageModal, setSelectedImageModal] = useState(null); // State for full-size image view

//   // Sample data for incident reports
//   const reports = [
//     {
//       report_id: 1,
//       project_name: 'Project Alpha Construction',
//       report_date: '2025-06-14',
//       reviewed_at: '2025-06-15',
//       status: 'approved',
//       activities: [
//         {
//           text: 'Checked scaffolding and safety harnesses. All compliant.',
//           images: [
//             'https://placehold.co/300x200/007bff/ffffff?text=Image+1',
//             'https://placehold.co/300x200/28a745/ffffff?text=Image+2'
//           ],
//         },
//         {
//           text: 'Daily toolbox meeting conducted, focusing on fall prevention.',
//           images: [],
//         },
//       ],
//     },
//     {
//       report_id: 2,
//       project_name: 'Project Beta Renovation',
//       report_date: '2025-06-13',
//       reviewed_at: null,
//       status: 'pending',
//       activities: [
//         {
//           text: 'Site clean-up and hazard identification completed. Found minor debris.',
//           images: ['https://placehold.co/300x200/ffc107/000000?text=Image+1'],
//         },
//         {
//           text: 'Electrical wiring inspection, identified one loose connection.',
//           images: [],
//         },
//       ],
//     },
//     {
//       report_id: 3,
//       project_name: 'Project Gamma Infrastructure',
//       report_date: '2025-06-12',
//       reviewed_at: '2025-06-12',
//       status: 'rejected',
//       activities: [
//         {
//           text: 'Equipment inspection and maintenance. Found faulty hoist mechanism.',
//           images: [],
//         },
//         {
//           text: 'Emergency drill conducted. Evacuation time exceeded target.',
//           images: [
//             'https://placehold.co/300x200/dc3545/ffffff?text=Image+1',
//             'https://placehold.co/300x200/6c757d/ffffff?text=Image+2'
//           ],
//         },
//       ],
//     },
//     {
//       report_id: 4,
//       project_name: 'Project Delta Expansion',
//       report_date: '2025-06-11',
//       reviewed_at: '2025-06-11',
//       status: 'approved',
//       activities: [
//         {
//           text: 'New safety signage installed across the site.',
//           images: [],
//         },
//         {
//           text: 'Fire extinguisher checks completed, all in good condition.',
//           images: ['https://placehold.co/300x200/17a2b8/ffffff?text=Image+1'],
//         },
//       ],
//     },
//     {
//       report_id: 5,
//       project_name: 'Project Epsilon Demolition',
//       report_date: '2025-06-10',
//       reviewed_at: null,
//       status: 'pending',
//       activities: [
//         {
//           text: 'Demolition area secured and safety barriers erected.',
//           images: [],
//         },
//         {
//           text: 'Asbestos removal procedure reviewed with team.',
//           images: [],
//         },
//       ],
//     },
//   ];

//   // Filter reports based on search query
//   const filteredReports = reports.filter(
//     (report) =>
//       report.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       report.activities.some((act) =>
//         act.text.toLowerCase().includes(searchQuery.toLowerCase()) // Changed from description
//       )
//   );

//   // Refs for PDF generation
//   const reportRefs = useRef({});

//   // Function to download PDF of a specific report
//   const downloadPDF = (reportId) => {
//     const element = reportRefs.current[reportId] || reportRefs.current[`table-${reportId}`];
//     if (!element) {
//       console.error(`Element for report ID ${reportId} not found.`);
//       return;
//     }

//     const opt = {
//       margin: 0.5,
//       filename: `Incident_Report_${reportId}.pdf`, // Updated filename
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2 },
//       jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
//     };

//     html2pdf().set(opt).from(element).save();
//   };

//   // Function to open the full summary modal
//   const handleViewSummary = (report) => {
//     setSelectedReport(report);
//   };

//   // Function to close the full summary modal
//   const closeSummary = () => {
//     setSelectedReport(null);
//   };

//   // Helper function for status badges
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'pending':
//         return (
//           <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900">
//             Pending
//           </span>
//         );
//       case 'approved':
//         return (
//           <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white">
//             Approved
//           </span>
//         );
//       case 'rejected':
//         return (
//           <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-500 text-white">
//             Rejected
//           </span>
//         );
//       default:
//         return (
//           <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-300 text-gray-800">
//             Unknown
//           </span>
//         );
//     }
//   };

//   return (
//     <>
//       {/* Main Container */}
//       <div className="min-h-screen bg-gray-100 p-6 md:p-8 font-sans">
//         <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg">
//           <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
//             Incident Report History
//           </h2>

//           {/* Search Input */}
//           <div className="mb-8">
//             <input
//               type="text"
//               placeholder="Search reports by project name or incident detail..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500 shadow-sm"
//             />
//           </div>

//           {/* Recent Reports Section */}
//           <h3 className="text-xl font-semibold text-gray-800 mb-5">Recent Incident Reports</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
//             {filteredReports.slice(-3).map((report) => (
//               <div
//                 key={report.report_id}
//                 className="bg-white border border-gray-200 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300 relative group"
//                 ref={(el) => (reportRefs.current[report.report_id] = el)}
//               >
//                 <h4 className="text-lg font-bold text-gray-900 mb-2">{report.project_name}</h4>
//                 <p className="text-sm text-gray-600 mb-1">
//                   <strong className="font-medium">Report Date:</strong>{' '}
//                   {new Date(report.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
//                 </p>
//                 {report.reviewed_at && (
//                   <p className="text-sm text-gray-600 mb-3">
//                     <strong className="font-medium">Reviewed At:</strong>{' '}
//                     {new Date(report.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
//                   </p>
//                 )}
//                 <div className="text-sm mb-4">
//                   <h5 className="font-semibold text-gray-700 mb-2">Key Incident Details:</h5>
//                   <ul className="list-disc list-inside text-gray-700 space-y-1">
//                     {report.activities.slice(0, 2).map((act, idx) => (
//                       <li key={idx} className="truncate">{act.text}</li>
//                     ))}
//                     {report.activities.length > 2 && (
//                       <li className="text-blue-600 font-medium cursor-pointer" onClick={() => handleViewSummary(report)}>
//                         ... and {report.activities.length - 2} more
//                       </li>
//                     )}
//                   </ul>
//                 </div>
//                 <div className="mb-4">
//                   <span className="text-sm font-semibold text-gray-700">Status: </span>
//                   {getStatusBadge(report.status)}
//                 </div>

//                 {/* Action Buttons for Recent Reports */}
//                 <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-4 right-5">
//                   <button
//                     onClick={() => handleViewSummary(report)}
//                     className="flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition ease-in-out duration-150"
//                     title="View Full Summary"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                       <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
//                     </svg>
//                     Summary
//                   </button>
//                   <button
//                     onClick={() => downloadPDF(report.report_id)}
//                     className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
//                     title="Download Report as PDF"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
//                     </svg>
//                     PDF
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* All Reports Table Section */}
//           <h3 className="text-xl font-semibold text-gray-800 mt-10 mb-5">All Incident Reports</h3>
//           <div className="overflow-x-auto shadow-md rounded-lg">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Project
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Report Date
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Reviewed At
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Incident Details
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredReports.map((report) => (
//                   <tr
//                     key={report.report_id}
//                     ref={(el) => (reportRefs.current[`table-${report.report_id}`] = el)}
//                     className="hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {report.project_name}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                       {new Date(report.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                       {report.reviewed_at
//                         ? new Date(report.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
//                         : <span className="text-gray-500 italic">N/A</span>}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
//                       <ul className="list-disc list-inside space-y-1">
//                         {report.activities.map((act, i) => (
//                           <li key={i} className="truncate">
//                             {act.text}
//                             {act.images?.length > 0 && (
//                               <span className="text-blue-500 text-xs ml-1">(Images)</span>
//                             )}
//                           </li>
//                         ))}
//                       </ul>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {getStatusBadge(report.status)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <div className="flex flex-col space-y-2">
//                         <button
//                           onClick={() => handleViewSummary(report)}
//                           className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition ease-in-out duration-150"
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M20.77 12c0-.359-.194-.594-.582-1.066C18.768 9.21 15.636 6 12 6s-6.768 3.21-8.188 4.934c-.388.472-.582.707-.582 1.066s.194.594.582 1.066C5.232 14.79 8.364 18 12 18s6.768-3.21 8.188-4.934c.388-.472.582-.707.582-1.066M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6" clipRule="evenodd"/></svg>
//                           View Summary
//                         </button>
//                         <button
//                           onClick={() => downloadPDF(report.report_id)}
//                           className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ease-in-out duration-150"
//                         >
//                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/></svg>
//                           Download
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Summary Modal */}
//       {selectedReport && (
//         <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in">
//           <div className="bg-white p-6 md:p-8 rounded-lg shadow-2xl max-w-2xl w-full relative transform scale-95 animate-scale-in">
//             <button
//               onClick={closeSummary}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200 text-3xl font-bold leading-none"
//               aria-label="Close summary"
//             >
//               &times;
//             </button>
//             <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
//               Incident Report Summary: <span className="text-blue-600">{selectedReport.project_name}</span>
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
//               <div>
//                 <p className="mb-1">
//                   <strong className="font-semibold">Report ID:</strong> {selectedReport.report_id}
//                 </p>
//                 <p className="mb-1">
//                   <strong className="font-semibold">Report Date:</strong>{' '}
//                   {new Date(selectedReport.report_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
//                 </p>
//               </div>
//               <div>
//                 {selectedReport.reviewed_at && (
//                   <p className="mb-1">
//                     <strong className="font-semibold">Reviewed At:</strong>{' '}
//                     {new Date(selectedReport.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
//                   </p>
//                 )}
//                 <p className="mb-1">
//                   <strong className="font-semibold">Status:</strong> {getStatusBadge(selectedReport.status)}
//                 </p>
//               </div>
//             </div>

//             <h4 className="text-xl font-semibold text-gray-800 mb-3">Incident Details</h4>
//             <ul className="list-disc list-inside text-gray-700 space-y-2 max-h-60 overflow-y-auto pr-2">
//               {selectedReport.activities.map((act, idx) => (
//                 <li key={idx} className="flex flex-col mb-2">
//                   <span className="font-medium">{act.text}</span>
//                   {act.images?.length > 0 && (
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {act.images.map((img, i) => (
//                         <img
//                           key={i}
//                           src={img}
//                           alt={`Incident Image ${i + 1}`}
//                           className="w-40 h-40 object-cover rounded-lg cursor-pointer border border-gray-300 shadow-sm hover:shadow-md transition-shadow"
//                           onClick={() => setSelectedImageModal(img)} // Open full-size image modal
//                         />
//                       ))}
//                     </div>
//                   )}
//                 </li>
//               ))}
//             </ul>
//             <div className="mt-6 text-right">
//               <button
//                 onClick={closeSummary}
//                 className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition ease-in-out duration-150 font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Full-size Image Modal */}
//       {selectedImageModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999]">
//           <div className="relative bg-white rounded-lg shadow-lg p-4">
//             <img src={selectedImageModal} alt="Selected Incident Image" className="max-w-[90vw] max-h-[90vh] object-contain rounded" />
//             <button
//               onClick={() => setSelectedImageModal(null)}
//               className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
//               title="Close Image"
//             >
//               ❌
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default IncidentReportHistory;
