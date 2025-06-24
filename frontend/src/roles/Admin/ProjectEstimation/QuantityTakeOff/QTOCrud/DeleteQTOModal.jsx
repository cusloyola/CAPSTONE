import React, { useState } from 'react';

const DeleteQTOModal = ({ visible, data, onClose, onDelete }) => {
    const [success, setSuccess] = useState(false);

    if (!visible || !data?.qto_id) return null;

    const handleConfirmDelete = async () => {
        console.log('Attempting to delete QTO ID:', data.qto_id);

        try {
            const res = await fetch(`http://localhost:5000/api/qto/delete/${data.qto_id}`, {
                method: 'DELETE',
            });

            console.log('API Response Status:', res.status, res.statusText);

            if (!res.ok) {
                const errorBody = await res.text();
                console.error('Failed to delete QTO entry. Server response:', errorBody);
                throw new Error('Failed to delete QTO entry');
            }

            setSuccess(true);  // ✅ Shows success animation
            console.log('✅ setSuccess(true) called.');
            onDelete?.();      // Notify parent to refresh data
        } catch (err) {
            console.error('❌ Delete failed:', err);
            alert('Failed to delete. Please try again.');
            onClose();
        }
    };


    const handleClose = () => {
        setSuccess(false);  // Reset success state for next time
        onClose();          // Close modal
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black opacity-40" onClick={handleClose}></div>

            {/* Modal Content */}
            <div className="relative bg-white p-6 rounded-lg shadow-lg z-10 max-w-sm w-full">
                {!success ? (
                    <>
                        <h2 className="text-lg font-semibold mb-4">Delete Confirmation</h2>
                        <p className="mb-4">
                            Are you sure you want to delete <strong>{data.name}</strong>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 p-2 mx-auto mb-4 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <p className="mb-4 text-lg font-semibold text-gray-900">
                            Successfully deleted <strong>{data.name}</strong>.
                        </p>
                        <button
                            onClick={handleClose}
                            className="py-2 px-4 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteQTOModal;
