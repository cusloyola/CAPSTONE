import React, {useState} from "react";
import GeneralDimension from "./GeneralDimension";
import RebarDimension from "../RebarCrud/RebarDimension";


const QuantityTakeOff = () => {
    
    const [activeTab, setActiveTab] = useState("general");
    
    return(
        <div className="p-4">
            <div className="mb-4 flex gap-4">
                <button
                onClick={() => setActiveTab("general")}
                className={`px-4 py-2 rounded ${activeTab === "general" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                
                >
                    General Dimension
                </button>

                <button
                onClick={() => setActiveTab("rebar")}
                className={`px-4 py-2 rounded ${activeTab === "rebar" ? "bg-blue-600 text-white " : "bg-gray-200"}`}
                
                >
                    Rebar Dimension
                </button>
                </div>

                <div>
                     {activeTab === "general" && <GeneralDimension />}
        {activeTab === "rebar" && <RebarDimension />}

                </div>
  
                   
            </div>

    );
};

export default QuantityTakeOff;