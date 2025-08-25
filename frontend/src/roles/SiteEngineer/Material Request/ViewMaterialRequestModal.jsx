import React from "react";

const ViewMaterialRequestModal = ({ report, materials = [], onClose }) => {
    if (!report) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-2xl font-bold">View Material Request</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-xl">✕</button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 py-4 flex-1 space-y-6 text-sm text-gray-800">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-md font-bold text-gray-800">Project Name</p>
                            <p className="text-base text-gray-800 mt-1">{report.project_name}</p>
                        </div>
                        <div>
                            <p className="text-md font-bold text-gray-800">Urgency</p>
                            <p className="text-base text-gray-800 mt-1">{report.urgency}</p>
                        </div>
                        <div>
                            <p className="text-md font-bold text-gray-800">Request Date</p>
                            <p className="text-base text-gray-800 mt-1">{new Date(report.request_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-md font-bold text-gray-800">Status</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                report.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : report.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                            }`}>
                                {report.status}
                            </span>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <p className="text-md font-bold text-gray-800 mb-1">Additional Notes</p>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap">
                            {report.notes || "n/a"}
                        </div>
                    </div>

                    {/* Requested Materials Section */}
                    <div>
                        <p className="text-md font-bold text-gray-800 mb-2">Requested Materials</p>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            {materials && materials.length > 0 ? (
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-left font-semibold pb-2">Material Name</th>
                                            <th className="text-left font-semibold pb-2">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {materials.map((mat, idx) => (
                                            <tr key={idx}>
                                                <td className="py-1">{mat.item_name || mat.name}</td>
                                                <td className="py-1">{mat.request_quantity} {mat.unit || ""}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500">No requested materials.</p>
                            )}
                        </div>
                    </div>

                    {/* Prepared By */}
                    <div>
                        <p className="text-md font-bold text-gray-800 mb-1">Prepared By</p>
                        <p>{report.full_name || "n/a"}</p>
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

export default ViewMaterialRequestModal;


