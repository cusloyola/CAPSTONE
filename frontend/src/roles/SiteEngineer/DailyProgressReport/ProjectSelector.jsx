import React from 'react';

const ProjectSelector = ({ projectName, onChange, projects }) => {
  return (
    <div>
      <label className="block font-medium mt-2">Project Name</label>
      <select
        value={projectName}
        onChange={onChange}
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
