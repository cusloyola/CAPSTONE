import React, { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import axios from 'axios';

const MaterialRequestManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [requestToReject, setRequestToReject] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:5000/api/request-materials/history');
        setRequests(response.data);
      } catch (err) {
        console.error('Error fetching request history:', err);
        setError('Failed to fetch request history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(
    (request) =>
      request.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.urgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.items.some((item) => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/request-materials/${requestId}/approve`);
      setRequests(requests.map((req) => (req.request_id === requestId ? { ...req, status: 'approved' } : req)));
      setShowApproveModal(false);
      setRequestToApprove(null);
      setSuccessMessage('Material request successfully approved!');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request.');
    }
  };

  const handleDisapprove = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/request-materials/${requestId}/reject`);
      setRequests(requests.map((req) => (req.request_id === requestId ? { ...req, status: 'rejected' } : req)));
      setShowRejectModal(false);
      setRequestToReject(null);
      setSuccessMessage('Material request successfully rejected!');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request.');
    }
  };

  if (loading) return <p>Loading request history...</p>;
  if (error) return <p>Error: {error}</p>;

  const lastThreeRequests = filteredRequests.slice(-3);

  return (
    <>
      <PageMeta title="Material Request Management" description="Manage all material requests submitted" />

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Material Request Management</h3>

        <input
          type="text"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <p className="font-semibold mb-2">Top 3 Recent Material Requests:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lastThreeRequests.map((request) => (
            <div key={request.request_id} className="border rounded-lg p-4 shadow-md">
              <h4 className="font-semibold">{request.project_name}</h4>
              <p className="text-sm text-gray-600">Urgency: {request.urgency}</p>
              <p className="text-sm text-gray-600">Date: {new Date(request.request_date).toLocaleDateString()}</p>
              <div className="mt-2">
                <h5 className="font-medium">Items:</h5>
                <ul className="list-disc list-inside text-sm">
                  {request.items.map((item) => (
                    <li key={item.item_id}>
                      {item.item_name} - Quantity: {item.request_quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm mt-2">Notes: {request.notes || 'N/A'}</p>
              <p className="text-sm mt-2">
                Status:
                {request.status === 'pending' ? (
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold">Pending</span>
                ) : request.status === 'approved' ? (
                  <span className="bg-green-500 text-black px-3 py-1 rounded-full font-semibold">Approved</span>
                ) : (
                  <span className="bg-red-500 text-black px-3 py-1 rounded-full font-semibold">Rejected</span>
                )}
              </p>
            </div>
          ))}
        </div>

        <table className="w-full border-collapse mt-6">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Project</th>
              <th className="p-3 border-b">Urgency</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Items</th>
              <th className="p-3 border-b">Notes</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.request_id} className="border-b">
                <td className="p-3">{request.project_name}</td>
                <td className="p-3">{request.urgency}</td>
                <td className="p-3">{new Date(request.request_date).toLocaleDateString()}</td>
                <td className="p-3">
                  <ul>
                    {request.items.map((item) => (
                      <li key={item.item_id}>
                        {item.item_name} - Quantity: {item.request_quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3">{request.notes || 'N/A'}</td>
                <td className="p-3">
                {request.status === 'pending' ? (
  <span className="bg-yellow-500 text-black px-4 py-1 rounded-full font-semibold min-w-[90px] text-center inline-block">Pending</span>
) : request.status === 'approved' ? (
  <span className="bg-green-500 text-black px-4 py-1 rounded-full font-semibold min-w-[90px] text-center inline-block">Approved</span>
) : (
  <span className="bg-red-500 text-black px-4 py-1 rounded-full font-semibold min-w-[90px] text-center inline-block">Rejected</span>
)}
                </td>
                <td className="p-3">
                  {request.status === 'pending' ? (
                    <>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => {
                            setRequestToApprove(request.request_id);
                            setShowApproveModal(true);
                          }}
                          style={{
                            width: '50px',
                            padding: '8px 12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            flex: '1',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRequestToReject(request.request_id);
                            setShowRejectModal(true);
                          }}
                          style={{
                            width: '50px',
                            padding: '8px 12px',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            flex: '1',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-600 italic text-center block">No Further Actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>Do you want to approve this material request?</p>
            <div className="mt-4 flex justify-end gap-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded font-bold" onClick={() => handleApprove(requestToApprove)}>
                Yes
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded font-bold" onClick={() => setShowApproveModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>Do you want to reject this material request?</p>
            <div className="mt-4 flex justify-end gap-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded font-bold" onClick={() => handleDisapprove(requestToReject)}>
                Yes
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded font-bold" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p>{successMessage}</p>
            <div className="mt-4 flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold" onClick={() => setShowSuccessModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialRequestManagement;