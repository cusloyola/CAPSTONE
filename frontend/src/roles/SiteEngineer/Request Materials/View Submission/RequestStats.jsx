import React from "react";
// Import your SVG icons or use a library like react-icons
import { LuClipboardList, LuClock, LuFileCheck, LuFileX } from "react-icons/lu";

const RequestStats = ({ requests }) => {
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === "pending").length;
    const approvedRequests = requests.filter(r => r.status === "approved").length;
    const rejectedRequests = requests.filter(r => r.status === "rejected").length;

    const stats = [
        { name: "Total Requests", value: totalRequests, color: "from-blue-500 to-blue-800", icon: <LuClipboardList className="w-6 h-6 text-black" /> },
        { name: "Pending Requests", value: pendingRequests, color: "from-yellow-500 to-yellow-600", icon: <LuClock className="w-6 h-6 text-black" /> },
        { name: "Approved Requests", value: approvedRequests, color: "from-green-500 to-green-600", icon: <LuFileCheck className="w-6 h-6 text-black" /> },
        { name: "Rejected Requests", value: rejectedRequests, color: "from-red-500 to-red-800", icon: <LuFileX className="w-6 h-6 text-black" /> },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
            {stats.map((stat, index) => (
                <div key={index} className={`bg-gradient-to-l ${stat.color} border border-gray-200 p-5 rounded-2xl shadow-md space-y-2`}>
                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl">
                        {stat.icon}
                    </div>
                    <p className="text-md text-white font-semibold">{stat.name}</p>
                    <h2 className="text-4xl font-bold text-white">{stat.value}</h2>
                </div>
            ))}
        </div>
    );
};

export default RequestStats;