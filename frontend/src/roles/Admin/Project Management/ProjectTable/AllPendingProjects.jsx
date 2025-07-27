import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Modal } from "../../../../components/ui/modal";


import EditModal from "./EditModal";

const PROJECTS_API_URL = "http://localhost:5000/api/projects/";

const AllPendingProjects = () => {
    const [projects, setProjects] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [editMode, setEditMode] = useState(false);


    // const [clients, setClients] = useState([]);

    const [filteredProjects, setFilteredProjects] = useState([]);

    //Filters
    const [categoryFilter, setCategoryFilter] = useState("");
    const [clientFilter, setClientFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [projectmanagerFilter, setProjectManagerFilter] = useState("");

    const [search, setSearch] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);


    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    const visibleProjects = filteredProjects.slice(startIdx, endIdx);
    const totalPages = Math.ceil(filteredProjects.length / entriesPerPage);


    const categories = [...new Set(projects.map(p => p.projectCategory).filter(Boolean))];
    const clientNames = [...new Set(projects.map(p => p.client_name).filter(Boolean))];
    const priorities = [...new Set(projects.map(p => p.priority).filter(Boolean))];
    const projectManagers = [...new Set(projects.map(p => p.projectManager).filter(Boolean))];




    useEffect(() => {
        fetch(PROJECTS_API_URL)
            .then(res => res.json())
            .then(data => {
                const proposedProjects = data.filter(p => p.status?.toLowerCase() === "proposed");
                setProjects(proposedProjects);
                setFilteredProjects(proposedProjects);
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        let filtered = projects;

        filtered = filtered.filter(p => p.status?.toLowerCase() === "proposed");

        if (categoryFilter)
            filtered = filtered.filter((p) =>
                p.projectCategory?.toLowerCase().includes(categoryFilter.toLowerCase())
            );

        if (clientFilter) {
            filtered = filtered.filter((p) =>
                p.client_name.toLowerCase().includes(clientFilter.toLowerCase())
            );
        }

        if (priorityFilter)
            filtered = filtered.filter((p) =>
                p.priority?.toLowerCase().includes(priorityFilter.toLowerCase())
            );


        if (projectmanagerFilter)
            filtered = filtered.filter((p) =>
                p.projectManager.toLowerCase().includes(projectmanagerFilter.toLowerCase())
            );

        if (search)
            filtered = filtered.filter((p) =>
                p.project_name.toLowerCase().includes(search.toLowerCase())
            );

        setFilteredProjects(filtered);
    }, [categoryFilter, clientFilter, priorityFilter, projectmanagerFilter, search, projects]);

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
        setEditMode(false);
    };

    const handleViewClick = (p) => {
        setSelectedProject(p);
        setEditMode(false);
        setIsModalOpen(true);
    };

    const handleEditClick = (project) => {
        setSelectedProject(project);
        setEditMode(true);
        setIsModalOpen(true);
    };


    const handleUpdateProject = (projectData) => {
        console.log(projectData);

        fetch(`${PROJECTS_API_URL}${projectData.project_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projectData),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to update project");
                return res.json();
            })
            .then((updatedProject) => {
                setProjects((prev) =>
                    prev.map((proj) =>
                        proj.project_id === updatedProject.project_id ? updatedProject : proj
                    )
                );
                alert("Project updated successfully!");
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to update the project.");
            });
    };



    return (
        <div className="p-4 space-y-6 bg-white shadow rounded">
            <div className="bg-blue-600 text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">List of all projects proposals</h1>
                <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100">
                    Add New Project
                </button>
            </div>

            <div className="flex flex-wrap gap-4">

                {/* Project Category Filter Group */}
                <div className="flex flex-col gap-2">
                    <label className="block font-medium text-gray-700">
                        Project Category:
                    </label>
                    <select
                        id="projectCategory"
                        className="border p-2 rounded w-48"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Project Categories</option>
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Client Filter Group */}
                <div className="flex flex-col gap-2">
                    <label className="block font-medium text-gray-700">
                        Client:
                    </label>
                    <select
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)}
                    >
                        <option value="">All Clients</option>
                        {clientNames.map((client, idx) => (
                            <option key={idx} value={client}>
                                {client}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Priority Filter Group */}
                <div className="flex flex-col gap-2">
                    <label className="block font-medium text-gray-700">
                        Priorities:
                    </label>
                    <select
                        id="prioritySelect"
                        className="border p-2 rounded w-48"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="">All Priorities</option>
                        {priorities.map((priority, index) => (
                            <option key={index} value={priority}>
                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </option>
                        ))}
                    </select>

                </div>

                {/* Project Manager Filter Group */}
                <div className="flex flex-col gap-2">
                    <label className="block font-medium text-gray-700">
                        Project Manager:
                    </label>
                    <select
                        id="projectManagerSelect"
                        className="border p-2 rounded w-48"
                        value={projectmanagerFilter}
                        onChange={(e) => setProjectManagerFilter(e.target.value)}
                    >
                        <option value="">All Project Managers</option>
                        {projectManagers.map((pm, index) => (
                            <option key={index} value={pm}>
                                {pm}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <label className="text-sm">
                        Show
                        <select
                            className="mx-2 border p-1 rounded"
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={1}>1</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        entries
                    </label>
                </div>
                <div className="flex items-center gap-2"> <label className="block font-medium text-gray-700">
                    Search:
                </label>
                    <input
                        id="searchInput"
                        type="text"
                        className="border p-2 rounded w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Section 4: Table */}
            <table className="table-auto w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2 text-left">Project Name</th>
                        <th className="border px-4 py-2 text-left">Project Category</th>
                        <th className="border px-4 py-2 text-left">Project Manager</th>

                        <th className="border px-4 py-2 text-left">Client Name</th>
                        <th className="border px-4 py-2 text-left">Client Contacts</th>
                        <th className="border px-4 py-2 text-left">Priority</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {visibleProjects.length > 0 ? (
                        visibleProjects.map((project, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">
                                    {project.project_id && (
                                        <Link
                                            to={`/AllPendingProjects/${project.project_id}/profile`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {project.project_name}
                                        </Link>
                                    )}
                                </td>
                                <td className="border px-4 py-2">{project.projectCategory}</td>
                                <td className="border px-4 py-2">{project.projectManager || 'N/A'}</td>
                                <td className="border px-4 py-2">{project.client_name}</td>
                                <td className="border px-4 py-2">{project.client_contact}</td>
                                <td className="border px-4 py-2">{project.priority}</td>
                                <td className="border px-4 py-2">
                                    <div className="flex gap-x-2">
                                        <button
                                            onClick={() => handleEditClick(project)}
                                            className="bg-yellow-500 text-white px-6 h-10 rounded hover:bg-yellow-700"
                                        >
                                            Edit
                                        </button>
                                        <button className="bg-red-600 text-white px-6 h-10 rounded hover:bg-red-700">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center border px-4 py-2">
                                No projects found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                <p>
                    Showing {startIdx + 1} to {Math.min(endIdx, filteredProjects.length)} of {filteredProjects.length} entries
                </p>

                <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
               <EditModal
  isOpen={isModalOpen}
  project={selectedProject}
  onClose={handleCloseModal}
  onSubmit={handleUpdateProject}
  isEdit={editMode}
/>

            )}

        </div>
    );
};

export default AllPendingProjects;
