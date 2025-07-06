// AddIncidentReportModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';

// Sample data for projects, including owner, project manager, and safety engineer
// In a real application, this data would likely come from an API or a centralized source.
const projectsData = [
  {
    name: 'Project Alpha',
    owner: 'Alice Johnson',
    projectManager: 'Bob Williams',
    safetyEngineer: 'Charlie Davis',
  },
  {
    name: 'Project Beta',
    owner: 'David Brown',
    projectManager: 'Eve Miller',
    safetyEngineer: 'Frank White',
  },
  {
    name: 'Project Gamma',
    owner: 'Grace Lee',
    projectManager: 'Henry Kim',
    safetyEngineer: 'Ivy Green',
  },
];

const AddIncidentReportModal = ({ onClose, onSaveNewReport }) => {
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [reportDate, setReportDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [incidentSummary, setIncidentSummary] = useState(''); // Renamed from 'agenda'
  const [owner, setOwner] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [safetyEngineer, setSafetyEngineer] = useState('');

  const modalRef = useRef(null);

  // Effect to automatically populate fields when a project is selected
  useEffect(() => {
    const project = projectsData.find(p => p.name === selectedProjectName);
    if (project) {
      setOwner(project.owner);
      setProjectManager(project.projectManager);
      setSafetyEngineer(project.safetyEngineer);
    } else {
      // Clear fields if no project or "Select a project" is chosen
      setOwner('');
      setProjectManager('');
      setSafetyEngineer('');
    }
  }, [selectedProjectName]);

  const handleProjectSelectChange = (e) => {
    setSelectedProjectName(e.target.value);
  };

  const handleAddReport = (e) => {
    e.preventDefault();

    if (!selectedProjectName || !reportDate || !incidentSummary.trim()) { // Updated validation
      // Using a basic message box for user feedback instead of alert()
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-x-0 bottom-6 mx-auto bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center justify-center w-fit';
      messageBox.textContent = 'Please fill out all required fields (Project Name, Report Date, Incident Summary).'; // Updated text
      document.body.appendChild(messageBox);
      setTimeout(() => document.body.removeChild(messageBox), 3000);
      return;
    }

    // Construct the new report object
    const newReport = {
      report_id: Date.now(), // Simple unique ID
      project_name: selectedProjectName,
      report_date: reportDate,
      owner: owner,
      projectManager: projectManager,
      safetyEngineer: safetyEngineer,
      status: 'pending', // New reports are typically pending
      reviewed_at: null,
      // Changed 'description' to 'text' to match the IncidentReport component's expectation
      activities: [{ text: incidentSummary, images: [] }], // Initial incident summary as first activity
    };

    console.log('Attempting to close modal and save report:', newReport); // Debug log
    onSaveNewReport(newReport); // Pass the new report data to the parent
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[99999]">
      <div
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
        onClick={onClose}
      ></div>

      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-xl z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          aria-label="Close modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <h2 className="text-xl font-semibold mb-4">Add New Incident Report</h2> {/* Updated text */}

        <form onSubmit={handleAddReport} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Project Name</label>
            <select
              className="w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={selectedProjectName}
              onChange={handleProjectSelectChange}
              required
            >
              <option value="">-- Select a Project --</option>
              {projectsData.map((project) => (
                <option key={project.name} value={project.name}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Report Date</label>
            <input
              type="date"
              className="w-full border p-2 rounded-md bg-gray-100 text-gray-800"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              readOnly // Report date is automatically set for today's report
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Owner</label>
            <input
              type="text"
              className="w-full border p-2 rounded-md bg-gray-100 text-gray-800"
              value={owner}
              readOnly
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Project Manager</label>
            <input
              type="text"
              className="w-full border p-2 rounded-md bg-gray-100 text-gray-800"
              value={projectManager}
              readOnly
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Safety Engineer</label>
            <input
              type="text"
              className="w-full border p-2 rounded-md bg-gray-100 text-gray-800"
              value={safetyEngineer}
              readOnly
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Incident Summary (Initial Detail)</label> {/* Updated label */}
            <textarea
              className="w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              rows={3}
              placeholder="Describe the initial incident detail for this report" // Updated placeholder
              value={incidentSummary} // Renamed state variable
              onChange={(e) => setIncidentSummary(e.target.value)} // Renamed setter
              required
            ></textarea>
            {/* Displaying the incidentSummary value */}
            {incidentSummary && (
              <p className="mt-2 text-sm text-gray-600">
                <strong>Current Incident Summary:</strong> {incidentSummary} {/* Updated text */}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
            >
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncidentReportModal;
