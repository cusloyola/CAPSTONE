import React from "react";
import ProjectInfoCard from "./Project Info Modals/ProjectInfoCard.tsx";
import ProjectInfoDetailedCard from "./Project Info Modals/ProjectInfoDetailedCard.tsx";

const ProjectInfo = () => {
    // Import the ProjectInfoCard component

    return (
        <div className="space-y-6">
            <ProjectInfoCard />
            <ProjectInfoDetailedCard />
        </div>
    );
};

export default ProjectInfo;