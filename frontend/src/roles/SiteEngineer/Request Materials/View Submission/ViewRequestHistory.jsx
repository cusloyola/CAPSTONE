import React, { useEffect, useRef, useState } from "react";
import ViewMaterialRequestModal from "./ViewMaterialRequestModal";
import MaterialRequestPDF from "../../Material Request/MaterialRequestPDF";
import exportMaterialRequestPDF from "../../Material Request/exportMaterialRequest";
import RequestStats from "./RequestStats";
import RequestTableControls from "./RequestTableControls";
import RequestTable from "./RequestTable";
import RequestPagination from "./RequestPagination";
import EditRequestModal from './EditRequestModal'; // Assuming it's in the same folder
import { FaEye, FaEdit } from 'react-icons/fa'; // FaEdit is the edit icon


// Column definitions moved outside the component to avoid re-creation
const COLUMNS = [
    { key: "project_name", label: "Project Name" },
    { key: "urgency", label: "Urgency" },
    { key: "notes", label: "Additional Notes" },
    { key: "request_date", label: "Request Date", format: (dateString) => new Date(dateString).toLocaleDateString() },
    {
        key: "status", label: "Status", customRender: (req) => (
            <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${req.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : req.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
            >
                {req.status}
            </span>
        )
    },
];

const ViewRequestHistory = () => {
    // State management
    const [requests, setRequests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requestedMaterials, setRequestedMaterials] = useState([]);

    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRefs = useRef({});
    const [openExportMenu, setOpenExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const pdfRef = useRef();

    // Filtering & Pagination State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterMonth, setFilterMonth] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [selectAll, setSelectAll] = useState(false);


    // ...existing state
    const [showEditModal, setShowEditModal] = useState(false);


    // Close action menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.entries(menuRefs.current).forEach(([id, ref]) => {
                if (openMenuId === id && ref && !ref.contains(event.target)) {
                    setOpenMenuId(null);
                }
            });
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenuId]);

    // Fetch data from the backend
    // Inside ViewRequestHistory.jsx
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/request-materials/history");
                if (!response.ok) throw new Error("Failed to fetch history");
                const data = await response.json();

                // ADD THIS LOG
                console.log("FRONT-END: Data received from API:", data);

                // Process each request...
                // Find this block in your useEffect hook
                const processedData = data.map(request => {
                    const status = request.is_approved === 1 ? 'approved' : request.is_approved === 2 ? 'rejected' : 'pending';

                    // CHANGE THIS LINE: Remove JSON.parse()
                    // Old: const items = request.items ? JSON.parse(request.items) : [];
                    const items = request.items || []; // Just use the array directly, or an empty array if null

                    return { ...request, status, items };
                });

                // ADD THIS LOG
                console.log("FRONT-END: Processed data:", processedData);

                setRequests(Array.isArray(processedData) ? processedData : []);
            } catch (err) {
                console.error("Error fetching history:", err);
                setRequests([]);
            }
        };
        fetchHistory();
    }, []);

    // ...existing action handlers
    const handleEditRequest = (request) => {
        // Only allow editing if the request is pending
        if (request.status === 'pending') {
            setSelectedRequest(request);
            setShowEditModal(true);
        } else {
            alert('Only pending requests can be edited.');
        }
    };

     const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setRequestedMaterials(request.items || []);
        setShowModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedRequest(null);
    };

    const handleSaveEdit = async (editedRequest) => {
        try {
            // Placeholder for your backend API call to update the request
            const response = await fetch(`http://localhost:5000/api/request-materials/${editedRequest.request_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedRequest),
            });

            if (!response.ok) {
                throw new Error("Failed to update request.");
            }

            // On success, update the local state to reflect the changes
            const updatedRequest = await response.json();
            setRequests(prev => prev.map(req =>
                req.request_id === updatedRequest.request_id ? updatedRequest : req
            ));

            alert('Request updated successfully!');
            handleCloseEditModal();

        } catch (err) {
            console.error('Failed to save changes:', err);
            alert('Failed to save changes. Please try again.');
        }
    };

    // Memoize filtered and paginated data for performance
    const filteredRequests = requests
        .filter((r) => {
            const requestDate = new Date(r.request_date);
            const matchQuery =
                r.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.notes?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = filterStatus === "all" || r.status === filterStatus;
            const matchMonth = filterMonth === "" || requestDate.getMonth() === Number(filterMonth);
            const matchYear = filterYear === "" || requestDate.getFullYear() === Number(filterYear);
            return matchQuery && matchStatus && matchMonth && matchYear;
        })
        .sort((a, b) => new Date(b.request_date) - new Date(a.request_date));

    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);

    // Checkbox logic
    useEffect(() => {
        setSelectAll(selectedRequests.length > 0 && selectedRequests.length === currentRequests.length);
    }, [selectedRequests, currentRequests]);

    const handleSelectAll = () => {
        const allIds = selectAll ? [] : currentRequests.map(r => r.request_id);
        setSelectedRequests(allIds);
    };

    const handleCheckboxChange = (id) => {
        setSelectedRequests(prev => prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]);
    };

    // Action handlers
    const handleAction = (request, type) => {
        if (type === "view") {
            setSelectedRequest(request);
            setRequestedMaterials(request.items || []);
            setShowModal(true);
        }
        setOpenMenuId(null);
    };

    const handleExport = () => {
        if (selectedRequests.length === 0) {
            alert("Please select at least one request to export.");
            return;
        }
        setIsExporting(true);
        setOpenExportMenu(false);

        const requestsToExport = filteredRequests.filter(r => selectedRequests.includes(r.request_id));

        setTimeout(() => {
            exportMaterialRequestPDF(pdfRef, requestsToExport);
            setIsExporting(false);
        }, 100);
    };

    const handleEntriesChange = (e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    return (
        <div className="min-h-screen p-6 md:p-8 bg-gray-100">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-10 text-gray-800">Material Request History</h1>

                <RequestStats requests={requests} />

                <div className="bg-white p-6 mt-6 md:p-8 rounded-md shadow-lg">
                    <RequestTableControls
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        filterMonth={filterMonth}
                        setFilterMonth={setFilterMonth}
                        filterYear={filterYear}
                        setFilterYear={setFilterYear}
                        requests={requests}
                        handleExport={handleExport}
                        openExportMenu={openExportMenu}
                        setOpenExportMenu={setOpenExportMenu}
                    />

                    <RequestTable
                        columns={COLUMNS}
                        currentRequests={currentRequests}
                        selectedRequests={selectedRequests}
                        selectAll={selectAll}
                        handleSelectAll={handleSelectAll}
                        handleCheckboxChange={handleCheckboxChange}
                        handleViewDetails={handleViewDetails} // <-- Add this
                        handleEditRequest={handleEditRequest} // <-- Add this
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        menuRefs={menuRefs}
                    />

                    <RequestPagination
                        indexOfFirst={indexOfFirst}
                        indexOfLast={indexOfLast}
                        filteredRequests={filteredRequests}
                        entriesPerPage={entriesPerPage}
                        setEntriesPerPage={handleEntriesChange}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        handlePrevious={handlePrevious}
                        handleNext={handleNext}
                    />
                </div>
            </div>

            {isExporting && (
                <div className="fixed top-0 left-0 w-full h-full bg-white z-[100] p-4 hidden">
                    <MaterialRequestPDF ref={pdfRef} requests={filteredRequests.filter(r => selectedRequests.includes(r.request_id))} />
                </div>
            )}

            {showModal && (
                <ViewMaterialRequestModal
                    report={selectedRequest}
                    materials={requestedMaterials}
                    onClose={() => setShowModal(false)}
                />
            )}
            {showEditModal && (
                <EditRequestModal
                    show={showEditModal}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveEdit}
                    request={selectedRequest}
                />
            )}

        </div>
    );
};

export default ViewRequestHistory;