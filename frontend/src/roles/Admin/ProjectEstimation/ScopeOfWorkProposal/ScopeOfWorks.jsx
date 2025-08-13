import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AddSowModal from "./AddSowModal";
import EditSowModal from "./EditSowModal";
import DeleteSowModal from "./DeleteSowModal";

import { FaEllipsisV } from "react-icons/fa";


const SOW_API_URL_ALL = "http://localhost:5000/api/sowproposal/sow-work-items/all-work-items";
const SOW_API_URL = "http://localhost:5000/api/sowproposal/sow-list";

const ScopeOfWorks = () => {
  const { project_id, proposal_id } = useParams();
  const [openMenuId, setOpenMenuId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [sowWorkItems, setSowWorkItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);



  const [editItem, setEditItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);


  const [sowItems, setSowItems] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueUnits, setUniqueUnits] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSowWorkItems = () => {
    if (!proposal_id) return;
    fetch(`${SOW_API_URL}/${proposal_id}`)
      .then(res => res.json())
      .then(data => setSowWorkItems(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching SOW items:", err));
  };

  useEffect(() => {
    fetchSowWorkItems();
  }, [proposal_id]);

  useEffect(() => {
    const fetchSowItems = async () => {
      try {
        const res = await fetch(`${SOW_API_URL_ALL}?proposal_id=${proposal_id}`);
        const data = await res.json();
        setSowItems(data);
        setUniqueCategories([...new Set(data.map(item => item.category))]);
        setUniqueUnits([...new Set(data.map(item => item.unitCode))]);
      } catch (err) {
        console.error("Error fetching SOW items:", err);
      }
    };

    fetchSowItems();
  }, [proposal_id]);

  useEffect(() => {
    if (showAddModal) fetchSowWorkItems();
  }, [showAddModal]);

  const handleClose = () => setShowAddModal(false);

  const handleSelectItem = (newItems) => {
    setSowWorkItems((prev) => {
      const existingIds = new Set(prev.map(i => i.work_item_id));
      const filteredNew = newItems.filter(i => !existingIds.has(i.work_item_id));
      return [...prev, ...filteredNew];
    });
    setShowAddModal(false);
  };


  const handleOpenEdit = (item) => {

    setEditItem(item);
    setShowEditModal(true);
  };



  const handleUpdateItem = async ({ work_item_id, new_work_item_id }) => {
    const payload = {
      proposal_id: proposal_id,
      work_item_id: work_item_id,
      new_work_item_id: new_work_item_id,
    };


    try {
      const res = await fetch(`http://localhost:5000/api/sowproposal/sow-work-items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      const data = await res.json();
      console.log("Response from server:", data);


      if (res.ok) {
        alert("Updated successfully");
        fetchSowWorkItems();
      } else {
        alert(data.message || "Failed to update");
      }
    } catch (err) {
      console.error("Error updating work item:", err);
      alert("Error updating work item");
    }
  };


  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setDeleteModalOpen(false);
  };

const handleDelete = async () => {
  if (!itemToDelete) return;

  try {
    const res = await fetch(`http://localhost:5000/api/sowproposal/sow-work-items/${itemToDelete.work_item_id}`, {
      method: "DELETE"
    });
    const data = await res.json();

    if (res.ok) {
      alert("Deleted successfully");
      fetchSowWorkItems(); // refresh table
      closeDeleteModal();
    } else {
      alert(data.message || "Failed to delete");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting item");
  }
};



  // Filtered + Search
  const filteredItems = sowWorkItems.filter(item => {
    const matchesSearch = item.item_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesUnit = unitFilter ? item.unitCode === unitFilter : true;
    return matchesSearch && matchesCategory && matchesUnit;
  });


  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / entriesPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, unitFilter, entriesPerPage]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-6 mb-6">
        <p className="text-2xl font-semibold">Scope of Works</p>
        <div className="flex items-center space-x-2">
          <Link
            to={`/AllPendingProjects/${project_id}/estimation/scope-of-work/tables`}
            className=" text-white text-gray-900 px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-900"
          >
            Table List
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className=" text-white text-gray-900 px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-900"
          >
            Add List
          </button>
        </div>
      </div>

      <hr />
      <div className="flex flex-wrap gap-4 mt-10">
        <div className="flex flex-col gap-2  mt-6">
          <select
            className="border p-2 rounded w-48"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <select
            className="border p-2 rounded w-48"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
          >
            <option value="">All Units</option>
            {uniqueUnits.map((unit, index) => (
              <option key={index} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 mb-6">
        <div>
          <label className="text-sm">
            Show
            <select
              className="mx-2 border p-1 rounded w-14 mt-2  "
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            entries
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search Work List..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-64"
          />
        </div>
      </div>

      <table className="table-auto w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100 ">
          <tr className="">
            <th className="border px-4 py-2 text-center">Category</th>
            <th className="border px-4 py-2 text-center">Work Item</th>
            <th className="border px-4 py-2 text-center">Unit</th>
            <th className="border px-4 py-2 text-center">Sequence</th>

            <th className="border px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">No work items found.</td>
            </tr>
          ) : (
            paginatedItems.map((item) => (
              <tr key={item.work_item_id}>
                <td className="border px-4 py-2">{item.category}</td>
                <td className="border px-4 py-2">{item.item_title}</td>
                <td className="border px-4 py-2">{item.unitCode}</td>
                <td className="border px-4 py-2">{item.sequence_order}</td>

                <td className="border px-4 py-2">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() =>
                        setOpenMenuId((prevId) =>
                          prevId === item.work_item_id ? null : item.work_item_id
                        )
                      }
                      className="p-2 hover:bg-gray-200 rounded-full ml-20"
                    >
                      <FaEllipsisV className="text-gray-600 item-center " />
                    </button>

                    {openMenuId === item.work_item_id && (
                      <div className="absolute right-0 z-10 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                          onClick={() => {
                            setOpenMenuId(null);
                            handleOpenEdit(item); // this sets the editItem and opens the modal
                          }}

                        >
                          Edit
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => openDeleteModal(item)}
                        >
                          Delete
                        </button>

                      </div>
                    )}
                  </div>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
        <p>
          Showing {filteredItems.length === 0 ? 0 : ((currentPage - 1) * entriesPerPage) + 1}
          {" to "}
          {Math.min(currentPage * entriesPerPage, filteredItems.length)} of {filteredItems.length} entries
        </p>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {showAddModal && (
        <AddSowModal
          proposal_id={proposal_id}
          onClose={handleClose}
          onSelectItem={handleSelectItem}
          existingItemIds={new Set(sowWorkItems.map(item => item.work_item_id))}
        />
      )}

      {showEditModal && (
        <EditSowModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          item={editItem}
          onUpdate={handleUpdateItem} // This is the correct way to pass the function
          sowItems={sowItems}
          proposals={[{ proposal_id, proposal_name: `Proposal ${proposal_id}` }]}
          existingItemIds={new Set(sowWorkItems.map(i => i.work_item_id))} // items already added

        />
      )}

      <DeleteSowModal
  isOpen={deleteModalOpen}
  onClose={closeDeleteModal}
  onDelete={handleDelete}
  itemTitle={itemToDelete?.item_title}
/>


    </div>
  );
};

export default ScopeOfWorks;
