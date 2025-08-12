import React, { useState, useEffect, useRef } from "react";

const PROPOSAL_API_URL = "http://localhost:5000/api/proposals/";

const UpdateProposalModal = ({ projectId, proposal, onClose, onProposalUpdated }) => {
    const [proposalTitle, setProposalTitle] = useState("");
    const [description, setDescription] = useState("");
    const [proposalStatus, setProposalStatus] = useState("pending");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const modalRef = useRef(null);

    // Load proposal data into form fields
    useEffect(() => {
        if (proposal) {
            setProposalTitle(proposal.proposal_title || "");
            setDescription(proposal.description || "");
            setProposalStatus(proposal.status || "pending");
        }
    }, [proposal]);

    const handleUpdateProposal = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${PROPOSAL_API_URL}${projectId}/${proposal.proposal_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    proposal_title: proposalTitle,
                    description,
                    status: proposalStatus,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update proposal");

            onProposalUpdated(); // refresh proposals list
            onClose();
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!proposal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[99999]">
            <div
                className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
                onClick={onClose}
            ></div>

            <div
                ref={modalRef}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-xl z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 z-20 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
                    aria-label="Close modal"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>

                <h2 className="text-xl font-semibold mb-4">Edit Proposal</h2>

                {error && <div className="text-red-600 mb-2">{error}</div>}

                <form onSubmit={handleUpdateProposal} className="space-y-4">
                    <div>
                        <label className="block font-medium">Proposal Title</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={proposalTitle}
                            onChange={(e) => setProposalTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Description</label>
                        <textarea
                            className="w-full border p-2 rounded"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block font-medium">Status</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={proposalStatus}
                            onChange={(e) => setProposalStatus(e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProposalModal;
