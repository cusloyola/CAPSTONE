import React from "react";

const DeleteRebarModal = ({ isOpen, onClose, onConfirm, rebarLabel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>
            <div className="relative bg-white p-6 rounded-lg shadow-lg z-10 max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-4">Delete Rebar Entry</h2>
                <p className="mb-4">
                    Are you sure you want to delete <strong>{rebarLabel || "this entry"}</strong>?
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 border rounded hover:bg-gray-100"
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
};

export default DeleteRebarModal;
