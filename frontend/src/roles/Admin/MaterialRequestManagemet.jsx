import React, { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import axios from 'axios';

const MaterialRequestManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const filteredRequests = requests.filter((request) =>
    request.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.urgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.items.some(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`http://localhost:5000/api/request-materials/${requestId}/approve`);
      // Update the requests state to reflect the approval
      setRequests(requests.map(req => 
        req.request_id === requestId ? { ...req, status: 'approved' } : req
      ));
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request.');
    }
  };

  if (loading) return <p>Loading request history...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <PageMeta
        title="Material Request Management"
        description="Manage all material requests submitted"
      />

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Material Request Management</h3>

        <input
          type="text"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        {/* Card View Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request) => (
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
              <p className="text-sm mt-2">Notes: {request.notes}</p>
              {request.status === 'pending' ? (
                <p className="mt-2 text-yellow-500 font-semibold">Pending</p>
              ) : request.status === 'approved' ? (
                <p className="mt-2 text-green-600 font-semibold">Approved</p>
              ) : (
                <p className="text-sm mt-2">Status: {request.status}</p>
              )}
            </div>
          ))}
        </div>

        {/* Table View Layout (Optional) */}
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
                <td className="p-3">{request.notes}</td>
                <td className="p-3">
                  {request.status === 'pending' ? (
                    <span className="text-yellow-500 font-semibold">Pending</span>
                  ) : request.status === 'approved' ? (
                    <span className="text-green-600 font-semibold">Approved</span>
                  ) : (
                    <span>{request.status}</span>
                  )}
                </td>
                <td className="p-3">
                  {request.status === 'pending' && (
                    <button 
                      onClick={() => handleApprove(request.request_id)} 
                      className="bg-green-500 text-white font-semibold px-4 py-2 rounded-full"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MaterialRequestManagement;