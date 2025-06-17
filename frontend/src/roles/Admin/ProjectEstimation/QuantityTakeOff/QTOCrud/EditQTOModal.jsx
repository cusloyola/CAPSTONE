import React from 'react';
import { Button } from 'primereact/button';

const EditQTOModal = ({ visible, data, onClose }) => {
    if (!visible || !data) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
                <h3 className="text-lg font-semibold mb-4">Edit Row</h3>
                <p className="text-sm mb-2">Row: {data.name || '(Unnamed)'}</p>
                <div className="flex justify-end gap-2 mt-4">
                    <Button label="Close" onClick={onClose} className="p-button-text" />
                </div>
            </div>
        </div>
    );
};

export default EditQTOModal;
