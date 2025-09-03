import React from 'react';

const RequestForm = ({
  selectedProject,
  setSelectedProject,
  projects,
  urgency,
  setUrgency,
  notes,
  setNotes,
  isRequestInvalid,
  openModal
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Project Details</h3>
      <div className="mb-4">
        <label className="block font-semibold">Select Project:</label>
     <select
  value={selectedProject}
  onChange={(e) => setSelectedProject(Number(e.target.value))}
>
  <option value="">Select Project</option>
  {projects.map((project) => (
    <option key={project.project_id} value={project.project_id}>
      {project.project_name}
    </option>
  ))}
</select>


      </div>
      {selectedProject && (
        <p className="text-gray-700 mb-4">
          <strong>Location:</strong>{' '}
          {projects.find(p => p.project_name === selectedProject)?.project_location}
        </p>
      )}
      <div className="mb-4">
        <label className="block font-semibold">Select Urgency:</label>
        <select
          className="w-full p-2 border rounded mt-1"
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
        >
          <option value="">Select Urgency</option>
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
          <option value="Urgent">Urgent (Immediate Attention)</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold">Additional Notes:</label>
        <textarea
          className="w-full p-2 border rounded mt-1"
          rows="3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter additional instructions or remarks..."
        />
      </div>
      <button
        className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        disabled={isRequestInvalid}
        onClick={openModal}
      >
        Submit Request
      </button>
    </div>
  );
};

export default RequestForm;