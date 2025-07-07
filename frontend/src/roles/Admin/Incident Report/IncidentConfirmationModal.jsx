// ConfirmationModal.jsx
import React from 'react';

// Component for a generic confirmation modal
export const ConfirmationModal = ({
  show,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  confirmButtonClass = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500', // Default blue
}) => {
  if (!show) {
    return null; // Don't render if not visible
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-2xl max-w-sm w-full relative transform scale-95 animate-scale-in">
        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          {title}
        </h3>
        <p className="text-gray-700 mb-6">
          {message}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150 font-medium"
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 font-medium ${confirmButtonClass}`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};