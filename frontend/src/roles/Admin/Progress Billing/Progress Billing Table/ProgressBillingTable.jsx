import React, { useEffect, useState } from "react";
import AddProgressBillingModal from "./AddProgressBillingModal";
import { Link, useParams } from "react-router-dom";
import ActionDropdown from "./ActionDropdown";

const PROGRESSBILL_API_URL = "http://localhost:5000/api/progress-billing";

const ProgressBillingTable = () => {
  const { project_id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [billingList, setBillingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const user_id = user?.id;
  const user_name = user?.name;

  // Remove duplicates
  const deduplicate = (arr) =>
    Array.from(new Map(arr.map((item) => [item.billing_id, item])).values());


  useEffect(() => {
  if (!project_id) return;

  const fetchBillings = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1️⃣ Fetch existing progress billings
      const res = await fetch(`${PROGRESSBILL_API_URL}/fetch/${project_id}`);
      const result = await res.json();
      const uniqueData = Array.isArray(result.data) ? deduplicate(result.data) : [];
      setBillingList(uniqueData);

      if (uniqueData.length > 0) {
        // Existing billing found
        const first = uniqueData[0];
        setSelectedProposal({
          proposal_id: first.proposal_id,
          proposal_name: first.proposal_title,
          project_name: first.project_name,
        });
      } else {
        // 2️⃣ No billing yet → fetch approved proposal
        const proposalRes = await fetch(`${PROGRESSBILL_API_URL}/approved-proposal/${project_id}`);
        if (!proposalRes.ok) throw new Error("Failed to fetch approved proposal");
        const proposalData = await proposalRes.json();
        setSelectedProposal({
          proposal_id: proposalData.data.proposal_id,
          proposal_name: proposalData.data.proposal_title,
          project_name: proposalData.data.project_name,
        });
      }
    } catch (err) {
      console.error("Billing fetch failed:", err);
      setError("Unable to load progress billings.");
      setBillingList([]);
    } finally {
      setLoading(false);
    }
  };

  fetchBillings();
}, [project_id]);


  // Add progress billing
  const handleAddProgressBilling = async (billing) => {
    try {
      const payload = {
        ...billing,
        user_id,
        previous_billing_id: billingList?.at(-1)?.billing_id || null,
      };

      const res = await fetch(`${PROGRESSBILL_API_URL}/add/${project_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add billing");

      const updated = await fetch(`${PROGRESSBILL_API_URL}/fetch/${project_id}`);
      const data = await updated.json();
      setBillingList(deduplicate(data.data));
      return true;
    } catch (err) {
      console.error("Error adding billing:", err);
      return false;
    }
  };

  // Copy billing
  const handleCopyBilling = async (billingId) => {
    try {
      const res = await fetch(`${PROGRESSBILL_API_URL}/copy/${billingId}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to copy");

      const updated = await fetch(`${PROGRESSBILL_API_URL}/fetch/${project_id}`);
      const data = await updated.json();
      setBillingList(deduplicate(data.data));
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="p-6 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h16v2H4zm0 4h16v2H4zm0 4h10v2H4zm0 4h10v2H4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Progress Billing</h1>
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

      {/* Billing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
          <p className="text-sm text-gray-500">Total Proposals</p>
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-800">{billingList.length}</h2>
          </div>
        </div>
      </div>

      {/* Billing Table */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <table className="table-auto w-full border border-gray-300 text-sm mt-6">
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
      )}

      {/* Add Billing Modal */}
      {showModal && selectedProposal && (
        <AddProgressBillingModal
          onClose={() => setShowModal(false)}
          onSave={handleAddProgressBilling}
          user_id={user_id}
          full_name={user_name}
          billingList={billingList}
          proposal_name={selectedProposal?.proposal_name || ""}
          project_name={selectedProposal?.project_name || ""}
          proposal_id={selectedProposal?.proposal_id || ""}
        />
      )}
    </div>
  );
};

export default ProgressBillingTable;
