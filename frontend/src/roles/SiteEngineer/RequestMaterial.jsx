import React, { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import axios from 'axios';

const RequestMaterial = () => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [urgency, setUrgency] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');

  const projects = [
    {
      project_name: 'Manila Bridge Construction',
      project_location: '123 Roxas Blvd, Manila, Philippines',
    },
    {
      project_name: 'Cebu High-Rise Building',
      project_location: '456 Osmeña Blvd, Cebu City, Philippines',
    },
    {
      project_name: 'Davao Coastal Road',
      project_location: '789 Diversion Road, Davao City, Philippines',
    },
    {
      project_name: 'Clark Smart City',
      project_location: '101 Clark Ave, Pampanga, Philippines',
    },
  ];

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:5000/api/request-materials/items');
        setMaterials(response.data);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError('Failed to fetch materials. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const toggleMaterial = (material) => {
    const exists = selectedMaterials.find(m => m.item_id === material.item_id);
    if (exists) {
      setSelectedMaterials(selectedMaterials.filter(m => m.item_id !== material.item_id));
    } else {
      setSelectedMaterials([
        ...selectedMaterials,
        {
          ...material,
          request_quantity: 1,
          error: '',
        },
      ]);
    }
  };

  const handleQuantityChange = (id, value) => {
    setSelectedMaterials(prev =>
      prev.map(m =>
        m.item_id === id
          ? {
              ...m,
              request_quantity: value,
              error:
                !value || value <= 0
                  ? 'Quantity must be at least 1'
                  : value > m.stock_quantity
                  ? 'Exceeds available stock!'
                  : '',
            }
          : m
      )
    );
  };

  const filteredMaterials = materials.filter(material =>
    material.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const submitRequest = async () => {
    setRequestError('');
    try {
      await axios.post('http://localhost:5000/api/request-materials/create', {
        selectedProject,
        urgency,
        notes,
        selectedMaterials: selectedMaterials.map(m => ({
          item_id: m.item_id,
          request_quantity: m.request_quantity,
        })),
      });

      console.log('Request submitted successfully!');
      closeModal();
      setSelectedMaterials([]);
      setUrgency('');
      setSelectedProject('');
      setNotes('');
      setRequestSent(true);
    } catch (err) {
      console.error('Error submitting request:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setRequestError(err.response.data.error);
      } else {
        setRequestError('Failed to submit request. Please try again.');
      }
    }
  };

  const isRequestInvalid =
    !selectedProject ||
    !urgency ||
    selectedMaterials.length === 0 ||
    selectedMaterials.some(
      (m) =>
        m.error ||
        m.request_quantity === '' ||
        m.request_quantity <= 0 ||
        m.request_quantity > m.stock_quantity
    );

  if (loading) return <p>Loading materials...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <PageMeta
        title="Request Construction Materials"
        description="Select materials and request stock"
      />

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Select Materials</h3>
        <input
          type="text"
          placeholder="Search by material name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Select</th>
              <th className="p-3 border-b">Material Name</th>
              <th className="p-3 border-b">Stock Quantity</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => (
                <tr key={material.item_id} className="border-b">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.some(m => m.item_id === material.item_id)}
                      onChange={() => toggleMaterial(material)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3">{material.item_name}</td>
                  <td className="p-3">{material.stock_quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  No materials found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Selected Materials</h3>
          {selectedMaterials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMaterials.map((material) => (
                <div key={material.item_id} className="border p-4 rounded-lg shadow">
                  <h4 className="font-semibold">{material.item_name}</h4>
                  <p className="text-gray-600">Available: {material.stock_quantity}</p>
                  <label className="block mt-2 font-medium">Request Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={material.stock_quantity}
                    value={material.request_quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        material.item_id,
                        parseInt(e.target.value, 10) || ''
                      )
                    }
                    className={`w-full p-2 border rounded mt-1 ${
                      material.error ? 'border-red-500' : ''
                    }`}
                  />
                  {material.error && (
                    <p className="text-red-500 text-sm mt-1">{material.error}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No materials selected.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Project Details</h3>

          <div className="mb-4">
            <label className="block font-semibold">Select Project:</label>
            <select
              className="w-full p-2 border rounded mt-1"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">-- Select Project --</option>
              {projects.map((project, index) => (
                <option key={index} value={project.project_name}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <p className="text-gray-700 mb-4">
              <strong>Location:</strong>{' '}
              {projects.find(p => p.project_name === selectedProject)?.project_location}
            </p>
          )}

          <div className="mb-4">
            <label className="block font-semibold">Select Urgency:</label>
            <select
              className="w-full p-2 border rounded mt-1"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
            >
              <option value="">-- Select Urgency --</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent (Immediate Attention)</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Additional Notes:</label>
            <textarea
              className="w-full p-2 border rounded mt-1"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter additional instructions or remarks..."
            />
          </div>

          <button
            className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isRequestInvalid}
            onClick={openModal}
          >
            Submit Request
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Confirm Request</h3>
            <p><strong>Project:</strong> {selectedProject}</p>
            <p><strong>Location:</strong> {projects.find(p => p.project_name === selectedProject)?.project_location}</p>
            <p><strong>Urgency:</strong> {urgency}</p>
            <p><strong>Notes:</strong> {notes}</p>
            <h4 className="font-semibold mt-4">Selected Items:</h4>
            <ul>
              {selectedMaterials.map(item => (
                <li key={item.item_id}>
                  {item.item_name} - Quantity: {item.request_quantity}
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                onClick={submitRequest}
              >
                Submit Request
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
            {requestError && (
              <p className="text-red-500 mt-2">{requestError}</p>
            )}
          </div>
        </div>
      )}

      {requestSent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg font-semibold text-green-600">
              Request Successfully Sent!
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setRequestSent(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestMaterial;