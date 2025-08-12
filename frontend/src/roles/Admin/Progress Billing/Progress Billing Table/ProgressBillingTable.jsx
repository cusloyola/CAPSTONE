import React, { useEffect, useState } from "react";
import AddProgressBillingModal from "./AddProgressBillingModal";
import { Link, useParams } from "react-router-dom";
import ActionDropdown from "./ActionDropdown";

const PROGRESSBILL_API_URL = "http://localhost:5000/api/progress-billing";

const ProgressBillingTable = () => {
    const { project_id } = useParams();
    const [showModal, setShowModal] = useState(false);
    const [billingList, setBillingList] = useState([]);
    const [selectedProposal, setSelectedProposal] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const user_id = user?.id;
    const user_name = user?.name;

    // ✅ Helper to remove duplicates based on billing_id
    const deduplicate = (arr) =>
        Array.from(new Map(arr.map((item) => [item.billing_id, item])).values());

    useEffect(() => {
        if (!project_id) {
            setSelectedProposal(null);
            setBillingList([]);
            return;
        }

        const fetchProposalAndBillings = async () => {
            try {
                setSelectedProposal(null);
                setBillingList([]); // ✅ Clear before fetch

                const proposalRes = await fetch(`${PROGRESSBILL_API_URL}/approved-proposal/${project_id}`);
                if (!proposalRes.ok) throw new Error("No approved proposal found");
                const proposalData = await proposalRes.json();
                setSelectedProposal(proposalData.data);

                const billingRes = await fetch(`${PROGRESSBILL_API_URL}/fetch/${proposalData.data.proposal_id}`);
                const billingData = await billingRes.json();
                setBillingList(deduplicate(billingData.data));
            } catch (err) {
                console.error("Proposal or Billing fetch failed:", err);
                setSelectedProposal(null);
                setBillingList([]);
            }
        };

        fetchProposalAndBillings();
    }, [project_id]);

    const handleAddProgressBilling = async (billing) => {
        try {
            const payload = {
                ...billing,
                user_id,
                previous_billing_id: billingList?.at(-1)?.billing_id || null,
            };

            const res = await fetch(`${PROGRESSBILL_API_URL}/add/${selectedProposal?.proposal_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to add billing");

            const updated = await fetch(`${PROGRESSBILL_API_URL}/fetch/${selectedProposal?.proposal_id}`);
            const data = await updated.json();
            setBillingList(deduplicate(data.data));

            return true;
        } catch (err) {
            console.error("Error adding billing:", err);
            return false;
        }
    };

    const handleCopyBilling = async (billingId) => {
        try {
            const res = await fetch(`${PROGRESSBILL_API_URL}/copy/${billingId}`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to copy");

            const updated = await fetch(`${PROGRESSBILL_API_URL}/fetch/${selectedProposal?.proposal_id}`);
            const data = await updated.json();
            setBillingList(deduplicate(data.data));
        } catch (err) {
            console.error("Copy failed:", err);
        }
    };

    return (
        <div className="p-6 min-h-screen space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <svg
                            className="w-6 h-6 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4zm0 4h10v2H4z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Progress Billing
                    </h1>
                </div>

                 <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-800"
                    >
                        Add Progress Billing
                    </button>
                </div>

                   </div>


            {/* <div className="bg-[#2fbcbc] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Progress Billing</h1>
                {selectedProposal && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
                    >
                        Add Progress Billing
                    </button>
                )}
            </div> */}

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
    <div class="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
        <p class="text-sm text-gray-500">Total Proposals</p>
        <div class="flex items-center gap-4">
            <h2 class="text-3xl font-bold text-gray-800">0</h2>
            <svg class="text-3xl text-gray-600" fill="currentColor" viewBox="0 0 512 512" width="28" height="28">
                <path d="M336 64H176a16 16 0 00-16 16v16h192V80a16 16 0 00-16-16zM432 112H80a16 16 0 00-16 16v304a16 16 0 0016 16h352a16 16 0 0016-16V128a16 16 0 00-16-16zM384 368H128V160h256z" />
            </svg>
        </div>
        <p class="text-blue-600 text-sm">Includes all statuses</p>
    </div>

    <div class="bg-white border border-gray-200 p-5 rounded-2xl shadow space-y-2">
        <p class="text-sm text-gray-500">Pending Proposals</p>
        <div class="flex items-center gap-4">
            <h2 class="text-3xl font-bold text-gray-800">0</h2>
            <svg class="text-3xl text-gray-600" fill="currentColor" viewBox="0 0 576 512" width="28" height="28">
                <path d="M569.344 231.979C512.641 135.22 407.048 64 288 64S63.359 135.22 6.656 231.979a32.005 32.005 0 000 32.042C63.359 376.78 168.952 448 288 448s224.641-71.22 281.344-183.979a32.005 32.005 0 000-32.042zM288 400c-97.047 0-188.077-56.806-240-144 51.923-87.194 142.953-144 240-144s188.077 56.806 240 144c-51.923 87.194-142.953 144-240 144zm0-240c-53.019 0-96 42.981-96 96s42.981 96 96 96 96-42.981 96-96-42.981-96-96-96zm0 144a48 48 0 110-96 48 48 0 010 96z" />
            </svg>
        </div>
        <p class="text-blue-600 text-sm">Still under review</p>
    </div>

    <div class="bg-white border border-gray-200 p-5 rounded-2xl shadow space-y-2">
        <p class="text-sm text-gray-500">Approved Proposals</p>
        <div class="flex items-center gap-4">
            <h2 class="text-3xl font-bold text-gray-800">0</h2>
            <svg class="text-3xl text-gray-600" fill="currentColor" viewBox="0 0 512 512" width="28" height="28">
                <path d="M256 48C141.125 48 48 141.125 48 256s93.125 208 208 208 208-93.125 208-208S370.875 48 256 48zM368 224l-128 128-64-64 22.625-22.625L240 305.375 345.375 200z" />
            </svg>
        </div>
        <p class="text-blue-600 text-sm">Approved & completed</p>
    </div>
</div>

<div class="flex flex-wrap gap-4 mt-6">
    <div class="flex flex-col gap-2">
        <select class="border px-3 py-1 rounded-lg text-md h-10 w-40 mt-4">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
        </select>
    </div>
</div>

<div class="flex justify-between items-center mt-4">
    <div>
        <label class="text-sm">
            Show
            <select class="mx-2 px-2 py-1 border rounded w-14">
                <option>1</option>
                <option>25</option>
                <option>50</option>
            </select>
            entries
        </label>
    </div>
    <div class="flex items-center gap-2">
        <input type="text" placeholder="Search proposals..." class="border p-2 rounded w-64" />
    </div>
</div>



            <table className="table-auto w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2 text-left">Billing No.</th>
                        <th className="border px-4 py-2 text-left">Billing Date</th>
                        <th className="border px-4 py-2 text-left">Evaluated By</th>
                        <th className="border px-4 py-2 text-left">Status</th>
                        <th className="border px-4 py-2 text-left">Notes</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {billingList.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="text-center py-4 text-gray-500">
                                No progress billing records found.
                            </td>
                        </tr>
                    ) : (
                        billingList.map((billing) => (
                            <tr key={billing.billing_id}>
                                <td className="border px-4 py-2 text-blue-600 underline">
                                    <Link to={`${billing.billing_id}`}>
                                        {billing.subject} {billing.billing_no}
                                    </Link>
                                </td>
                                <td className="border px-4 py-2">
                                    {new Date(billing.billing_date).toLocaleDateString("en-CA")}
                                </td>
                                <td className="border px-4 py-2">{billing.evaluated_by || "N/A"}</td>
                                <td className="border px-4 py-2">{billing.status}</td>
                                <td className="border px-4 py-2">{billing.notes}</td>
                                <td className="border px-4 py-2 space-x-2">
                                    <ActionDropdown
                                        onEdit={() => console.log("✏️ Edit", billing.billing_id)}
                                        onDelete={() => console.log("🗑️ Delete", billing.billing_id)}
                                        onCopy={() => handleCopyBilling(billing.billing_id)}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {showModal && (
                <AddProgressBillingModal
                    onClose={() => setShowModal(false)}
                    onSave={handleAddProgressBilling}
                    proposal_name={selectedProposal?.proposal_title}
                    project_name={selectedProposal?.project_name}
                    proposal_id={selectedProposal?.proposal_id}
                    user_id={user_id}
                    full_name={user_name}
                    billingList={billingList}
                />
            )}
        </div>
    );
};

export default ProgressBillingTable;
