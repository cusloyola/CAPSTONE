import React from 'react';

const Modal = ({ summaryData, onClose, onConfirm }) => {
  return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
  <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
    <h3 className="text-xl font-semibold mb-5 ">Submitted Report</h3>
    <hr className='mb-5 '/>

    <div className="grid grid-cols-2 gap-x-4 text-md">
      {summaryData.map(([label, value], index) => (
        <React.Fragment key={index}>
          <span className="font-semibold text-left">{label}:</span> {/* Left-aligned */}
          <span className="text-left">{value || "N/A"}</span>
        </React.Fragment>
      ))}
    </div>

    {/* Flexbox for buttons with spacing */}
    <div className="flex justify-end space-x-4 mt-10">
      <button 
        onClick={onConfirm} 
        className="bg-green-500 text-white py-2 px-4 rounded"
      >
        Confirm
      </button>
      <button 
        onClick={onClose} 
        className="bg-red-500 text-white py-2 px-4 rounded"
      >
        Close
      </button>
    </div>
  </div>
</div>

  );
};

export default Modal;
