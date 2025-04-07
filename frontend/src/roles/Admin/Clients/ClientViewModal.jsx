import React from 'react';

function ClientViewModal({ isOpen, client, onClose }) {
  if (!isOpen || !client) return null; // Return null if modal is not open or client data is unavailable

  return (
    <div className="modal-overlay fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="modal-content bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Client Details</h2>
        <div className="mb-4">
          <p><strong>Client Name:</strong> {client.client_name}</p>
        </div>
        <div className="mb-4">
          <p><strong>Email:</strong> {client.email}</p>
        </div>
        <div className="mb-4">
          <p><strong>Phone Number:</strong> {client.phone_number}</p>
        </div>
        <div className="mb-4">
          <p><strong>Website:</strong> {client.website}</p>
        </div>
        <div className="mb-4">
          <p><strong>Industry:</strong> {client.industry}</p>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClientViewModal;
