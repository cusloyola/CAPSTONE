import React, { useCallback, useEffect } from 'react';

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  confirmText,
  onCancel,
  cancelText = 'Cancel',
  isSuccess = false,
  modalType, // Added to handle specific modal styling if needed
}) => {
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape' && isOpen) {
      onCancel();
    }
  }, [isOpen, onCancel]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  if (!isOpen) return null;

  const titleColorClass = isSuccess ? 'text-green-600' : 'text-red-600';
  const confirmButtonClass = isSuccess
    ? 'bg-blue-600 hover:bg-blue-700'
    : 'bg-green-600 hover:bg-green-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md text-center w-80">
        <h2 className={`text-lg font-semibold mb-4 ${titleColorClass}`}>{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded ${confirmButtonClass} text-white`}
          >
            {confirmText}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;