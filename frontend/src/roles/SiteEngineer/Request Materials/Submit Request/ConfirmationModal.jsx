import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConfirmationModal = ({
  isModalOpen,
  closeModal,
  handleSubmission,
  selectedProject,
  projects,
  urgency,
  notes,
  selectedMaterials,
  requestError,
}) => {
  if (!isModalOpen) return null;

  // show toast if there's an error
  if (requestError) {
    toast.error(requestError, { position: "top-right" });
  }

  const project = projects.find(
    (p) => p.project_id === Number(selectedProject)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Confirm Request</h3>

        <p>
          <strong>Project:</strong> {project?.project_name}
        </p>
        <p>
          <strong>Location:</strong> {project?.project_location}
        </p>
        <p>
          <strong>Urgency:</strong> {urgency}
        </p>
        <p>
          <strong>Notes:</strong> {notes}
        </p>

        <h4 className="font-semibold mt-4">Selected Items:</h4>
        <ul>
          {selectedMaterials.map((item) => (
            <li key={item.resource_id}>
              {item.item_name} - Quantity: {item.request_quantity}
            </li>
          ))}
        </ul>

        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
            onClick={handleSubmission}
          >
            Submit Request
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
