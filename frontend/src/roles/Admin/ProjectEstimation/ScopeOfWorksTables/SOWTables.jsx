import React from "react";
import SowTypes from "./sowTypes.jsx";
import SowItems from "./sowItems.jsx";

const SOWTables = () => {
    return (
        <div className="p-4 bg-gray-100 min-h-screen"> 
            <div className="bg-white shadow-md rounded-lg p-6 mb-8"> 
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Scope of Work Categories</h2>
                <SowTypes />
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Detailed Scope of Work Items</h2>
                <SowItems />
            </div>
        </div>
    );
};

export default SOWTables;