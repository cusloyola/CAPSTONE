import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button className="absolute top-3 right-3 text-gray-600 text-2xl hover:text-red-500" onClick={onClose}>
                    ✖
                </button>

                {children}
            </div>
        </div>

    );
};

export default Modal;
