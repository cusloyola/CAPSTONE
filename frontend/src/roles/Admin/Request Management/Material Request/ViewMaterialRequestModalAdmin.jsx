import React from "react";

const ViewMaterialRequestModalAdmin = ({ report, materials = [], onClose }) => {
  if (!report) return null;

  // Calculate total quantity and total cost
  const totalQuantity = materials.reduce(
    (sum, item) => sum + (item.request_quantity || 0),
    0
  );

  const totalCost = materials.reduce(
    (sum, item) =>
      sum + (item.request_quantity || 0) * (item.default_unit_cost || 0),
    0
  );

  // Determine label and value for approval/rejection date
  let approvalLabel = "";
  let approvalDate = "";
  if (report.status === "approved" && report.approved_at) {
    approvalLabel = "Date Approved";
    approvalDate = new Date(report.approved_at).toLocaleDateString();
  } else if (report.status === "rejected" && report.approved_at) {
    approvalLabel = "Date Rejected";
    approvalDate = new Date(report.approved_at).toLocaleDateString();
  }

  // Capitalize first letter of status
  const statusDisplay =
    report.status && typeof report.status === "string"
      ? report.status.charAt(0).toUpperCase() + report.status.slice(1).toLowerCase()
      : report.status;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">View Material Request</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-6 text-sm text-gray-800">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-md font-bold text-gray-800">Project Name</p>
              <p className="text-base text-gray-800 mt-1">
                {report.project_name}
              </p>
            </div>
            <div>
              <p className="text-md font-bold text-gray-800">Urgency</p>
              <p className="text-base text-gray-800 mt-1">{report.urgency}</p>
            </div>
            <div>
              <p className="text-md font-bold text-gray-800">Request Date</p>
              <p className="text-base text-gray-800 mt-1">
                {new Date(report.request_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-md font-bold text-gray-800">Status</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${report.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : report.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                  }`}
              >
                {statusDisplay}
              </span>
            </div>
            {/* Approval/Rejection Date */}
            {approvalLabel && approvalDate && (
              <div>
                <p className="text-md font-bold text-gray-800">{approvalLabel}</p>
                <p className="text-base text-gray-800 mt-1">{approvalDate}</p>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <p className="text-md font-bold text-gray-800 mb-1">
              Additional Notes
            </p>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap">
              {report.notes || "n/a"}
            </div>
          </div>

          <hr className="my-4" />

          {/* Requested Materials Section */}
          <div>
            <p className="text-md font-bold text-gray-800 mb-2">
              Requested Materials
            </p>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              {materials && materials.length > 0 ? (
                <table className="min-w-full text-sm border-collapse border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-2  py-2 text-center font-semibold">Material</th>
                      <th className="border border-gray-300 px-2 py-2   text-center font-semibold">Brand</th>
                      <th className="border border-gray-300 px-2  py-2 text-ricente  font-semibold">Quantity</th>
                      <th className="border border-gray-300 px-2  py-2  text-center font-semibold">Unit Cost</th>
                      <th className="border border-gray-300 px-2  py-2  text-center font-semibold">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((mat, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-1 text-left">{mat.material_name}</td>
                        <td className="border border-gray-300 px-2 py-1 text-left">{mat.brand_name || "N/A"}</td>
                        <td className="border border-gray-300 px-2 py-1 text-right">{mat.request_quantity}</td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          ₱{mat.default_unit_cost ? mat.default_unit_cost.toLocaleString() : "N/A"}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          ₱{(mat.request_quantity && mat.default_unit_cost) ? (mat.request_quantity * mat.default_unit_cost).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="border border-gray-300 px-2 py-2 text-right" colSpan="2">Total:</td>
                      <td className="border border-gray-300 px-2 py-2 text-right">{totalQuantity}</td>
                      <td className="border border-gray-300 px-2 py-2"></td>
                      <td className="border border-gray-300 px-2 py-2 text-right">₱{totalCost.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>

              ) : (
                <p className="text-gray-500">No requested materials.</p>
              )}
            </div>
          </div>

          <hr className="my-4" />

          {/* Prepared By */}
          <div>
            <p className="text-md font-bold text-gray-800 mb-1">Prepared By</p>
            <p>Engr. Gino Herrera</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMaterialRequestModalAdmin;