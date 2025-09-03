import React, { useEffect, useState } from "react";
import SafetyEngineerMetrics from "./Safety Dashboard/SafetyEngineerMetrics";

const SafetyEngineerDashboard = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [userName, setUserName] = useState("SAFETY ENGINEER");

    useEffect(() => {
        const interval = setInterval(() => setDateTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Get user from localStorage (same as UserDropdown.jsx)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUserName(parsedUser.name || "SAFETY ENGINEER");
            } catch {
                setUserName("SAFETY ENGINEER");
            }
        }
    }, []);

    // Format: August 8, 2024
    const formattedDate = dateTime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div>
            <div className="flex flex-col mb-6">
                <h1 className="text-3xl font-bold mb-6">Safety Engineer Dashboard</h1>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-6">
                        <span
                            className="inline-block bg-blue-100 text-blue-800 text-xl font-bold px-4 py-4 rounded-2xl shadow-sm border border-blue-200"
                            style={{ minWidth: "370px", textTransform: "uppercase", letterSpacing: "1px" }}
                        >
                           Welcome, SAFETY ENGR. {userName && userName.toUpperCase()}
                        </span>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <span className="text-2xl font-semibold">
                            {formattedDate} {dateTime.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="mt-8">
                <SafetyEngineerMetrics />
            </div>
        </div>
    );
};

export default SafetyEngineerDashboard;