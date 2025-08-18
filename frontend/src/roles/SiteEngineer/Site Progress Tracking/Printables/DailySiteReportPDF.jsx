import React, { forwardRef } from "react";

const DailySiteReportPDF = forwardRef(({ reports }, ref) => {
    return (
        <div ref={ref} className="p-4 bg-white">
            <div className="mb-6">
                <div className="flex items-center">
                    <img
                        src="/images/assets/drl_construction_address.png"
                        alt="Logo"
                        className="h-[80px] project-image"
                    />
                </div>

                <h1 className="text-center text-xl font-bold mt-6 mb-10">
                    Daily Site Report
                </h1>
            </div>

            {reports.length === 0 ? (
                <p className="text-gray-600">No reports selected.</p>
            ) : (
                reports.map((report) => (
                    <div key={report.report_id} className="mb-6 pb-4">
                        <div className="space-y-1">
                            <div className="flex">
                                <strong className="w-40">Project:</strong>
                                <span>{report.project_name}</span>
                            </div>
                            <div className="flex">
                                <strong className="w-40">Location:</strong>
                                <span>{report.location}</span>
                            </div>
                            <div className="flex">
                                <strong className="w-40">Subject:</strong>
                                <span>Daily Work Activities Report</span>
                            </div>
                            <div className="flex">
                                <strong className="w-40">Date:</strong>
                                <span>
                                    {new Date(report.report_date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <div className="flex">
                                <strong className="w-40">Owner:</strong>
                                <span>{report.client_name}</span>
                            </div>
                        </div>

                        <div className="mt-16">
                            <p>
                                <strong>1.0</strong> Weather
                            </p>
                            <div className="ml-10 space-y-1">
                                <div className="flex items-start">
                                    <strong className="w-15">AM</strong>
                                    <span className="flex-shrink-0">—</span>
                                    <span className="ml-2">{report.weather_am}</span>
                                </div>
                                <div className="flex items-start">
                                    <strong className="w-15">PM</strong>
                                    <span className="flex-shrink-0">—</span>
                                    <span className="ml-2">{report.weather_pm}</span>
                                </div>
                            </div>
                        </div>

                        {report.manpower && report.manpower.length > 0 && (
                            <div className="mt-8">
                                <p>
                                    <strong>2.0 </strong> Manpower
                                </p>
                                <div className="ml-10 space-y-1">
                                    {report.manpower.map((worker, idx) => (
                                        <div className="flex items-start" key={idx}>
                                            <strong className="w-15">{worker.count}</strong>
                                            <span className="flex-shrink-0">—</span>
                                            <span className="ml-2">{worker.role}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {report.selected_equipment && report.selected_equipment.length > 0 && (
                            <div className="mt-8">
                                <p>
                                    <strong>3.0 </strong> Equipment
                                </p>
                                <div className="ml-10 space-y-1">
                                    {report.selected_equipment.map((item, idx) => (
                                        <div className="flex items-start" key={idx}>
                                            <strong className="w-15">{item.quantity}</strong>
                                            <span className="flex-shrink-0">—</span>
                                            <span className="ml-2">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activities */}
                        <div className="mt-8">
                            <p>
                                <strong>4.0 </strong> Activities
                            </p>
                            <div className="ml-10 flex items-start">
                                <strong className="w-15">&nbsp;</strong>
                                <span className="flex-shrink-0">—</span>
                                <span className="ml-2">{report.activities}</span>
                            </div>
                        </div>

                        {/* Visitors */}
                        <div className="mt-8">
                            <p>
                                <strong>5.0 </strong> Visitors
                            </p>
                            <div className="ml-10 flex items-start">
                                <strong className="w-15">&nbsp;</strong>
                                <span className="flex-shrink-0">—</span>
                                <span className="ml-2">{report.visitors}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mt-8">
                            <p>
                                <strong>6.0 </strong> Notes
                            </p>
                            <div className="ml-10 flex items-start">
                                <strong className="w-15">&nbsp;</strong>
                                <span className="flex-shrink-0">—</span>
                                <span className="ml-2">{report.notes}</span>
                            </div>
                        </div>


                        <div className="flex mt-20 no-break items-start gap-2">
                            <strong className="w-40 shrink-0">Prepared By:</strong>
                            <span className="whitespace-nowrap">{report.full_name}</span>
                        </div>




                    </div>
                ))
            )}
        </div>
    );
});

export default DailySiteReportPDF;
