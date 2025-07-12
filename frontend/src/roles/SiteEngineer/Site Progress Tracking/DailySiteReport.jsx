import React from "react";

const SiteEngineerDashboard = () => {
    return (
        <div className="p-8 bg-white shadow rounded max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Site Engineer Daily Report</h1>
            <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weather Condition</label>
                        <input
                            type="text"
                            placeholder="e.g., Sunny, Rainy"
                            className="w-full border border-gray-300 rounded px-4 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Workers</label>
                        <input
                            type="number"
                            className="w-full border border-gray-300 rounded px-4 py-2"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Activities</label>
                    <textarea
                        rows="5"
                        className="w-full border border-gray-300 rounded px-4 py-2 resize-none"
                        placeholder="Describe site activities for the day..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issues / Concerns</label>
                    <textarea
                        rows="4"
                        className="w-full border border-gray-300 rounded px-4 py-2 resize-none"
                        placeholder="Mention any safety or work-related concerns..."
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
                    >
                        Submit Report
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteEngineerDashboard;
