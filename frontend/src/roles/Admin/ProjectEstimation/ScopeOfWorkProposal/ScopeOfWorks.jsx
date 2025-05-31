import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AddSowModal from "./AddSowModal";

const SOW_API_URL = "http://localhost:5000/api/sowproposal/sow-work-items";

const ScopeOfWorks = () => {
  const { project_id } = useParams();
  const [project, setProject] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
const [sowWorkItems, setSowWorkItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // Fetch SOW items once on component mount
 useEffect(() => {
  fetchSowWorkItems();
}, []);
useEffect(() => {
  if (showAddModal) {
    fetchSowWorkItems();
  }
}, [showAddModal]);


  
const fetchSowWorkItems = () => {
  fetch(SOW_API_URL)
    .then((res) => res.json())
    .then((data) => {
      console.log("API response:", data);
      if (data && Array.isArray(data.data)) {
        setSowWorkItems(data.data);
      } else if (Array.isArray(data)) {
        // If data is directly an array
        setSowWorkItems(data);
      } else {
        console.warn("Unexpected API response format:", data);
        setSowWorkItems([]);
      }
    })
    .catch((err) => console.error("Failed to fetch SOW items:", err));
};


  const handleAddItem = (item) => {
    // Avoid duplicates
    if (!selectedItems.some(i => i.work_item_id === item.work_item_id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
    setShowAddModal(false);
  };

  return (
    <div className="p-4 space-y-6 bg-white shadow rounded">
      <div className="bg-[#7360df] text-white flex justify-between items-center p-4 rounded">
        <h1 className="text-lg font-semibold">List of all Scope of Works (SOW)</h1>
        <div className="flex items-center space-x-2">
          <Link
            to={`/AllPendingProjects/${project_id}/estimation/scope-of-work/tables`}
            className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
          >
            Scope of Works Table
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
          >
            Add Scope of Work
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <label className="block font-medium text-gray-700">Titles:</label>
          <select className="border p-2 rounded w-48">
            <option value="">All Titles</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="block font-medium text-gray-700">Work Types</label>
          <select>
            <option value="">All Work Types</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <label className="text-sm">
            Show
            <select className="mx-2 border p-1 rounded" defaultValue={1}>
              <option value={1}>1</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            entries
          </label>
        </div>
        <div className="flex items-center gap-2">
          <label className="block font-medium text-gray-700">Search:</label>
          <input
            id="searchInput"
            type="text"
            className="border p-2 rounded w-64"
            // You can add search logic later
          />
        </div>
      </div>

      <table className="table-auto w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Category (Work Type)</th>
            <th className="border px-4 py-2 text-left">Work Item (Specific Task)</th>
            <th className="border px-4 py-2 text-left">Unit of Measure</th>
            <th className="border px-4 py-2 text-left">Sequence Order</th>
            <th className="border px-4 py-2 text-left">Status</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sowWorkItems.length === 0 ? (
            <tr>
              <td colSpan={6} className="border px-4 py-2 text-center">
                No work items found.
              </td>
            </tr>
          ) : (
            sowWorkItems.map((item) => (
              <tr key={item.work_item_id}>
                {/* Use item.type_name or item.category depending on API response */}
                <td className="border px-4 py-2">{item.category || item.type_name}</td>
                <td className="border px-4 py-2">{item.item_title}</td>
                  <td className="border px-4 py-2">{item.unit_of_measure}</td>
                <td className="border px-4 py-2">{item.sequence_order}</td>
                <td className="border px-4 py-2">Active</td>
                <td className="border px-4 py-2">
                  <div className="flex gap-x-2">
                    <button className="bg-yellow-500 text-white px-6 h-10 rounded hover:bg-yellow-700">
                      Edit
                    </button>
                    <button className="bg-red-600 text-white px-6 h-10 rounded hover:bg-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
        <p>Showing {selectedItems.length} entries</p>

        <div className="flex gap-2 mt-2 sm:mt-0">
          <button className="px-3 py-1 border rounded disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 border rounded disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddSowModal
          sowWorkItems={sowWorkItems}
          onClose={() => setShowAddModal(false)}
          onSelectItem={handleAddItem}
        />
      )}
    </div>
  );
};

export default ScopeOfWorks;
