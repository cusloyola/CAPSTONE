import React, { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';

const MaterialRequestHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const dummyRequests = [
    {
      request_id: 1,
      project_name: 'Manila Bridge Construction',
      urgency: 'High',
      items: [
        { material_id: 1, item_name: 'Cement Bags', request_quantity: 50 },
        { material_id: 2, item_name: 'Steel Bars', request_quantity: 100 },
      ],
      notes: 'Urgent delivery needed.',
      request_date: new Date('2023-11-15T10:00:00Z'),
    },
    {
      request_id: 2,
      project_name: 'Cebu High-Rise Building',
      urgency: 'Medium',
      items: [
        { material_id: 3, item_name: 'Plywood Sheets', request_quantity: 30 },
        { material_id: 4, item_name: 'Gravel (kg)', request_quantity: 2000 },
      ],
      notes: 'Delivery by next week.',
      request_date: new Date('2023-11-20T14:30:00Z'),
    },
    {
      request_id: 3,
      project_name: 'Davao Coastal Road',
      urgency: 'Low',
      items: [{ material_id: 5, item_name: 'Hollow Blocks', request_quantity: 150 }],
      notes: 'For future use.',
      request_date: new Date('2023-11-25T09:15:00Z'),
    },
  ];

  const filteredRequests = dummyRequests.filter((request) =>
    request.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.urgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.items.some(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <PageMeta
        title="Material Request History"
        description="View all material requests submitted"
      />

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Material Request History</h3>

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
                    <li key={item.material_id}>
                      {item.item_name} - Quantity: {item.request_quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm mt-2">Notes: {request.notes}</p>
            </div>
          ))}
        </div>

        {/* Table View Layout (Optional) */}
        <table className="w-full border-collapse mt-6">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Project</th>
              <th className="p-3 border-b">Urgency</th>
              <th className="p-3 border-b">Items</th>
              <th className="p-3 border-b">Notes</th>
              <th className="p-3 border-b">Date Requested</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.request_id} className="border-b">
                <td className="p-3">{request.project_name}</td>
                <td className="p-3">{request.urgency}</td>
                <td className="p-3">
                  <ul>
                    {request.items.map((item) => (
                      <li key={item.material_id}>
                        {item.item_name} - Quantity: {item.request_quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3">{request.notes}</td>
                <td className="p-3">{new Date(request.request_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MaterialRequestHistory;