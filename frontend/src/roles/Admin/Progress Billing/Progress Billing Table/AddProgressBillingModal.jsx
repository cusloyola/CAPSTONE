import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddProgressBillingModal = ({
  onClose,
  onSave,
  proposal_name,
  project_name,
  proposal_id,
  full_name,
  user_id,
  billingList = [],
}) => {
  const [billingDate, setBillingDate] = useState(new Date());
  const [billingNo, setBillingNo] = useState("");
  const [notes, setNotes] = useState("");
  const [previousBillingId, setPreviousBillingId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // heads-up states
  const [accumulatedPercent, setAccumulatedPercent] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingBilling, setPendingBilling] = useState(null);

  useEffect(() => {
    console.log("Modal opened with:", {
      proposal_name,
      project_name,
      proposal_id,
      user_id,
    });
  }, [proposal_name, project_name, proposal_id, user_id]);

  const handleSaveClick = async (e) => {
    e.preventDefault();

    const billing = {
      billing_no: billingNo,
      proposal_id,
      subject: "Progress Billing",
      billing_date: billingDate.toISOString().split("T")[0],
      status: "Draft",
      revision: 0,
      evaluated_by: full_name || "",
      user_id,
      notes,
      previous_billing_id: previousBillingId || null,
    };

    // ✅ if no previous billing, just save
    if (!billing.previous_billing_id) {
      return submitBilling(billing);
    }

    try {
      setSubmitting(true);
      const res = await fetch(
        `http://localhost:5000/api/progress-billing/wtaccomp/${billing.previous_billing_id}`
      );
      if (!res.ok) throw new Error("Failed to fetch accumulated percent");

      const data = await res.json();
      const percent = data.wt_accomp ?? 0;

      if (percent >= 19) {
        setAccumulatedPercent(percent);
        setPendingBilling(billing);
        setShowConfirm(true);
        setSubmitting(false);
        return;
      }

      // if below threshold → save directly
      submitBilling(billing);
    } catch (err) {
      console.error("Failed to fetch accumulated percent:", err);
      submitBilling(billing); // fallback: still try to save
    }
  };

  const submitBilling = async (billing) => {
    console.log("📤 Submitting billing data:", billing);
    const success = await onSave(billing);

    if (success) {
      onClose();
    } else {
      alert("Failed to save billing.");
    }

    setSubmitting(false);
  };

  const handleConfirm = () => {
    if (pendingBilling) {
      submitBilling(pendingBilling);
    }
    setShowConfirm(false);
    setPendingBilling(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingBilling(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-400/50 backdrop-blur-[32px] flex justify-center items-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md shadow space-y-4">
        <h2 className="text-lg font-semibold">Add Progress Billing</h2>
        <form onSubmit={handleSaveClick} className="space-y-4">
          {/* Billing Date */}
          <div>
            <label className="block font-medium mb-1">Billing Date</label>
            <DatePicker
              selected={billingDate}
              onChange={(date) => setBillingDate(date)}
              dateFormat="MM-dd-yyyy"
              className="border p-2 rounded w-full"
              wrapperClassName="w-full"
            />
          </div>

          {/* Billing No. */}
          <div>
            <label className="block font-medium mb-1">Billing No.</label>
            <input
              type="text"
              value={billingNo}
              onChange={(e) => setBillingNo(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </div>

          {/* Based on Previous Billing */}
          <div>
            <label className="block font-medium mb-1">Based on Previous Billing</label>
            <select
              className="border p-2 rounded w-full"
              value={previousBillingId}
              onChange={(e) => setPreviousBillingId(e.target.value)}
            >
              <option value="">-- None (Start Fresh) --</option>
              {billingList.map((bill) => (
                <option key={bill.billing_id} value={bill.billing_id}>
                  {bill.subject} {bill.billing_no} -{" "}
                  {new Date(bill.billing_date).toLocaleDateString("en-CA")}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional description or remarks"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Proposal Title */}
          <div>
            <label className="block font-medium mb-1">Proposal</label>
            <input
              type="text"
              value={proposal_name || ""}
              disabled
              className="border p-2 rounded w-full bg-gray-100"
            />
          </div>

          {/* Project Title */}
          <div>
            <label className="block font-medium mb-1">Project</label>
            <input
              type="text"
              value={project_name || ""}
              disabled
              className="border p-2 rounded w-full bg-gray-100"
            />
          </div>

          {/* Evaluated By */}
          <div>
            <label className="block font-medium mb-1">Evaluated By</label>
            <input
              type="text"
              value={full_name || ""}
              disabled
              className="border p-2 rounded w-full bg-gray-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={submitting}
            >
              Save
            </button>
          </div>
        </form>
      </div>

      {/* Heads-up modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Heads Up</h3>
            <p className="mb-4">
              The selected previous billing has an accumulated{" "}
              <strong>{accumulatedPercent}%</strong>. <br />
              Do you want to continue saving?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCancelConfirm}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleConfirm}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProgressBillingModal;
