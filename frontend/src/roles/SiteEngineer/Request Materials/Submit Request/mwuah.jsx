import React, { useState, useEffect } from 'react';
import PageMeta from '../../../../components/common/PageMeta';
import axios from 'axios';
import { submitRequest } from '../../../../api/materialRequests';

const RESOURCES_API_URL = "http://localhost:5000/api/resources";
const BRANDS_API_URL = "http://localhost:5000/api/resource/brands";
const PROJECTS_API_URL = "http://localhost:5000/api/projects";

const RequestMaterial = () => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [urgency, setUrgency] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [brandOptions, setBrandOptions] = useState([]);
  const [projects, setProjects] = useState([]);


  // Fetch brand options for filter dropdown
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(BRANDS_API_URL);
        setBrandOptions(Array.isArray(response.data) ? response.data : []);
      } catch {
        setBrandOptions([]);
      }
    };
    fetchBrands();
  }, []);


  // Fetch projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(PROJECTS_API_URL);
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch {
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);


  // Debounce search input to avoid excessive API calls and flickering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400); // 400ms debounce delay


    // Cleanup function to clear the timeout if searchInput changes before the delay
    return () => clearTimeout(handler);
  }, [searchInput]);


  // Reset page to 1 whenever the search term or brand filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, brandFilter]);


  // Fetch materials with pagination, search, and brand filter
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError('');
      try {
        let url = `${RESOURCES_API_URL}?page=${page}&limit=${limit}`;
        if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
        if (brandFilter) url += `&brand=${encodeURIComponent(brandFilter)}`;
        const response = await axios.get(url);
        let items = [];
        let total = 0;
        if (Array.isArray(response.data.items)) {
          items = response.data.items;
          total = response.data.total || items.length;
        } else if (Array.isArray(response.data)) {
          items = response.data;
          total = response.data.length;
        } else {
          items = [];
          total = 0;
        }
        setMaterials(items);
        setTotalItems(total);
      } catch (error) {
        setError('Failed to fetch materials. Please ensure the backend is running and accessible.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [page, limit, debouncedSearch, brandFilter]);


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


  const handleSubmission = async () => {
    setRequestError('');

    const result = await submitRequest(
      selectedProject,
      urgency,
      notes,
      selectedMaterials
    );

    if (result.success) {
      console.log('Request submitted successfully!');
      // Assuming you have a function to close the modal
      // closeModal(); 
      setSelectedMaterials([]);
      setUrgency('');
      setSelectedProject('');
      setNotes('');
      setRequestSent(true);
    } else {
      console.error('Error submitting request:', result.error);
      setRequestError(result.error);
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
        {/* Brand Category Filter Group */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="block font-medium text-gray-700">
            Brand Category:
          </label>
          <select
            className="border p-2 rounded w-48"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">All Brand Categories</option>
            {brandOptions.map((brand) => (
              <option key={brand.brand_id} value={brand.brand_name}>
                {brand.brand_name}
              </option>
            ))}
          </select>
        </div>
        {/* Show entries and Search bar in the same row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="show-entries" className="font-medium">Show</label>
            <select
              id="show-entries"
              className="border rounded px-2 py-1 pr-4 appearance-none"
              value={limit}
              onChange={e => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'16\' height=\'16\' viewBox=\'0 0 16 16\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M4 6L8 10L12 6\' stroke=\'%23333\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
            >
              {[10, 25, 50, 100].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="ml-2">entries</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <label htmlFor="search-materials" className="font-medium">Search:</label>
            <input
              id="search-materials"
              type="text"
              placeholder="Search by Material Name..."
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
                <th className="p-3 border-b border-r">Select</th>
                <th className="p-3 border-b border-r">Material Name</th>
                <th className="p-3 border-b border-r">Unit</th>
                <th className="p-3 border-b border-r">Brand</th>
                <th className="p-3 border-b border-r">Unit Cost</th>
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
                // Filter materials by brand if a brand is selected
                materials
                  .filter(material =>
                    !brandFilter || material.brand_name === brandFilter
                  )
                  .map((material) => {
                    const id = material.resource_id;
                    return (
                      <tr key={id} className="border-b hover:bg-gray-50">
                        <td className="p-3 border-r">
                          <input
                            type="checkbox"
                            checked={selectedMaterials.some(m => m.item_id === id)}
                            onChange={() => toggleMaterial(material)}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="p-3 border-r">{material.material_name}</td>
                        <td className="p-3 border-r">{material.unitName || material.unitId}</td>
                        <td className="p-3 border-r">{material.brand_name || material.brand_id}</td>
                        <td className="p-3 border-r text-right">
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
                    className={`w-full p-2 border rounded mt-1 ${material.error ? 'border-red-500' : ''
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
                <option key={project.project_id || index} value={project.project_name}>
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
                onClick={handleSubmission}
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



