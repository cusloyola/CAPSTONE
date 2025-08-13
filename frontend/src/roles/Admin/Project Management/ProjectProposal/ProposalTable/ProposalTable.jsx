import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import AddProposalModal from "./AddProposalModal";
import DeleteProposalModal from "./DeleteProposalModal";
import UpdateProposalModal from "./UpdateProposalModal";
import { FaEllipsisV } from "react-icons/fa";

const PROPOSAL_API_BASE_URL = "http://localhost:5000/api/proposals/";

const ProposalTable = () => {
    const { project_id } = useParams();
    const [proposals, setProposals] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false); // New state for update modal
    const [proposalToUpdate, setProposalToUpdate] = useState(null); // New state for proposal to update
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [proposalToDelete, setProposalToDelete] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [proposalsPerPage, setProposalsPerPage] = useState(10);

    // Fetch proposals from the API
    const fetchProposals = () => {
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
    };

    useEffect(() => {
        fetchProposals();
    }, [project_id]);

    // Handle dropdown clicks and prevent default scroll
    const toggleDropdown = (e, proposalId) => {
        e.preventDefault(); // This prevents the scroll on click
        setOpenDropdownId(openDropdownId === proposalId ? null : proposalId);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // Summary statistics
    const totalProposals = proposals.length;
    const pendingProposals = proposals.filter(p => p.status?.toLowerCase() === 'pending').length;
    const approvedProposals = proposals.filter(p => p.status?.toLowerCase() === 'approved').length;

    // Filter and search logic
    const filteredProposals = proposals.filter((proposal) => {
        const searchLower = search.toLowerCase();
        const matchesSearch = proposal.proposal_title.toLowerCase().includes(searchLower);
        const matchesStatus = statusFilter === "" || proposal.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const indexOfLastProposal = currentPage * proposalsPerPage;
    const indexOfFirstProposal = indexOfLastProposal - proposalsPerPage;
    const currentProposals = filteredProposals.slice(indexOfFirstProposal, indexOfLastProposal);
    const totalPages = Math.ceil(filteredProposals.length / proposalsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Modal handlers
    const openAddModal = () => {
        setOpenDropdownId(null); // Close dropdown when opening a modal
        setShowAddModal(true);
    };

    const openUpdateModal = (proposal) => {
        setOpenDropdownId(null); // Close dropdown when opening a modal
        setProposalToUpdate(proposal);
        setShowUpdateModal(true);
    };

    const openDeleteModal = (proposal) => {
        setOpenDropdownId(null); // Close dropdown when opening a modal
        setProposalToDelete(proposal);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setProposalToDelete(null);
    };

    const closeUpdateModal = () => {
        setShowUpdateModal(false);
        setProposalToUpdate(null);
    };

    const handleDelete = () => {
        fetch(`${PROPOSAL_API_BASE_URL}${project_id}/${proposalToDelete.proposal_id}`, {
            method: 'DELETE',
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to delete');
                fetchProposals();
                closeDeleteModal();
            })
            .catch((err) => {
                alert('Error deleting proposal: ' + err.message);
            });
    };

    return (
        <div className="p-6 min-h-screen space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4zm0 4h10v2H4z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Proposal Table</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-800"
                        onClick={openAddModal}
                    >
                        Create Proposal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                    <p className="text-sm text-gray-500">Total Proposals</p>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-gray-800">{totalProposals}</h2>
                        {/* SVG icon for total proposals */}
                    </div>
                    <p className="text-blue-600 text-sm">Includes all statuses</p>
                </div>


                <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                    <p className="text-sm text-gray-500">Pending Proposals</p>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-gray-800">{pendingProposals}</h2>
                        {/* SVG icon for pending proposals */}
                    </div>
                    <p className="text-blue-600 text-sm">Still under review</p>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                    <p className="text-sm text-gray-500">Approved Proposals</p>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-gray-800">{approvedProposals}</h2>
                        {/* SVG icon for approved proposals */}
                    </div>
                    <p className="text-blue-600 text-sm">Approved & completed</p>
                </div>
            </div>

            <div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border px-3 py-1 rounded-lg text-md h-10 w-40"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            {/* Search and Filter Controls */}
            <div className="flex justify-between items-center flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Show</label>
                    <select
                        className="border px-2 py-1 rounded-lg text-sm h-10 w-20"
                        value={proposalsPerPage}
                        onChange={(e) => setProposalsPerPage(Number(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <label className="text-sm text-gray-700">entries</label>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <input
                        id="searchInput"
                        type="text"
                        placeholder="Search proposals..."
                        className="border p-2 rounded w-64 h-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Proposal Table */}
            <div>
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
                        {currentProposals.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4 text-gray-500">
                                    No proposals found.
                                </td>
                            </tr>
                        ) : (
                            currentProposals.map((proposal) => (
                                <tr key={proposal.proposal_id}>
                                    <td className="border px-4 py-2">
                                        <Link
                                            to={`${proposal.proposal_id}/scope-of-work`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {proposal.proposal_title}
                                        </Link>
                                    </td>
                                    <td className="border px-4 py-2">{proposal.description}</td>
                                    <td className="border px-4 py-2 capitalize">{proposal.status}</td>
                                    <td className="border px-4 py-2 relative ">
                                        <button
                                            className="p-2 text-gray-600 hover:text-black z-10"
                                            onClick={(e) => toggleDropdown(e, proposal.proposal_id)}
                                        >
                                            <FaEllipsisV />
                                        </button>

                                        {openDropdownId === proposal.proposal_id && (
                                            <div ref={dropdownRef} className="absolute right-0 mt-2 w-32 bg-white border shadow-lg rounded z-10">
                                                <button
                                                    className="block w-full px-4 py-2 text-left hover:bg-yellow-100 text-yellow-700"
                                                    onClick={() => openUpdateModal(proposal)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="block w-full px-4 py-2 text-left hover:bg-red-100 text-red-700"
                                                    onClick={() => openDeleteModal(proposal)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                <p>
                    Showing {indexOfFirstProposal + 1} to {Math.min(indexOfLastProposal, filteredProposals.length)} of {filteredProposals.length} entries
                </p>
                <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddProposalModal
                    projectId={project_id}
                    onClose={() => setShowAddModal(false)}
                    onProposalAdded={fetchProposals}
                />
            )}
            {showUpdateModal && (
                <UpdateProposalModal
                    projectId={project_id}
                    proposal={proposalToUpdate}
                    onClose={closeUpdateModal}
                    onProposalUpdated={fetchProposals}
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