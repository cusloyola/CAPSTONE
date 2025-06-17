import React, { useState, useEffect } from "react";
import { useParams, Link, Outlet } from "react-router-dom";

const PROJECTS_API_URL = "http://localhost:5000/api/projects/";

const ProjectProposalProfile = () => {
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

    if (!project) return <div>Loading project details...</div>;

    return (
        <div className="flex h-screen   gap-4">
            {/* Left Sidebar */}
            <div className="w-1/5 bg-white px-6 py-12 shadow rounded flex flex-col items-center">
                <img
                    src="/images/assets/profile.png"
                    alt="Project Profile"
                    className="w-48 h-48 object-cover rounded-full mb-6"
                />
                <h2 className="text-lg font-bold mb-2">{project.project_name}</h2>
                <p className="text-center mb-6">{project.projectCategory}</p>

                {/* Sidebar Navigation */}
                <nav className="w-full flex flex-col gap-2">
                    {/* <Link
                        to={`profile`}
                        className="flex items-center justify-between px-4 py-2 rounded hover:bg-gray-100 w-full"
                    >
                        <span>Project Overview</span>
                    </Link> */}

                    <Link
                        to={`info`}
                        className="flex items-center justify-between px-4 py-2 rounded hover:bg-gray-100 w-full"
                    >
                        <span>Project Info</span>
                    </Link>

                    <Link
                        to={`proposals`}
                        className="flex items-center justify-between px-4 py-2 rounded hover:bg-gray-100 w-full"
                    >
                        <span>Proposals</span>
                    </Link>
                </nav>
            </div>

            {/* Right Content - render nested route content here */}
            <div className="flex-1 bg-white p-4 shadow rounded overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default ProjectProposalProfile;
