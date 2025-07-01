// ProjectLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";

const PROJECTS_API_URL = "http://localhost:5000/api/projects/";

const ProjectLayout = () => {
    const { project_id } = useParams();
    const [project, setProject] = useState(null);

    useEffect(() => {
        fetch(PROJECTS_API_URL)
            .then((res) => res.json())
            .then((data) => {
                const foundProject = data.find(
                    (p) => String(p.project_id) === String(project_id)
                );
                setProject(foundProject || null);
            })
            .catch((err) => console.error(err));
    }, [project_id]);

    if (!project) return <div className="p-6">Loading project info...</div>;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-800">{project.project_name}</h1>
                <p className="text-lg text-gray-600">{project.projectCategory}</p>
            </div>
            <Outlet context={{ project }} />
        </div>
    );
};

export default ProjectLayout;
