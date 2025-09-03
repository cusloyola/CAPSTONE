import React, { useEffect, useState } from "react";
import SiteEngineerMetrics from "./Metrics";
import ProgressLineGraph from "../../Admin/Charts/ProgressLineGraph";

const SiteEngineerDashboard = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [userName, setUserName] = useState("SITE ENGINEER");

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
                setUserName(parsedUser.name || "SITE ENGINEER");
            } catch {
                setUserName("SITE ENGINEER");
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
                <h4 className="text-2xl font-bold mb-12">Site Engineer Dashboard</h4>
{/* 
                <div className=" bottom-4 right-4 z-10 text-right flex flex-row gap-2">
                            <span className="text-md font-semibold text-black">
                                {formattedDate}
                            </span>
                            <span className="text-md font-semibold text-black">
                                {dateTime.toLocaleTimeString()}
                            </span>
                        </div> */}


                {/* Two-side container */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side - Welcome container */}
                    <div
                        className="flex-1 border-r border-gray-300 pr-6 rounded-xl px-6 py-10 flex flex-col items-start relative overflow-hidden min-h-[350px]"
                        style={{
                            backgroundImage: "url('/images/grid-image/image-02.png')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        {/* Blue gradient overlay (solid left → light right) */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-600/80 to-blue-700/70 rounded-xl"></div>

                        {/* Content aligned top-left */}
                        <div className="relative z-10 text-left flex flex-col gap-2">
                            <span
                                className="inline-block text-white text-2xl font-bold drop-shadow-lg"
                                style={{ letterSpacing: "1px" }}
                            >
                                Welcome,
                            </span>
                            <span
                                className="inline-block text-white text-5xl font-bold drop-shadow-lg"
                                style={{ letterSpacing: "1px" }}
                            >
                                {userName}
                            </span>

                        </div>
                        <div className="mt-6 max-w-lg">
                            <p className="text-white text-lg drop-shadow-md leading-relaxed">
                                As a Site Engineer, you play a vital role in turning plans into reality,
                                ensuring every detail on site aligns with precision and quality.
                            </p>
                        </div>
                        
    
                    </div>





                    {/* Right side - Metrics */}
                    <div className="flex-1 pl-6">
                        <SiteEngineerMetrics />
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 mt-12">
                <div className="col-span-2 flex flex-col justify-between mt-12">
                    <ProgressLineGraph />
                </div>
            </div>
        </div>
    );
};

export default SiteEngineerDashboard;