import React, { useState } from "react";
import { useParams } from 'react-router-dom';

import GeneralDimension from "./GeneralDimension";
import RebarDimension from "../RebarCrud/RebarDimension";
import { Button } from "primereact/button"; // adjust if your Button is custom

import AddQtoModal from "../AddQtoModal";


const QuantityTakeOff = () => {
    const [activeTab, setActiveTab] = useState("general");
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const { proposal_id, project_id } = useParams();

    return (
        <div>
            <div className="flex justify-between items-center mt-6 mb-6">
                <p className="text-2xl font-semibold">Quantity Take-Off</p>
                <div className="flex items-center space-x-2">
                    <Button
                        label="Add Volume"
                        onClick={() => setShowAddModal(true)}
                        className=" text-white text-gray-900 px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-900"
                    />
                </div>
            </div>

            <hr />


            <div className="mb-10 flex gap-4 mt-10">
                <button
                    onClick={() => setActiveTab("general")}
                    className={`px-4 py-2 rounded ${activeTab === "general"
                        ? "bg-gray-600 text-white"
                        : "bg-white border border-gray-400 text"
                        }`}
                >
                    General Dimension
                </button>

                <button
                    onClick={() => setActiveTab("rebar")}
                    className={`px-4 py-2 rounded ${activeTab === "rebar"
                        ? "bg-gray-600 text-white"
                        : "bg-white border border-gray-400 text"
                        }`}
                >
                    Rebar Dimension
                </button>
            </div>

            <div>
                {activeTab === "general" && (
                    <GeneralDimension
                        proposal_id={proposal_id}
                        project_id={project_id}
                        showAddModal={showAddModal}
                        setShowAddModal={setShowAddModal}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                    />
                )}
                {activeTab === "rebar" && <RebarDimension />}
            </div>

            {/* ✅ Global Modal Rendering */}
            {showAddModal && (
                <AddQtoModal
                    proposal_id={proposal_id}
                    project_id={project_id}
                    onClose={() => setShowAddModal(false)}
                    onSelectItem={(items) =>
                        setSelectedItems((prev) => [...prev, ...items])
                    }
                />
            )}
        </div>

    );
};

export default QuantityTakeOff;
