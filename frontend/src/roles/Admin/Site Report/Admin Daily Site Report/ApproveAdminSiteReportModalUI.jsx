import React from "react";

const ApproveAdminSiteReportModalUI = ({
    isOpen,
    onClose,
    report,
    remarks,
    setRemarks,
    onApprove,
}) => {
    if (!isOpen || !report) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Approve Site Report</h2>

                <div className="mb-6 flex flex-col gap-2">
                    <p className="text-sm text-gray-600">
                        Project: <strong>{report.project_name}</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                        Date:<strong> {new Date(report.report_date).toLocaleDateString()}</strong>
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks (Optional)
                    </label>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your notes before approving..."
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onApprove}
                        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                    >
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveAdminSiteReportModalUI;
