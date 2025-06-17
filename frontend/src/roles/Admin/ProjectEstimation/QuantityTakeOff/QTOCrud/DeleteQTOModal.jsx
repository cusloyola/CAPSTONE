import React from 'react';
import { Button } from 'primereact/button';

const DeleteQTOModal = ({ visible, data, onClose, onDelete }) => {
    if (!visible || !data) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-sm mb-4">Are you sure you want to delete "{data.name}"?</p>
                <div className="flex justify-end gap-2">
                    <Button label="Cancel" onClick={onClose} className="p-button-text" />
                    <Button label="Delete" className="bg-red-600 text-white" onClick={onDelete} />
                </div>
            </div>
        </div>
    );
};

export default DeleteQTOModal;
