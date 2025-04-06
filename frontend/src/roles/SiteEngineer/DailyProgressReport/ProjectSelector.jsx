import React from 'react';

const ProjectSelector = ({ projectName, onChange, projects }) => {
  const handleChange = (event) => {
    const selectedProjectName = event.target.value;
    onChange(event);  // Call the parent onChange handler to update the state
    const selectedProject = projects.find(project => project.project_name === selectedProjectName);

    if (selectedProject) {
      console.log("Selected Project ID:", selectedProject.project_id); // Log the project ID
    }
  };

  return (
    <div>
      <label className="block font-medium mt-2">Project Name</label>
      <select
        value={projectName}
        onChange={handleChange}  // Use the handleChange function here
        className="w-full border p-2 rounded"
      >
        <option value="">Select a project</option>
        {projects.map((project, index) => (
          <option key={index} value={project.project_name}>
            {project.project_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProjectSelector;
