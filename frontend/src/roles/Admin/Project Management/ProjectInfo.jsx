import React from "react";
import { useParams } from "react-router-dom"; // Import useParams to get URL parameters
import ProjectInfoCard from "./Project Info Modals/ProjectInfoCard.jsx"; // Assuming this is the project-related TSX file
import ProjectInfoDetailedCard from "./Project Info Modals/ProjectInfoDetailedCard.jsx"; // Placeholder for a project-related TSX file

const ProjectInfo = () => {
    // Get the project_id from the URL parameters
    // This assumes your route is set up like /projects/:project_id
    const { project_id } = useParams();

    // You can add a check here if project_id is undefined,
    // for example, to show a loading state or an error message.
    if (!project_id) {
        return <div className="text-center py-8 text-red-600">Project ID not found in URL. Please navigate from a project list.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Pass the extracted project_id to ProjectInfoCard */}
            <ProjectInfoCard project_id={project_id} onProjectUpdate={() => console.log('Project updated!')} />
            {/* Pass the extracted project_id to ProjectInfoDetailedCard */}
            {/* <ProjectInfoDetailedCard project_id={project_id} /> */}
        </div>
    );
};

export default ProjectInfo;
