import React, { useState, useEffect, useRef } from "react";
import axios from "axios";


const SowTypes = () => {
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // State for Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [deletedTypeName, setDeletedTypeName] = useState(null);


  // State for Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDescription, setNewTypeDescription] = useState("");
  const [newSequenceOrder, setNewSequenceOrder] = useState("");
  const [showAddSuccessModal, setShowAddSuccessModal] = useState(false);
  const [addedTypeName, setAddedTypeName] = useState(null);


  // State for Edit Modal (integrated)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editWorkTypeData, setEditWorkTypeData] = useState(null); // Data for the work type being edited
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [editedTypeName, setEditedTypeName] = useState(null);


  // Internal form data for the integrated Edit Modal
  const [editFormData, setEditFormData] = useState({
    work_type_id: "",
    type_name: "",
    type_description: "",
    sequence_order: "",
  });


  const modalRef = useRef(null); // Ref for the edit modal content


  const API_URL = "http://localhost:5000/api/work-types";


  // Function to fetch data, made reusable
  const fetchData = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const response = await axios.get(API_URL);
      setWorkTypes(response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch work types.");
    } finally {
      setLoading(false); // Set loading to false after fetch attempt
    }
  };


  // Initial data fetch on component mount
  useEffect(() => {
    fetchData();
  }, []);


  // Effect to update editFormData when editWorkTypeData changes (i.e., when edit modal opens/work type selected)
  useEffect(() => {
    if (editWorkTypeData) {
      setEditFormData({
        work_type_id: editWorkTypeData.work_type_id || "",
        type_name: editWorkTypeData.type_name || "",
        type_description: editWorkTypeData.type_description || "",
        sequence_order: editWorkTypeData.sequence_order || "",
      });
    } else {
      // Reset form data when modal closes or no work type is selected
      setEditFormData({
        work_type_id: "",
        type_name: "",
        type_description: "",
        sequence_order: "",
      });
    }
  }, [editWorkTypeData, showEditModal]); // Depend on editWorkTypeData and showEditModal


  // --- Delete Operations ---
  const handleDeleteClick = (type) => {
    setSelectedType(type);
    setShowDeleteModal(true);
  };


  const confirmDelete = async () => {
    try {
      const deleteUrl = `${API_URL}/${selectedType.work_type_id}`;
      await axios.delete(deleteUrl);


      setDeletedTypeName(selectedType.type_name);
      fetchData(); // Re-fetch data to ensure consistency
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Delete failed:", err);
      // Using a custom modal for alerts instead of browser's alert()
      // For simplicity, I'm using an alert here, but for a real app,
      // you'd use a state-driven custom modal like the success/delete modals.
      alert("Failed to delete work type. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setSelectedType(null);
    }
  };


  // --- Add Operations ---
  const handleAddNewItem = () => {
    setNewTypeName("");
    setNewTypeDescription("");
    setNewSequenceOrder("");
    setShowAddModal(true);
  };


  const handleAddSubmit = async () => {
    if (!newTypeName.trim()) {
      alert("Type Name is required");
      return;
    }


    if (Number(newSequenceOrder) < 0) {
      alert("Sequence Order cannot be negative.");
      return;
    }


    try {
      const payload = {
        type_name: newTypeName,
        type_description: newTypeDescription,
        sequence_order: Number(newSequenceOrder) || 0,
      };


      await axios.post(API_URL, payload);
      await fetchData();


      setAddedTypeName(newTypeName);
      setShowAddSuccessModal(true);


      setNewTypeName("");
      setNewTypeDescription("");
      setNewSequenceOrder("");
      setShowAddModal(false);
    } catch (err) {
      console.error("Add new type failed:", err);
      alert("Failed to add new work type. Please try again.");
    }
  };


  const handleAddCancel = () => {
    setNewTypeName("");
    setNewTypeDescription("");
    setNewSequenceOrder("");
    setShowAddModal(false);
  };


  // --- Edit Operations (for the integrated modal) ---
  const handleEditClick = (type) => {
    setEditWorkTypeData(type); // Set the full work type object to populate the form
    setShowEditModal(true);
  };


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission


    if (!editFormData.type_name.trim()) {
      alert("Type Name is required");
      return;
    }


    if (Number(editFormData.sequence_order) < 0) {
      alert("Sequence Order cannot be negative.");
      return;
    }


    try {
      const payload = {
        type_name: editFormData.type_name,
        type_description: editFormData.type_description,
        sequence_order: Number(editFormData.sequence_order) || 0,
      };


      await axios.put(`${API_URL}/${editFormData.work_type_id}`, payload);
      setEditedTypeName(payload.type_name);
      setShowEditSuccessModal(true);
      fetchData(); // Re-fetch data to show updated list
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update work type. Please try again.");
    } finally {
      setShowEditModal(false);
      setEditWorkTypeData(null); // Clear the selected work type data
    }
  };


  const handleEditClose = () => {
    setShowEditModal(false);
    setEditWorkTypeData(null); // Clear the selected work type data on close
  };


  return (
    <div className="p-4 space-y-6 bg-white shadow rounded relative">
      <div className="bg-[#d86686] text-white flex justify-between items-center p-4 rounded">
        <h1 className="text-lg font-semibold">Manage Work Types</h1>
        <button
          className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
          onClick={handleAddNewItem}
        >
          Add New Item
        </button>
      </div>


      <div className="flex justify-between items-center">
        <label className="text-sm">
          Show
          <select className="mx-2 border p-1 rounded">
            <option value={1}>1</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          entries
        </label>


        <div className="flex items-center gap-2">
          <label className="block font-medium text-gray-700">Search:</label>
          <input type="text" className="border p-2 rounded w-64" />
        </div>
      </div>


      <table className="table-auto w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Type Name</th>
            <th className="border px-4 py-2 text-left">Type Description</th>
            <th className="border px-4 py-2 text-left">Sequence Order</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="text-center p-4">
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="4" className="text-center text-red-500 p-4">
                {error}
              </td>
            </tr>
          ) : workTypes.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-4">
                No work types found.
              </td>
            </tr>
          ) : (
            workTypes.map((type) => (
              <tr key={type.work_type_id}>
                <td className="border px-4 py-2">{type.type_name}</td>
                <td className="border px-4 py-2">{type.type_description}</td>
                <td className="border px-4 py-2">{type.sequence_order}</td>
                <td className="border px-4 py-2">
                  <div className="flex gap-x-2">
                    <button
                      className="bg-yellow-500 text-white px-6 h-10 rounded hover:bg-yellow-700"
                      onClick={() => handleEditClick(type)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-6 h-10 rounded hover:bg-red-700"
                      onClick={() => handleDeleteClick(type)}
                    >
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
        <p>
          Showing {workTypes.length > 0 ? `1 to ${workTypes.length}` : 0} of{" "}
          {workTypes.length} entries
        </p>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button className="px-3 py-1 border rounded disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 border rounded disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-sm text-gray-700">
              Are you sure you want to delete the work type{" "}
              <strong>{selectedType?.type_name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4 text-green-600">Success</h2>
            <p className="mb-6 text-gray-700">
              Work type <strong>{deletedTypeName}</strong> successfully deleted.
            </p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* Add Success Modal */}
      {showAddSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4 text-green-600">Success</h2>
            <p className="mb-6 text-gray-700">
              Work type <strong>{addedTypeName}</strong> successfully added.
            </p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setShowAddSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* Edit Success Modal */}
      {showEditSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4 text-green-600">Success</h2>
            <p className="mb-6 text-gray-700">
              Work type <strong>{editedTypeName}</strong> successfully updated.
            </p>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setShowEditSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Work Type</h2>


            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="typeName">
                Type Name
              </label>
              <input
                id="typeName"
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Enter type name"
              />
            </div>


            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="typeDescription">
                Type Description
              </label>
              <textarea
                id="typeDescription"
                className="w-full border rounded px-3 py-2"
                value={newTypeDescription}
                onChange={(e) => setNewTypeDescription(e.target.value)}
                placeholder="Enter type description"
              />
            </div>


            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="sequenceOrder">
                Sequence Order
              </label>
              <input
                id="sequenceOrder"
                type="number"
                min="0"
                className="w-full border rounded px-3 py-2"
                value={newSequenceOrder}
                onChange={(e) => setNewSequenceOrder(e.target.value)}
                placeholder="Enter sequence order"
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  const paste = e.clipboardData.getData("text");
                  if (paste.includes("-")) {
                    e.preventDefault();
                  }
                }}
              />
            </div>


            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={handleAddCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleAddSubmit}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Integrated Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[99999]">
          <div
            className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
            onClick={handleEditClose}
          ></div>
          <div
            ref={modalRef}
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleEditClose}
              className="absolute right-3 top-3 z-10 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
              aria-label="Close modal"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                  fill="currentColor"
                />
              </svg>
            </button>


            {/* Modal content: your form */}
            <>
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                Edit Work Type
              </h3>


              <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                {/* Type Name */}
                <div>
                  <label
                    htmlFor="type_name"
                    className="block font-medium text-gray-700 dark:text-gray-300"
                  >
                    Type Name
                  </label>
                  <input
                    type="text"
                    id="type_name"
                    name="type_name"
                    value={editFormData.type_name}
                    onChange={handleEditChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                  />
                </div>


                {/* Type Description */}
                <div>
                  <label
                    htmlFor="type_description"
                    className="block font-medium text-gray-700 dark:text-gray-300"
                  >
                    Type Description
                  </label>
                  <input
                    type="text"
                    id="type_description"
                    name="type_description"
                    value={editFormData.type_description}
                    onChange={handleEditChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                  />
                </div>


                {/* Sequence Order */}
                <div>
                  <label
                    htmlFor="sequence_order"
                    className="block font-medium text-gray-700 dark:text-gray-300"
                  >
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    id="sequence_order"
                    name="sequence_order"
                    value={editFormData.sequence_order}
                    onChange={handleEditChange}
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 sm:text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData.getData("text");
                      if (paste.includes("-")) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>


                {/* Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleEditClose}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Update Work Type
                  </button>
                </div>
              </form>
            </>
          </div>
        </div>
      )}
    </div>
  );
};


export default SowTypes;



