import React, { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import axios from 'axios';

const ViewRequestHistory = () => {
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

  const filteredRequests = requests.filter(
    (request) =>
      request.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.urgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.items.some((item) => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <p>Loading request history...</p>;
  if (error) return <p>Error: {error}</p>;

  const lastThreeRequests = filteredRequests.slice(-3);

  return (
    <>
      <PageMeta title="Material Request History" description="View material request history" />

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Material Request History</h3>

        <input
          type="text"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <p className="font-semibold mb-2">Recent Requests:</p>
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
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded-full ml-1 font-semibold">Pending</span>
                ) : request.status === 'approved' ? (
                  <span className="bg-green-500 text-black px-2 py-1 rounded-full ml-1 font-semibold">Approved</span>
                ) : (
                  <span className="bg-red-500 text-black px-2 py-1 rounded-full ml-1 font-semibold">Rejected</span>
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
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded-full font-semibold">Pending</span>
                  ) : request.status === 'approved' ? (
                    <span className="bg-green-500 text-black px-2 py-1 rounded-full font-semibold">Approved</span>
                  ) : (
                    <span className="bg-red-500 text-black px-2 py-1 rounded-full font-semibold">Rejected</span>
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

export default ViewRequestHistory;