import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjectsWithApproved } from "../../../../api/projectApi";

const MaterialControlCost = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState("");
    const [clientFilter, setClientFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [projectManagerFilter, setProjectManagerFilter] = useState("");
    const [search, setSearch] = useState("");

    // Pagination
    const [entriesPerPage, setEntriesPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadProjects = async () => {
            const data = await fetchProjectsWithApproved();
            setProjects(data || []);             // ✅ fallback to []
            setFilteredProjects(data || []);
            const projects = await fetchProjectsWithApproved();
            console.log("Projects fetched:", projects);
            // ✅ fallback to []
        };
        loadProjects();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...projects];

        if (categoryFilter) {
            filtered = filtered.filter((p) => p.projectCategory === categoryFilter);
        }
        if (clientFilter) {
            filtered = filtered.filter((p) => p.client_name === clientFilter);
        }
        if (priorityFilter) {
            filtered = filtered.filter((p) => p.priority === priorityFilter);
        }
        if (projectManagerFilter) {
            filtered = filtered.filter((p) => p.projectManager === projectManagerFilter);
        }
        if (search) {
            filtered = filtered.filter((p) =>
                p.project_name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        setFilteredProjects(filtered);
        setCurrentPage(1); // reset to first page when filters change
    }, [projects, categoryFilter, clientFilter, priorityFilter, projectManagerFilter, search]);

    // Pagination calculations
    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    const visibleProjects = (filteredProjects || []).slice(startIdx, endIdx);
    const totalPages = Math.ceil((filteredProjects || []).length / entriesPerPage);

    return (
        <>
            <h2 className="text-2xl font-bold mb-6">Material Control Cost</h2>

            <div className="p-4 space-y-6 bg-white shadow rounded">
                <div className="text-black flex justify-between items-center p-4 rounded">
                    <h1 className="text-lg font-semibold ">List of all projects proposals</h1>
               
                </div>

                {/* Search + Filters UI (shortened for clarity) */}
                <div className="flex justify-between items-center">
                    <div>
                        <label className="text-sm">
                            Show
                            <select
                                value={entriesPerPage}
                                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                className="mx-2 border p-1 rounded"
                            >
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                            entries
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="block font-medium text-gray-700">Search:</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border p-2 rounded w-64"
                        />
                    </div>
                </div>

                {/* Table */}
                <table className="table-auto w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2 text-left">Project Proposal</th>
                            <th className="border px-4 py-2 text-left">Project Category</th>
                            <th className="border px-4 py-2 text-left">Project Manager</th>
                            <th className="border px-4 py-2 text-left">Client Name</th>
                            <th className="border px-4 py-2 text-left">Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleProjects.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                    No projects found
                                </td>
                            </tr>
                        ) : (
                            visibleProjects.map((proj) => (
                                <tr key={proj.project_id}>
                                    <td className="border px-4 py-2">
                                        {/* ✅ Clickable link to project details */}
                                        <Link
                                            to={`/projects/${proj.project_id}/materialcontrol`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {proj.project_name} - {proj.proposal_title}
                                        </Link>
                                    </td>
                                    <td className="border px-4 py-2">{proj.project_type}</td>

                                    <td className="border px-4 py-2">{proj.projectManager}</td>
                                    <td className="border px-4 py-2">{proj.client_name}</td>
                                    <td className="border px-4 py-2">{proj.location}</td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                    <p>
                        Showing {startIdx + 1} to{" "}
                        {Math.min(endIdx, filteredProjects.length)} of{" "}
                        {filteredProjects.length} entries
                    </p>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MaterialControlCost;
