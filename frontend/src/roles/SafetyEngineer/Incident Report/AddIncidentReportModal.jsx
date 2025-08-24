// import { selectRenderer } from 'handsontable/renderers';
// import React, { useState, useEffect, use } from 'react';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// const AddIncidentReportModal = () => {
//   const [projectList, setProjectList] = useState([]);
//   const [selectedProjectName, setSelectedProjectName] = useState('');
//   const [owner, setOwner] = useState('');
//   const [projectManager, setProjectManager] = useState('');
//   const [safetyEngineer, setSafetyEngineer] = useState('');
//   const user = JSON.parse(localStorage.getItem("user"));
//   const user_id = user?.id;
//   const user_name = user?.name;

//   useEffect(() => {
//     const fetchProject = async () => {
//       try {

//         const response = await fetch("http://localhost:5000/api/projects");
//         const data = await response.json();
//         setProjectList(data);
//       } catch (err) {
//         console.error("Failed to fetch projects", err);
//       };
//     };
//     fetchProject();
//   }, []);

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user?.role === "Safety Engineer") {
//       setSafetyEngineer(user.name);
//     }
//   }, []);


//   useEffect(() => {
//     const selected = projectList.find(
//       (project) => project.project_name === selectedProjectName
//     );

//     if (selected) {
//       setOwner(selected.client_name || '');
//       setProjectManager(selected.projectManager || '');
//     }
//     else {
//       setOwner('');
//       setProjectManager('');
//     }
//   }, [selectedProjectName, projectList]);


//   return (
//     <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-[99999]">
//       {/* Overlay */}
//       <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" />

//       {/* Modal Box */}
//       <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-xl z-10">
//         {/* Close Button */}
//         <button
//           className="absolute right-3 top-3 z-20 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
//           aria-label="Close modal"
//         >
//           <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//             <path
//               fillRule="evenodd"
//               clipRule="evenodd"
//               d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
//               fill="currentColor"
//             />
//           </svg>
//         </button>

//         {/* Title */}
//         <h2 className="text-xl font-semibold mb-4">Add New Incident Report</h2>

//         {/* Form (No functionality) */}
//         <form className="space-y-4">
//           <div>
//             <label className="block font-medium text-gray-700">Project Name</label>
//             <select
//               className="w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
//               value={selectedProjectName}
//               onChange={(e) => setSelectedProjectName(e.target.value)}
//             >
//               <option value="">Select a Project</option>
//               {projectList
//                 .filter((project) => project.status?.toLowerCase() === "in progress")
//                 .map((project) => (
//                   <option key={project.project_id} value={project.project_name}>
//                     {project.project_name}
//                   </option>
//                 ))}
//             </select>

//           </div>

//           {/* Report Date */}
//           <div>
//             <label className="block font-medium text-gray-700">Report Date</label>
//             <DatePicker
//               minDate={new Date()}
//               dateFormat="yyyy-MM-dd"
//               className="w-full border border-gray-300 p-2 rounded"
//               placeholderText="Select report date"
//               wrapperClassName="w-full"

//             />
//           </div>

//           <div>
//             <label className="block font-medium text-gray-700">Subject</label>
//             <input
//               value={"Incident Report"}
//               className="w-full border p-2 rounded-md bg-gray-100 text-gray-800"
//               readOnly
//             />
//           </div>

//           {/* Owner */}
//           <div>
//             <label className="block font-medium text-gray-700">Owner</label>
//             <input
//               type="text"
//               value={owner}
//               className="w-full border p-2 rounded-md bg-gray-100 text-gray-800"
//               readOnly
//             />
//           </div>

//           {/* Project Manager */}
//           <div>
//             <label className="block font-medium text-gray-700">Project Manager</label>
//             <input
//               type="text"
//               value={projectManager}

//               className="w-full border p-2 rounded-md bg-gray-100 text-gray-800"
//               readOnly
//             />
//           </div>

//           {/* Safety Engineer */}
//           <div>
//             <label className="block font-medium text-gray-700">Safety Engineer</label>
//             <input
//               type="text"
//               value={user_name}
//               className="w-full border p-2 rounded-md bg-gray-100 text-gray-800"
//               readOnly
//             />
//           </div>

//           {/* Incident Summary */}
//           <div>
//             <label className="block font-medium text-gray-700">
//               Incident Summary (Initial Detail)
//             </label>
//             <textarea
//               className="w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
//               rows={3}
//               placeholder="Describe the initial incident detail for this report"
//             ></textarea>
//           </div>

//           {/* Buttons */}
//           <div className="flex justify-end gap-2 pt-4">
//             <button
//               type="button"
//               className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
//             >
//               Create Report
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddIncidentReportModal;
