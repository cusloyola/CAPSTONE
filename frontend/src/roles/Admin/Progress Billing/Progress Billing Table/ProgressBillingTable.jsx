import React, { useEffect, useState } from "react";
import AddProgressBillingModal from "./AddProgressBillingModal";
import { Link, useParams } from "react-router-dom"; // ✅ Add Link here
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

 useEffect(() => {
    if (project_id) {
        // ✅ Immediately reset state before fetch to avoid showing old data
        setSelectedProposal(null);
        setBillingList([]);

        fetch(`${PROGRESSBILL_API_URL}/approved-proposal/${project_id}`)
            .then((res) => {
                if (!res.ok) throw new Error("No approved proposal found");
                return res.json();
            })
            .then((data) => {
                setSelectedProposal(data.data);

                // ✅ Fetch billings for that proposal
                return fetch(`${PROGRESSBILL_API_URL}/fetch/${data.data.proposal_id}`);
            })
            .then((res) => res.json())
            .then((billingData) => setBillingList(billingData.data))
            .catch((err) => {
                console.error("Proposal or Billing fetch failed:", err);
                setSelectedProposal(null);
                setBillingList([]);
            });
    } else {
        // ✅ Reset if project_id is undefined
        setSelectedProposal(null);
        setBillingList([]);
    }
}, [project_id]);


    const handleAddProgressBilling = (billing) => {
        const payload = {
            ...billing,
            user_id: user_id,
            previous_billing_id: billingList?.at(-1)?.billing_id || null, 

        };

        fetch(`${PROGRESSBILL_API_URL}/add/${selectedProposal?.proposal_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                return res.json();
            })
            .then(() => {
                return fetch(`${PROGRESSBILL_API_URL}/fetch/${selectedProposal?.proposal_id}`);
            })
            .then((res) => res.json())
            .then((data) => setBillingList(data.data))
            .catch((err) => {
                console.error("Error adding billing:", err);
            });
    };

    const handleCopyBilling = (billingId) => {
        fetch(`${PROGRESSBILL_API_URL}/copy/${billingId}`, {
            method: "POST",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to copy");
                return res.json();
            })
            .then(() => {
                return fetch(`${PROGRESSBILL_API_URL}/fetch/${selectedProposal?.proposal_id}`);
            })
            .then((res) => res.json())
            .then((data) => {
                setBillingList(data.data);
            })
            .catch((err) => {
                console.error("Copy failed:", err);
            });
    };




    return (
        <div className="p-4 space-y-6 bg-white shadow rounded">
            <div className="bg-[#2fbcbc] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Progress Billing</h1>
                {selectedProposal && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
                    >
                        Add Progress Billing
                    </button>
                )}
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
                        billingList.map((billing, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2 text-blue-600 underline">
                                    <Link to={`${billing.billing_id}`}>
                                        {billing.subject}&nbsp;{billing.billing_no}
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
