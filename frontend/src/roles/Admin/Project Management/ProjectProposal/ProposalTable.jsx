import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const PROPOSAL_API_BASE_URL = "http://localhost:5000/api/proposals/";


const ProposalTable = () => {
    const { project_id } = useParams();
    const [proposals, setProposals] = useState([]);


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



    return (
        <div className="p-4 space-y-6 bg-white shadow rounded">
            <div className="bg-[#6c8cbf] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Proposal Table</h1>
                <div className="flex items-center space-x-2">
                    <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100">
                        Create Proposal
                    </button>
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
                    {proposals.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500">
                                No proposals found.
                            </td>
                        </tr>
                    ) : (
                        proposals.map((proposal) => (
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
                                        <button className="bg-red-600 text-white px-6 h-10 rounded hover:bg-red-700">Delete</button>
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



        </div>

    );
};

export default ProposalTable;