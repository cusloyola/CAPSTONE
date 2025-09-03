import ViewMaterialRequestModalAdmin from './ViewMaterialRequestModalAdmin';

const ModalManager = ({
  showViewModal,
  setShowViewModal,
  viewRequest,
  viewMaterials,
  showApproveModal,
  setShowApproveModal,
  handleApprove,
  showRejectModal,
  setShowRejectModal,
  handleReject,
  showSuccessModal,
  setShowSuccessModal,
  successMessage,
  showErrorModal,
  setShowErrorModal,
  errorMessage,
}) => {
  return (
    <>
      {showViewModal && viewRequest && (
        <ViewMaterialRequestModalAdmin
          report={viewRequest}
          materials={viewMaterials}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>Approve this request?</p>
            <div className="mt-4 flex gap-2">
              <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded">Yes</button>
              <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>Reject this request?</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleReject("Reason")} className="px-4 py-2 bg-red-600 text-white rounded">Yes</button>
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-green-600">{successMessage}</p>
            <button onClick={() => setShowSuccessModal(false)} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">Close</button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-red-600">{errorMessage}</p>
            <button onClick={() => setShowErrorModal(false)} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalManager;
