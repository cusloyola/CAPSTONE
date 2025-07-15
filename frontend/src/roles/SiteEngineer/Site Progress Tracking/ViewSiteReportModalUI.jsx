import React from "react";

const ViewSiteReportModalUI = ({ report, onClose }) => {
    if (!report) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-2xl font-bold">View Daily Site Report</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-xl">✕</button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 py-4 flex-1 space-y-6 text-sm text-gray-800">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "Project Name", value: report.project_name },
                            { label: "Subject", value: "Daily Work Activities Report" },
                            { label: "Location", value: report.location },
                            { label: "Report Date", value: new Date(report.report_date).toLocaleDateString() },
                            { label: "Owner", value: report.client_name },
                            { label: "Status", value: report.status },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-md font-bold text-gray-800">{item.label}</p>
                                <p className="text-base text-gray-800 mt-1">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Weather Section */}
                    <div className="mt-20">
                        <p className="text-sm font-bold text-gray-700 mb-2 mt-20">Weather</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">A.M.</p>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    {report.weather_am || "n/a"}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">P.M.</p>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    {report.weather_pm || "n/a"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manpower & Equipment */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                        {/* Manpower */}
                        <div>
                            <p className="text-sm font-bold text-gray-700 mb-2">Manpower</p>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                {report.manpower?.length ? (
                                    <ul className="list-disc list-inside text-sm ml-2">
                                        {report.manpower.map((m, i) => (
                                            <li key={i}>{m.role} — {m.count}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No manpower data.</p>
                                )}
                            </div>
                        </div>

                        {/* Equipment */}
                        <div>
                            <p className="text-sm font-bold text-gray-700 mb-2">Equipment</p>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                {report.selected_equipment?.length ? (
                                    <ul className="list-disc list-inside text-sm ml-2">
                                        {report.selected_equipment.map((e, i) => (
                                            <li key={i}>{e.name} — {e.quantity}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No equipment data.</p>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="mt-20">


                        {/* Full-width sections */}
                        {[
                            { label: "Activities", value: report.activities },
                            { label: "Notes", value: report.notes },
                            { label: "Visitors", value: report.visitors },
                        ].map((section, i) => (
                            <div key={i}>
                                <p className="text-sm font-bold text-gray-700 mt-5">{section.label}</p>
                                <div className="bg-gray-50 p-3 rounded border mt-2 border-gray-200 whitespace-pre-wrap">
                                    {section.value || "n/a"}
                                </div>
                            </div>
                        ))}


                    </div>

                    {/* Prepared By */}
                    <div>
                        <p className="text-sm font-bold text-gray-700 mb-1">Prepared By</p>
                        <p>{report.full_name}</p>
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

export default ViewSiteReportModalUI;
