import React from "react";

import AdminInspectionChecklistTable from "./AdminInspectionChecklistTable";

import { FcInspection, FcExport } from "react-icons/fc";
import { FaEyeSlash } from 'react-icons/fa';

const SafetyInspectionChecklist = () => {
    return (
        <div className="p-6 min-h-screen space-y-6">
            <div className="flex items-center gap-2 mb-4">
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
                   Inspection Checklist Reports
                </h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                <div className="bg-[#508afd] border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                    <p className="text-md text-white font-semibold">Reports Submitted</p>
                    <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-bold text-white">32</h2>
                        <FcInspection className="text-3xl" />
                    </div>
                    <p className="text-white text-sm">Daily logs compiled</p>
                </div>

                {/* Unviewed Reports */}
                <div className="bg-blue-300 border border-gray-200 p-5 rounded-2xl shadow space-y-2">
                    <p className="text-md text-white font-semibold">Unviewed Reports</p>
                    <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-bold text-white">32</h2>
                        <FaEyeSlash className="text-3xl text-gray-600" />
                    </div>
                    <p className="text-white text-sm">Up to date</p>
                </div>

                <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow space-y-2 col-span-1 md:col-span-2 lg:col-span-2">
                    <p className="text-sm text-gray-500">Site Activity Completion</p>
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
                        <div
                            className="bg-blue-700 h-full"

                        ></div>
                        <div
                            className="bg-blue-300 h-full"

                        ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 flex justify-between">
                        <span className="text-blue-700">

                            % Viewed
                        </span>
                        <span className="text-blue-400">
                            % Unviewed
                        </span>
                    </div>
                </div>
            </div>



            <AdminInspectionChecklistTable/>



        </div>
    );
};


export default SafetyInspectionChecklist;