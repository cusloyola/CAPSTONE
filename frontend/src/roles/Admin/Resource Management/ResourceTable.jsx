import React, { useEffect, useState, useRef, useCallback } from "react";
import { useModal } from "../../../hooks/useModal";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import ActionDropdownResource from "./ActionDropdownResource";
import AddResourceModal from "./AddResource";
// Add these imports for fetching brands and units

// API endpoint for resources
const RESOURCES_API_URL = "http://localhost:5000/api/resource";

/**
 * A modal component to display a success message.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - The function to call when the modal is closed.
 * @param {string} props.message - The success message to display.
 */
const SuccessMessageModal = ({ isOpen, onClose, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xs m-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-xs overflow-y-auto rounded-2xl bg-white p-4 text-center shadow-lg">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h4 className="mt-3 text-lg font-semibold text-gray-800">Success!</h4>
                {/* Render message as JSX for bold resource name */}
                <p className="mt-2 text-sm text-gray-600">
                    {typeof message === "string" && message.includes("Resource") && message.includes("successfully added!") ? (
                        <>
                            Resource <b>{message.match(/<b>(.*?)<\/b>/)?.[1]}</b> successfully added!
                        </>
                    ) : (
                        message
                    )}
                </p>
                <div className="mt-4 flex justify-center">
                    <Button onClick={onClose} size="sm" variant="outline">
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const ResourceTable = () => {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const { isOpen, openModal, closeModal } = useModal();
    const [editingResource, setEditingResource] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null); // State for the success modal message
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);

    // Editable fields
    const [editMaterialName, setEditMaterialName] = useState("");
    const [editDefaultUnitCost, setEditDefaultUnitCost] = useState("");
    const [editBrandName, setEditBrandName] = useState("");
    const [editUnitName, setEditUnitName] = useState("");
    const [editStocks, setEditStocks] = useState("");

    // Search
    const [search, setSearch] = useState("");
    // Add state for brand filter
    const [brandFilter, setBrandFilter] = useState("");

    // Pagination
    const [entriesPerPage, setEntriesPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    const visibleResources = filteredResources.slice(startIdx, endIdx);
    const totalPages = Math.ceil(filteredResources.length / entriesPerPage);

    // Function to fetch resources from the API
    const fetchResources = async () => {
        try {
            const response = await fetch(RESOURCES_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setResources(data);
            setFilteredResources(data);
        } catch (err) {
            // For now, we'll log the error. In a real app, you might show an error message.
            console.error("Failed to load resources:", err);
        }
    };

    // Fetch resources on mount
    useEffect(() => {
        fetchResources();
    }, []);

    // Handler to refresh resources and show success modal after adding
    const handleResourceAdded = (resourceName) => {
        setShowAddModal(false);
        fetchResources().then(() => {
            // Pass message with <b> tags for resource name
            setSuccessMessage(`Resource <b>${resourceName}</b> successfully added!`);
        });
    };

    // Get unique brand names for dropdown
    const brandOptions = React.useMemo(() => {
        const brands = resources
            .map((r) => r.brand_name)
            .filter((b) => b && b.trim() !== "");
        return Array.from(new Set(brands));
    }, [resources]);

    // Search filter
    useEffect(() => {
        let filtered = resources;
        if (search) {
            filtered = filtered.filter(
                (r) =>
                    r.material_name &&
                    r.material_name.toLowerCase().includes(search.toLowerCase())
            );
        }
        // Filter by brand if selected
        if (brandFilter) {
            filtered = filtered.filter(
                (r) => r.brand_name && r.brand_name === brandFilter
            );
        }
        setFilteredResources(filtered);
        setCurrentPage(1);
    }, [search, resources, brandFilter]);

    // Modal open for edit
    const handleEditClick = (resource) => {
        setEditingResource(resource);
        setEditMaterialName(resource.material_name || "");
        setEditDefaultUnitCost(resource.default_unit_cost?.toString() || "");
        setEditBrandName(resource.brand_name || "");
        setEditUnitName(resource.unitName || "");
        setEditStocks(resource.stocks?.toString() || "");
        openModal();
    };

    // Save resource (PUT)
    const handleSave = async () => {
        if (!editingResource || isSaving) return;

        if (!editMaterialName.trim()) {
            setSuccessMessage("Material name is required.");
            return;
        }
        if (isNaN(parseFloat(editDefaultUnitCost))) {
            setSuccessMessage("Default unit cost must be a valid number.");
            return;
        }
        if (isNaN(parseInt(editStocks))) {
            setSuccessMessage("Stocks must be a valid number.");
            return;
        }

        setIsSaving(true);

        // Find the selected brand and unit objects to get their IDs
        const selectedBrand = brands.find(b => b.brand_name === editBrandName);
        const selectedUnit = units.find(u => u.unitName === editUnitName);

        const updatedData = {
            ...editingResource,
            material_name: editMaterialName,
            default_unit_cost: parseFloat(editDefaultUnitCost),
            brand_name: editBrandName,
            unitName: editUnitName,
            stocks: parseInt(editStocks, 10),
            // Add these if your backend expects IDs:
            brand_id: selectedBrand ? selectedBrand.brand_id : editingResource.brand_id,
            unitId: selectedUnit ? selectedUnit.unitId : editingResource.unitId,
        };

        try {
            const response = await fetch(`${RESOURCES_API_URL}/${editingResource.resource_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Failed to update resource: ${response.status}. ${errorBody.message || ""}`);
            }

            const result = await response.json();

            // Refresh the table data after editing
            await fetchResources();

            setSuccessMessage(
                <>
                    Resource <b>{result.material_name}</b> updated successfully!
                </>
            );
            closeModal();
        } catch (err) {
            setSuccessMessage(`Failed to update resource: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Pagination handlers
    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };
    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    // Handle delete resource (show confirmation modal)
    const handleDeleteClick = (resource) => {
        setResourceToDelete(resource);
        setShowDeleteModal(true);
    };

    // Confirm delete action
    const confirmDelete = async () => {
        if (!resourceToDelete) return;
        try {
            const response = await fetch(`${RESOURCES_API_URL}/${resourceToDelete.resource_id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Failed to delete resource: ${response.status}. ${errorBody.message || ""}`);
            }

            setResources((prev) => prev.filter((res) => res.resource_id !== resourceToDelete.resource_id));
            setShowDeleteModal(false);
            setSuccessMessage(
                <>
                    Resource <b>{resourceToDelete.material_name}</b> successfully deleted!
                </>
            );
            setResourceToDelete(null);
        } catch (err) {
            setShowDeleteModal(false);
            setSuccessMessage(`Failed to delete resource: ${err.message}`);
            setResourceToDelete(null);
        }
    };

    // For edit modal dropdowns
    const [brands, setBrands] = useState([]);
    const [units, setUnits] = useState([]);

    // Fetch brands and units for dropdowns
    const fetchBrandsAndUnits = useCallback(async () => {
        try {
            const [brandsRes, unitsRes] = await Promise.all([
                fetch("http://localhost:5000/api/resource/brands"),
                fetch("http://localhost:5000/api/resource/units"),
            ]);
            const brandsData = await brandsRes.json();
            const unitsData = await unitsRes.json();
            setBrands(brandsData);
            setUnits(unitsData);
        } catch (err) {
            // Optionally handle error
        }
    }, []);

    // Fetch brands/units when edit modal opens
    useEffect(() => {
        if (isOpen) {
            fetchBrandsAndUnits();
        }
    }, [isOpen, fetchBrandsAndUnits]);

    return (
        <>
            <div className="p-4 space-y-6 bg-white shadow rounded">
                {/* Header */}
                <div className="bg-blue-600 text-white flex justify-between items-center p-4 rounded">
                    <h1 className="text-lg font-semibold">List of all Resources</h1>
                    <button
                        className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
                        onClick={() => setShowAddModal(true)}
                    >
                        Add New Resource
                    </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-4">
                    {/* Brand Category Filter Group */}
                    <div className="flex flex-col gap-2">
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
                                <option key={brand} value={brand}>
                                    {brand}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Show entries and Search Row */}
                <div className="flex justify-between items-center mt-4">
                    <div>
                        <label className="text-sm">
                            Show
                            <select
                                className="mx-2 border p-1 pr-8 rounded appearance-none"
                                value={entriesPerPage}
                                onChange={(e) => {
                                    setEntriesPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={1}>1</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            entries
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="block font-medium text-gray-700">
                            Search:
                        </label>
                        <input
                            id="searchInput"
                            type="text"
                            className="border p-2 rounded w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Material Name..."
                        />
                    </div>
                </div>

                {/* Table */}
                <table className="table-auto w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2 text-center">Material Name</th>
                            <th className="border px-4 py-2 text-center">Brand Name</th>
                            <th className="border px-4 py-2 text-center">Unit Name</th>
                            <th className="border px-4 py-2 text-center">Material Cost</th>
                            <th className="border px-4 py-2 text-center">Stocks</th>
                            <th className="border px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleResources.length > 0 ? (
                            visibleResources.map((resource) => (
                                <tr key={resource.resource_id}>
                                    <td className="border px-4 py-2">{resource.material_name}</td>
                                    <td className="border px-4 py-2">{resource.brand_name}</td>
                                    <td className="border px-4 py-2">{resource.unitName}</td>
                                    <td className="border px-4 py-2 text-right">
                                        ₱{Number(resource.default_unit_cost).toFixed(2)}
                                    </td>
                                    <td className="border px-4 py-2 text-right">
                                        {resource.stocks}
                                    </td>
                                    <td className="border px-4 py-2 space-x-2 text-center">
                                        <ActionDropdownResource
                                            onEdit={() => handleEditClick(resource)}
                                            onDelete={() => handleDeleteClick(resource)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center border px-4 py-2">
                                    No resources found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                    <p>
                        Showing {startIdx + 1} to {Math.min(endIdx, filteredResources.length)} of {filteredResources.length} entries
                    </p>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Resource Modal */}
            {showAddModal && (
                <AddResourceModal
                    onClose={() => setShowAddModal(false)}
                    onResourceAdded={handleResourceAdded}
                />
            )}

            {/* Edit Resource Modal */}
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4" aria-modal="true" role="dialog">
                <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-2xl bg-white p-4 dark:bg-gray-900 lg:p-6">
                    <div className="px-2 pr-10">
                        <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
                            Edit Resource Information
                        </h4>
                        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            Update resource details.
                        </p>
                    </div>
                    <form
                        className="flex flex-col"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                    >
                        <div className="custom-scrollbar max-h-[300px] overflow-y-auto px-2 pb-3">
                            <div className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
                                <div>
                                    <Label htmlFor="editMaterialName">Material Name</Label>
                                    <Input
                                        id="editMaterialName"
                                        type="text"
                                        value={editMaterialName}
                                        onChange={(e) => setEditMaterialName(e.target.value)}
                                        aria-label="Edit Material Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editDefaultUnitCost">Default Unit Cost</Label>
                                    <Input
                                        id="editDefaultUnitCost"
                                        type="number"
                                        value={editDefaultUnitCost}
                                        onChange={(e) => setEditDefaultUnitCost(e.target.value)}
                                        aria-label="Edit Default Unit Cost"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editBrandName">Brand Name</Label>
                                    <select
                                        id="editBrandName"
                                        className="w-full border p-2 rounded"
                                        value={editBrandName}
                                        onChange={(e) => setEditBrandName(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand.brand_id} value={brand.brand_name}>
                                                {brand.brand_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="editUnitName">Unit Name</Label>
                                    <select
                                        id="editUnitName"
                                        className="w-full border p-2 rounded"
                                        value={editUnitName}
                                        onChange={(e) => setEditUnitName(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Unit</option>
                                        {units.map((unit) => (
                                            <option key={unit.unitId} value={unit.unitName}>
                                                {unit.unitName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="editStocks">Stocks</Label>
                                    <Input
                                        id="editStocks"
                                        type="number"
                                        value={editStocks}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*$/.test(val)) setEditStocks(val);
                                        }}
                                        min="0"
                                        step="1"
                                        aria-label="Edit Stocks"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
    <button
        onClick={closeModal}
        type="button"
        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
    >
        Close
    </button>
    <button
        onClick={handleSave}
        disabled={isSaving}
        type="submit"
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
        }`}
    >
        {isSaving ? "Saving..." : "Save Changes"}
    </button>
</div>

                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="max-w-xs m-4" aria-modal="true" role="dialog">
                <div className="relative w-full max-w-xs overflow-y-auto rounded-2xl bg-white p-4 text-center shadow-lg">
                    {/* Trash can icon */}
                    <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    <h4 className="mt-3 text-lg font-semibold text-gray-800">Are you sure?</h4>
                    <p className="mt-2 text-sm text-gray-600">
                        Do you want to delete <b>{resourceToDelete?.material_name}</b>?
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                        <Button onClick={() => setShowDeleteModal(false)} size="sm" variant="outline">
                            Cancel
                        </Button>
                        <Button onClick={confirmDelete} size="sm" variant="destructive">
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            <SuccessMessageModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                message={successMessage}
            />
        </>
    );
};

export default ResourceTable;
