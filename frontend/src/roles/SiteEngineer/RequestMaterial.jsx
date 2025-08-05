import React, { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import axios from 'axios';


const RESOURCES_API_URL = "http://localhost:5000/api/resource";


const RequestMaterial = () => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [urgency, setUrgency] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [limit, setLimit] = useState(10); // Default limit for entries per page
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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


  // Debounce search input to avoid excessive API calls and flickering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400); // 400ms debounce delay


    // Cleanup function to clear the timeout if searchInput changes before the delay
    return () => clearTimeout(handler);
  }, [searchInput]);


  // Reset page to 1 whenever the search term or limit changes
  // This ensures that new searches/pagination limits start from the first page
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);


  // Effect to fetch materials from the backend
  // This runs on initial load and whenever page, limit, or debouncedSearch changes
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true); // Set loading state to true before fetching
      setError(''); // Clear any previous errors


      try {
        // Construct the API URL with current page, limit, and debounced search term
        const response = await axios.get(
          `${RESOURCES_API_URL}?page=${page}&limit=${limit}&search=${debouncedSearch}`
        );
       
        // The backend now returns an object with 'items' (array of materials) and 'total' (total count)
        const items = response.data.items || [];
        const total = response.data.total || 0;


        setMaterials(items); // Update materials state with fetched items
        setTotalItems(total); // Update total items count for pagination
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError('Failed to fetch materials. Please ensure the backend is running and accessible.');
      } finally {
        setLoading(false); // Set loading state to false after fetching (success or error)
      }
    };


    fetchMaterials(); // Call the fetch function
  }, [page, limit, debouncedSearch]); // Dependencies for this effect


  // Function to toggle selection of a material
  const toggleMaterial = (material) => {
    // Check if the material is already selected using its resource_id (which will be item_id)
    const exists = selectedMaterials.find(m => m.item_id === material.resource_id);
    if (exists) {
      // If material exists, remove it from selectedMaterials
      setSelectedMaterials(selectedMaterials.filter(m => m.item_id !== material.resource_id));
    } else {
      // If material does not exist, add it to selectedMaterials
      // Map backend properties (resource_id, material_name, stocks) to frontend expected properties
      setSelectedMaterials([
        ...selectedMaterials,
        {
          ...material, // Keep all original material properties
          item_id: material.resource_id, // Map resource_id to item_id
          item_name: material.material_name, // Map material_name to item_name
          stock_quantity: material.stocks, // Map stocks to stock_quantity
          request_quantity: 1, // Default request quantity
          error: '', // Initialize error state for this item
        },
      ]);
    }
  };


  // Function to handle changes in requested quantity for a selected material
  const handleQuantityChange = (id, value) => {
    setSelectedMaterials(prev =>
      prev.map(m =>
        m.item_id === id
          ? {
              ...m,
              request_quantity: value,
              // Validate quantity: must be at least 1 and not exceed available stock
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


  // Functions to manage modal visibility
  const openModal = () => {
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setIsModalOpen(false);
  };


  // Function to submit the material request
  const submitRequest = async () => {
    setRequestError(''); // Clear previous request errors
    try {
      await axios.post('http://localhost:5000/api/request-materials/create', {
        selectedProject,
        urgency,
        notes,
        // Send only necessary data for selected materials
        selectedMaterials: selectedMaterials.map(m => ({
          item_id: m.item_id,
          request_quantity: m.request_quantity,
        })),
      });


      console.log('Request submitted successfully!');
      closeModal(); // Close the confirmation modal
      // Reset all form states after successful submission
      setSelectedMaterials([]);
      setUrgency('');
      setSelectedProject('');
      setNotes('');
      setRequestSent(true); // Show success message modal
    } catch (err) {
      console.error('Error submitting request:', err);
      // Display specific error message if available from backend, otherwise a generic one
      if (err.response && err.response.data && err.response.data.error) {
        setRequestError(err.response.data.error);
      } else {
        setRequestError('Failed to submit request. Please try again.');
      }
    }
  };


  // Determine if the request form is invalid (for disabling submit button)
  const isRequestInvalid =
    !selectedProject || // Project must be selected
    !urgency || // Urgency must be selected
    selectedMaterials.length === 0 || // At least one material must be selected
    selectedMaterials.some(
      (m) =>
        m.error || // Any selected material has a quantity error
        m.request_quantity === '' || // Quantity is empty
        m.request_quantity <= 0 || // Quantity is zero or negative
        m.request_quantity > m.stock_quantity // Quantity exceeds stock
    );


  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const startEntry = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalItems);


  return (
    <>
      {/* Page metadata component */}
      <PageMeta
        title="Request Construction Materials"
        description="Select materials and request stock"
      />


      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Select Materials</h3>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          {/* "Show entries" dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="show-entries" className="font-medium">Show</label>
            <select
              id="show-entries"
              className="border rounded px-2 py-1 pr-4 appearance-none"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M4 6L8 10L12 6\' stroke=\'%23333\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
            >
              {[10, 25, 50, 100].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="ml-2">entries</span>
          </div>
          {/* Search input field */}
          <div className="flex items-center gap-2">
            <label htmlFor="search-materials" className="font-medium">Search:</label>
            <input
              id="search-materials"
              type="text"
              placeholder="Material name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {/* Materials table */}
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border-b">Select</th>
                <th className="p-3 border-b">Material Name</th>
                <th className="p-3 border-b">Unit</th>
                <th className="p-3 border-b">Brand</th>
                <th className="p-3 border-b">Unit Cost</th>
                <th className="p-3 border-b text-center">Stock Quantity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    Loading materials...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : materials.length > 0 ? (
                materials.map((material) => {
                  const id = material.resource_id; // Use resource_id as the unique key
                    return (
                    <tr key={id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.some(m => m.item_id === id)}
                        onChange={() => toggleMaterial(material)}
                        className="w-4 h-4"
                      />
                      </td>
                      <td className="p-3">{material.material_name}</td>
                      <td className="p-3">{material.unitName || material.unitId}</td>
                      <td className="p-3">{material.brand_name || material.brand_id}</td>
                      <td className="p-3 text-right">
                      ₱{Number(material.default_unit_cost).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">{material.stocks}</td>
                    </tr>
                    );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    No materials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Table footer: showing entries and pagination controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 gap-2">
          <div>
            <span className="text-sm text-gray-700">
              Showing {startEntry} to {endEntry} of {totalItems} entries
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section for selected materials */}
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


        {/* Section for project details and request submission */}
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


      {/* Confirmation Modal */}
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


      {/* Request Sent Success Message Modal */}
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



