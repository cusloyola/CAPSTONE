import React from "react";

const SuccessModal = ({ requestSent, setRequestSent }) => {
  if (!requestSent) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center w-80">
        <p className="text-lg font-semibold text-green-600">
          Request Successfully Sent!
        </p>
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setRequestSent(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
