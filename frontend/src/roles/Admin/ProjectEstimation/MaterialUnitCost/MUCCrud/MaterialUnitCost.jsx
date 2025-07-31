import React, { useState } from "react";
import MaterialListTable from "../BOMMaterials/MaterialListsTable";
import RebarMaterialTable from "../BOMRebarMaterials/MaterialRebarTable";
import { useParams } from "react-router-dom";
import AddModalMUC from "../MUCCrud/AddModalMUC"; // ← make sure this is correct

const MaterialUnitCost = () => {
  const { proposal_id, project_id } = useParams();
  const [activeTab, setActiveTab] = useState("material");
  const [showAddModal, setShowAddModal] = useState(false);

  // Optional: Refresh functions after modal close
  const fetchMaterialCosts = () => {
    // your refresh logic
  };

  const fetchParentTotals = () => {
    // your refresh logic
  };

  return (
    <div>
      <div className="flex justify-between items-center mt-6 mb-6">
        <p className="text-2xl font-semibold">Material Take-Off</p>
        <div className="flex items-center space-x-2">
          {(activeTab === "material" || activeTab === "rebar") && (
            <button
              onClick={() => setShowAddModal(true)}
              className=" text-white text-gray-900 px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-900"
            >
              Add Items
            </button>
          )}
        </div>
      </div>

      <hr />

      <div className="mb-10 flex gap-4 mt-10">
        <button
          onClick={() => setActiveTab("material")}
          className={`px-4 py-2 rounded ${activeTab === "material"
            ? "bg-gray-600 text-white"
            : "bg-white border border-gray-400 text"
            }`}
        >
          General List
        </button>
        <button
          onClick={() => setActiveTab("rebar")}
          className={`px-4 py-2 rounded ${activeTab === "rebar"
            ? "bg-gray-600 text-white"
            : "bg-white border border-gray-400 text"
            }`}
        >
          Rebar List
        </button>
      </div>

      <div>
        {activeTab === "material" && <MaterialListTable proposal_id={proposal_id} />}
        {activeTab === "rebar" && <RebarMaterialTable proposal_id={proposal_id} />}
      </div>


      {/* Modals */}
      {showAddModal && (
        <AddModalMUC
          proposal_id={proposal_id}
          onClose={() => {
            setShowAddModal(false);
            fetchMaterialCosts();
            fetchParentTotals();
          }}
        />
      )}
    </div>
  );
};

export default MaterialUnitCost;
