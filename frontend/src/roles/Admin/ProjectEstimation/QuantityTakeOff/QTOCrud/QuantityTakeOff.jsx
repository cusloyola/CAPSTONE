import React, { useState } from "react";
import { useParams } from "react-router-dom";
import GeneralDimension from "./GeneralDimension";
import RebarDimension from "../RebarCrud/RebarDimension";
import { Button } from "primereact/button";
import AddQtoModal from "../AddQtoModal";

const QuantityTakeOff = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [uniqueCategories, setAvailableCategories] = useState([]);

  const { proposal_id, project_id } = useParams();

  return (
    <div>
      <div className="flex justify-between items-center mt-6 mb-6">
        <p className="text-2xl font-semibold">Quantity Take-Off</p>
        <Button
          label="Add Volume"
          onClick={() => setShowAddModal(true)}
          className="text-white px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-900"
        />
      </div>

      <hr className="mb-4" />

      <div className="flex flex-wrap items-center gap-4 mb-7 mt-12">

        {/* Left: Dimension Tab Dropdown */}
        <div>
          <select
            className="border p-2 rounded w-48"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="general">General Dimension</option>
            <option value="rebar">Rebar Dimension</option>
          </select>
        </div>

        
         {/* Right: Filter Category */}
        <div>
          <select
            className={`border p-2 rounded w-48 ${
              activeTab !== "general" ? "opacity-50 cursor-not-allowed" : ""
            }`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={activeTab !== "general"}
          >
            {activeTab === "general" ? (
              <>
                <option value="">All Items</option>
                {uniqueCategories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </>
            ) : (
              <option>Filter unavailable</option>
            )}
          </select>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "general" && (
          <GeneralDimension
            proposal_id={proposal_id}
            project_id={project_id}
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            categoryFilter={categoryFilter}
            setAvailableCategories={setAvailableCategories}
          />
        )}
        {activeTab === "rebar" && (
          <RebarDimension
            proposal_id={proposal_id}
            project_id={project_id}
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            categoryFilter={categoryFilter}
          />
        )}
      </div>

      {/* Add Modal */}
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
