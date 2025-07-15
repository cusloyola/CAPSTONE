import React from 'react';

const ImageViewerModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-4">
        <img
          src={imageUrl}
          alt="Selected"
          className="max-w-[80vw] max-h-[80vh] object-contain rounded"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2"
          title="Close"
        >
          ❌
        </button>
      </div>
    </div>
  );
};

export default ImageViewerModal;