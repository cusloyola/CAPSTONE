import React, { useEffect, useState } from "react";
import { getProposalsByProject } from "../../../../api/proposalApi";
import { createGanttChart } from "../../../../api/ganttChartApi"
import { toast } from "react-toastify";


const AddGanttChartModal = ({ isOpen, onClose, projectId }) => {
    const [proposals, setProposals] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [notes, setNotes] = useState("");
    const [title, setTitle] = useState("");

    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const user_id = user?.id;

    // Fetch proposals
    useEffect(() => {
        if (!projectId) return;

        const fetchProposals = async () => {
            try {
                const data = await getProposalsByProject(projectId);
                setProposals(data);
                if (data.length > 0) {
                    setSelectedProposal(data[0]);
                }
            } catch (err) {
                console.error("❌ Failed to fetch proposals:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, [projectId]);

    const handleProposalChange = (e) => {
        const proposal = proposals.find(
            (p) => p.proposal_id === parseInt(e.target.value)
        );
        setSelectedProposal(proposal || null);
        if (proposal) setTitle(`Gantt Chart - ${proposal.proposal_title}`);
    };

    const handleSave = async () => {
        if (!selectedProposal) {
            toast.error("Please select a proposal.");
            return;
        }

        try {
            const result = await createGanttChart({
                proposal_id: selectedProposal.proposal_id,
                title: `Gantt Chart - ${selectedProposal.proposal_title}`,
                notes,
                approved_by: user?.id,
                created_by: user?.id,
            });

            toast.success("Gantt Chart created successfully!");
            console.log("Gantt chart created:", result);

            setNotes("");
            setTitle("");
            setSelectedProposal(proposals[0] || null);

            onClose(); 
        } catch (err) {
            console.error("❌ Gantt creation error:", err);
            toast.error(err.message || "Failed to create Gantt Chart");
        }
    };



    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-10">
                <h2 className="text-xl font-bold mb-4">Add Gantt Chart</h2>

                {loading ? (
                    <p>Loading proposals...</p>
                ) : proposals.length > 0 ? (
                    <>
                        {/* Project */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Project
                            </label>
                            <input
                                type="text"
                                value={selectedProposal?.project_name || ""}
                                readOnly
                                className="w-full border rounded p-2 bg-gray-100"
                            />
                        </div>

                        {/* Proposal Dropdown */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Proposal
                            </label>
                            <select
                                className="w-full border rounded p-2"
                                onChange={handleProposalChange}
                                value={selectedProposal?.proposal_id || ""}
                            >
                                {proposals.map((p) => (
                                    <option key={p.proposal_id} value={p.proposal_id}>
                                        {p.proposal_title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                defaultValue={"Gantt Chart"}
                                readOnly
                                className="w-full border rounded p-2 bg-gray-100"
                            />
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                className="w-full border rounded p-2"
                                placeholder="Add notes or comments here..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                            />
                        </div>

                        {/* Approved By */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Approved By
                            </label>
                            <input
                                type="text"
                                value={user?.name || ""}
                                readOnly
                                className="w-full border border-gray-300 p-2 rounded bg-gray-100"
                            />
                        </div>
                    </>
                ) : (
                    <p>No proposals found.</p>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleSave}
                    >
                        Save
                    </button>

                </div>
            </div>
        </div>
    );
};

export default AddGanttChartModal;
