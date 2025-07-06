import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AddProposalModal from "./AddProposalModal";
import DeleteProposalModal from "./DeleteProposalModal";

const PROPOSAL_API_BASE_URL = "http://localhost:5000/api/proposals/";


const ProposalTable = () => {
    const { project_id } = useParams();
    const [proposals, setProposals] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");



    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [proposalToDelete, setProposalToDelete] = useState(null);



    useEffect(() => {
        fetch(`${PROPOSAL_API_BASE_URL}${project_id}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Server error: ${res.status} ${res.statusText}`);
                }
                return res.json();
            })
            .then((data) => setProposals(data))
            .catch((err) => {
                console.error("Fetch error:", err);
            });
    }, [project_id]);


    

    const filteredProposals = proposals.filter((proposal) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
            proposal.proposal_title.toLowerCase().includes(searchLower);
            
            // ||
            // proposal.description.toLowerCase().includes(searchLower) ||
            // proposal.status.toLowerCase().includes(searchLower);

        const matchesStatus =
            statusFilter === "" || proposal.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });


    const openDeleteModal = (proposal) => {
        setProposalToDelete(proposal);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setProposalToDelete(null);
    };

    const handleDelete = () => {
        fetch(`${PROPOSAL_API_BASE_URL}${project_id}/${proposalToDelete.proposal_id}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to delete');
                // Remove deleted proposal from state
                setProposals(proposals.filter(p => p.proposal_id !== proposalToDelete.proposal_id));
                closeDeleteModal();
            })
            .catch((err) => {
                alert('Error deleting proposal: ' + err.message);
            });
    };



    return (
        <div className="p-4 space-y-6 bg-white shadow rounded">
            <div className="bg-[#6c8cbf] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Proposal Table</h1>
                <div className="flex items-center space-x-2">
                    <button
                        className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
                        onClick={() => setShowModal(true)}
                    >
                        Create Proposal
                    </button>

                </div>

            </div>

            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-2">
                    <label className="block font-medium text-gray-700">
                        Status:
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        {/* Add other statuses you use */}
                    </select>

                </div>
            </div>


            <div className="flex justify-between items-center">



                <div>
                    <label className="text-sm">
                        Show
                        <select
                            className="mx-2 border p-1 rounded"

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

            <table className="table-auto w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2 text-left">Proposal Title</th>
                        <th className="border px-4 py-2 text-left">Description</th>
                        <th className="border px-4 py-2 text-left">Status</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProposals.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500">
                                No proposals found.
                            </td>
                        </tr>
                    ) : (
                        filteredProposals.map((proposal) => (
                            <tr key={proposal.proposal_id}>
                                <td className="border px-4 py-2">
                                    <Link
                                        to={`${proposal.proposal_id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {proposal.proposal_title}
                                    </Link>
                                </td>
                                <td className="border px-4 py-2">{proposal.description}</td>
                                <td className="border px-4 py-2 capitalize">{proposal.status}</td>
                                <td className="border px-4 py-2">
                                    <div className="flex gap-x-2">
                                        <button className="bg-yellow-500 text-white px-6 h-10 rounded hover:bg-yellow-700">Edit</button>
                                        <button
                                            className="bg-red-600 text-white px-6 h-10 rounded hover:bg-red-700"
                                            onClick={() => openDeleteModal(proposal)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>

            </table>


            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                <p>
                    Showing to  of entries
                </p>

                <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>


            {showModal && (
                <AddProposalModal
                    projectId={project_id}
                    onClose={() => setShowModal(false)}
                    onProposalAdded={() => {
                        fetch(`${PROPOSAL_API_BASE_URL}${project_id}`)
                            .then((res) => res.json())
                            .then((data) => setProposals(data));
                    }}
                />
            )}


            {deleteModalOpen && (
                <DeleteProposalModal
                    isOpen={deleteModalOpen}
                    onClose={closeDeleteModal}
                    onDelete={handleDelete}
                    proposalTitle={proposalToDelete?.proposal_title}
                />
            )}



        </div>

    );
};

export default ProposalTable;