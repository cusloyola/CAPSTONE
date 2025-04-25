import React from "react";

function DeleteConfirmModal({ isOpen, onClose, onConfirm, clientName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
        <p className="text-sm mb-6">
          Are you sure you want to delete <strong>{clientName}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
