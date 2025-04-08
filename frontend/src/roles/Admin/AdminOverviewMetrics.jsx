import React from "react";
import { BoxIconLine, GroupIcon, ArrowUpIcon, ArrowDownIcon } from "../../icons"; // Update as needed
import Badge from "../../components/ui/badge/Badge";
const AdminOverviewMetrics = () => {
    const metrics = [
        {
            title: "Active Projects",
            value: "24",
            icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
            trend: "up",
            change: "12.5%",
        },
        {
            title: "Ongoing Tasks",
            value: "142",
            icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
            trend: "down",
            change: "5.1%",
        },
        {
            title: "Pending Workers",
            value: "8",
            icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
            trend: "up",
            change: "3.9%",
        },
        {
            title: "Completed Milestones",
            value: "76",
            icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
            trend: "up",
            change: "7.4%",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
            {metrics.map((item, idx) => (
                <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
                >
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                        {item.icon}
                    </div>
                    <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {item.title}
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                                {item.value}
                            </h4>
                        </div>
                        <Badge color={item.trend === "up" ? "success" : "error"}>
                            {item.trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                            {item.change}
                        </Badge>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminOverviewMetrics;
