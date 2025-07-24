import React, { useState } from "react";
import MaterialListTable from "../BOMMaterials/MaterialListsTable";
import RebarMaterialTable from "../BOMRebarMaterials/MaterialRebarTable";
import { useParams } from "react-router-dom";

const MaterialUnitCost = () => {
  const { proposal_id } = useParams(); // Get proposal_id from URL
  const [activeTab, setActiveTab] = useState("material");

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("material")}
          className={`px-4 py-2 rounded ${
            activeTab === "material"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Material List Table
        </button>
        <button
          onClick={() => setActiveTab("rebar")}
          className={`px-4 py-2 rounded ${
            activeTab === "rebar" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Rebar Material Table
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "material" && <MaterialListTable proposal_id={proposal_id} />}
      {activeTab === "rebar" && <RebarMaterialTable proposal_id={proposal_id} />}
    </div>
  );
};

export default MaterialUnitCost;
