import React, { useState } from "react";
import MaterialListTable from "../BOMMaterials/MaterialListsTable";
import RebarMaterialTable from "../BOMRebarMaterials/MaterialRebarTable";
import { useParams } from "react-router-dom";
import AddModalMUC from "../MUCCrud/AddModalMUC"; // ← make sure this is correct

const MaterialUnitCost = () => {
  const { proposal_id, project_id } = useParams();
  const [activeTab, setActiveTab] = useState("material");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState("All");
  const [parentList, setParentList] = useState([]);

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
      <div className="flex flex-wrap items-center mb-7 mt-12 gap-4">
        <div>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="border p-2 rounded w-48"
          >
            <option value="material">General List</option>
            <option value="rebar">Rebar List</option>
          </select>
        </div>

        <div>
          <select
            className={`border p-2 rounded w-48 ${activeTab !== "material" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            disabled={activeTab !== "material"}
          >
            {activeTab === "material" ? (
              <>
                <option value="All">All</option>
                {parentList.map((parent) => (
                  <option key={parent.work_item_id} value={parent.parent_title}>
                    {parent.parent_title}
                  </option>
                ))}
              </>
            ) : (
              <option>Filter Unavailable</option>
            )}
          </select>
        </div>
      </div>




      <div>
        {activeTab === "material" && (
          <MaterialListTable
            proposal_id={proposal_id}
            selectedParent={selectedParent}
            setParentList={setParentList}

          />
        )}
        {activeTab === "rebar" && (
          <RebarMaterialTable
            proposal_id={proposal_id}
            selectedParent={selectedParent}
          />
        )}
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
