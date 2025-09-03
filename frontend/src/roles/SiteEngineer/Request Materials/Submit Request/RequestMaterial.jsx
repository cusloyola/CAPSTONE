import React, { useState, useEffect } from 'react';
import PageMeta from '../../../../components/common/PageMeta';
import { toast, ToastContainer } from "react-toastify";


// Import all necessary functions from your API file
import { 
  fetchMaterials
} from '../../../../api/resourceApi';
import { 
  fetchBrands, 
  fetchProjects
} from '../../../../api/projectApi';
import { 
  submitRequest
} from '../../../../api/materialRequests';
import MaterialSearchTable from './MaterialSearchTable';
import SelectedMaterialsList from './SelectedMaterialsList';
import RequestForm from './RequestForm';
import ConfirmationModal from './ConfirmationModal';
import SuccessModal from './SucessModal';

// Note: Removed the hardcoded API URLs as they are now in the API file
// const RESOURCES_API_URL = "http://localhost:5000/api/resources";
// const BRANDS_API_URL = "http://localhost:5000/api/resource/brands";
// const PROJECTS_API_URL = "http://localhost:5000/api/projects";

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

  // useEffect hook for debounced search
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset page to 1 on new search
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchInput]);

  // HOOK 1: Fetch materials
  useEffect(() => {
    const getMaterials = async () => {
      setLoading(true);
      setError('');
      try {
        const { items, total } = await fetchMaterials(page, limit, debouncedSearch, brandFilter);
        setMaterials(items);
        setTotalItems(total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getMaterials();
  }, [page, limit, debouncedSearch, brandFilter]);

  // HOOK 2: Fetch brands
  useEffect(() => {
    const getBrands = async () => {
      try {
        const brands = await fetchBrands();
        setBrandOptions(brands);
      } catch (err) {
        setError(err.message);
      }
    };
    getBrands();
  }, []);

  // HOOK 3: Fetch projects
  useEffect(() => {
    const getProjects = async () => {
      try {
        const projects = await fetchProjects();
        setProjects(projects);
      } catch (err) {
        setError(err.message);
      }
    };
    getProjects();
  }, []);

  // Handler functions
const toggleMaterial = (material) => {
  setSelectedMaterials(prevMaterials => {
    // Check if the material is already selected
    const isSelected = prevMaterials.some(m => m.resource_id === material.resource_id);

    if (isSelected) {
      // If it's already selected, remove it from the list
      return prevMaterials.filter(m => m.resource_id !== material.resource_id);
    } else {
      // If it's not selected, add it to the list with an initial quantity
      return [...prevMaterials, {
        resource_id: material.resource_id,
        name: material.material_name,
        stock_quantity: material.stocks,
        request_quantity: 1, // Set a default quantity of 1
        error: '' // Initialize with no error
      }];
    }
  });
};


  // Function to handle changes in requested quantity for a selected material
  const handleQuantityChange = (id, value) => {
    setSelectedMaterials(prev =>
      prev.map(m =>
        m.resource_id === id
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


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

 const handleSubmission = async () => {
  setRequestError('');
  const result = await submitRequest(selectedProject, urgency, notes, selectedMaterials);
  if (result.success) {
    closeModal();
    setSelectedMaterials([]);
    setUrgency('');
    setSelectedProject('');
    setNotes('');
    toast.success("Request submitted successfully!", { position: "top-right" });
  } else {
    toast.error(result.error || "Error submitting request", { position: "top-right" });
  }
};


  const isRequestInvalid =
    !selectedProject ||
    !urgency ||
    selectedMaterials.length === 0 ||
    selectedMaterials.some(m => m.error || m.request_quantity === '' || m.request_quantity <= 0 || m.request_quantity > m.stock_quantity);

  return (
    <>
  <PageMeta
    title="Request Construction Materials"
    description="Select materials and request stock"
  />

  {/* Main Grid Container */}
  <div className="grid grid-rows-[auto,1fr,auto] gap-6 min-h-screen">
    {/* Row 1: Materials Table */}
      <MaterialSearchTable
        materials={materials}
        loading={loading}
        error={error}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        brandFilter={brandFilter}
        setBrandFilter={setBrandFilter}
        brandOptions={brandOptions}
        selectedMaterials={selectedMaterials}
        toggleMaterial={toggleMaterial}
        limit={limit}
        setLimit={setLimit}
        page={page}
        setPage={setPage}
        totalItems={totalItems}
      />

    {/* Row 2: Selected Materials + Request Form */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SelectedMaterialsList
        selectedMaterials={selectedMaterials}
        handleQuantityChange={handleQuantityChange}
      />
      <RequestForm
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projects={projects}
        urgency={urgency}
        setUrgency={setUrgency}
        notes={notes}
        setNotes={setNotes}
        isRequestInvalid={isRequestInvalid}
        openModal={openModal}
      />
    </div>

    {/* Row 3: Modals & Toast */}
    <div>
      <ConfirmationModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        handleSubmission={handleSubmission}
        selectedProject={selectedProject}
        projects={projects}
        urgency={urgency}
        notes={notes}
        selectedMaterials={selectedMaterials}
        requestError={requestError}
      />
      {/* <SuccessModal
        requestSent={requestSent}
        setRequestSent={setRequestSent}
      /> */}
      <ToastContainer />
    </div>
  </div>
</>

  );
};

export default RequestMaterial;