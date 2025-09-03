import React, { useEffect, useState, useRef } from "react";
import PageMeta from '../../../../components/common/PageMeta';
import MaterialRequestPDF from "../../../SiteEngineer/Material Request/MaterialRequestPDF";
import exportMaterialRequestPDF from "../../../SiteEngineer/Material Request/exportMaterialRequest";
import { fetchHistory, approveRequest, rejectRequest } from '../../../../api/materialRequests';
import MaterialRequestStats from "./MaterialRequestStats";
import FilterAndSearch from "./FilterAndSearch";
import MaterialRequestTable from "./MaterialRequestTable";
import TablePagination from "./TablePagination";
import ModalManager from "./ModalManager";

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


const groupRequests = (data) => {
  return data.map(request => {
    // If backend already sent items, just keep them
    if (Array.isArray(request.items) && request.items.length > 0) {
      return request;
    }

    // Otherwise, group manually (fallback)
    return {
      ...request,
      items: request.material_id
        ? [{
          material_id: request.material_id,
          material_name: request.material_name,
          request_quantity: request.request_quantity,
          unit: request.unit,
        }]
        : []
    };
  });
};

const MaterialRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [columns] = useState(COLUMNS);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [selectedRequests, setSelectedRequests] = useState([]);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);
  const [requestToReject, setRequestToReject] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [openExportMenu, setOpenExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef();

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);
  const [viewMaterials, setViewMaterials] = useState([]);


const [selectedRequest, setSelectedRequest] = useState(null);
const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    const getHistory = async () => {
      const result = await fetchHistory();
      if (result.success) {
        const groupedData = groupRequests(result.data);
        setRequests(groupedData);
      } else {
        setRequests([]);
        setErrorMessage(result.error);
        setShowErrorModal(true);
      }
    };
    getHistory();
  }, []);

  const handleUpdateRequests = async () => {
    const result = await fetchHistory();
    if (result.success) {
      const groupedData = groupRequests(result.data);
      setRequests(groupedData);
    } else {
      setErrorMessage(result.error);
      setShowErrorModal(true);
    }
  };

  // Memoized filtered and paginated data
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

  // Handlers
  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleSelectAll = () => {
    const allIds = currentRequests.map(r => r.request_id);
    setSelectedRequests(selectedRequests.length === allIds.length ? [] : allIds);
  };

  const handleCheckboxChange = (id) => {
    setSelectedRequests(prev => prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]);
  };

  const handleExport = () => {
    if (selectedRequests.length === 0) {
      alert("Please select at least one request to export.");
      return;
    }
    setIsExporting(true);
    setOpenExportMenu(false);
    setTimeout(() => {
      exportMaterialRequestPDF(pdfRef);
      setIsExporting(false);
    }, 100);
  };

const handleAction = (request, type) => {
  console.log("Action triggered:", type, request);
  setOpenMenuId(null);

  if (type === "approve") {
    setRequestToApprove(request.request_id);
    setShowApproveModal(true);
  } else if (type === "reject") {
    setRequestToReject(request.request_id);
    setShowRejectModal(true);
  } else if (type === "view") {
    setViewRequest(request);
    setViewMaterials(request.items || []);
    setShowViewModal(true); // opens the admin view modal
  }
};

  // Approval and Rejection Logic
  const handleApprove = async () => {
    const result = await approveRequest(requestToApprove);
    setShowApproveModal(false);
    if (result.success) {
      setSuccessMessage('Material request approved successfully.');
      setShowSuccessModal(true);
      handleUpdateRequests();
    } else {
      setErrorMessage(result.error || 'Failed to approve the request.');
      setShowErrorModal(true);
    }
  };

  const handleReject = async (reason) => {
    const result = await rejectRequest(requestToReject, reason);
    setShowRejectModal(false);
    if (result.success) {
      setSuccessMessage('Material request rejected successfully.');
      setShowSuccessModal(true);
      handleUpdateRequests();
    } else {
      setErrorMessage(result.error || 'Failed to reject the request.');
      setShowErrorModal(true);
    }
  };

  return (
    <>
      <PageMeta title="Material Request Management" description="Manage all material requests submitted" />
      <div className="min-h-screen md:p-8">
        <div className="max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold mb-10 text-gray-800">Material Request Management</h1>
            <MaterialRequestStats requests={requests} />
          </div>
          <div className="max-w-7xl mx-auto bg-white p-6 mt-6 md:p-8 rounded-md shadow-lg">
            <div className="mb-6 pb-2 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Request Overview</h2>
              <div className="relative">
                <button onClick={() => setOpenExportMenu(!openExportMenu)} className="px-4 py-2 border border-black bg-gray-500 text-white rounded hover:bg-white hover:text-black">
                  Export to PDF
                </button>
                {openExportMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <button onClick={handleExport} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
                      Export Selected
                    </button>
                  </div>
                )}
              </div>
            </div>
            <FilterAndSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterMonth={filterMonth}
              setFilterMonth={setFilterMonth}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
              requests={requests}
            />
            <MaterialRequestTable
              currentRequests={currentRequests}
              columns={columns}
              selectedRequests={selectedRequests}
              handleSelectAll={handleSelectAll}
              handleCheckboxChange={handleCheckboxChange}
              handleAction={handleAction}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
            />

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              indexOfFirst={indexOfFirst}
              indexOfLast={indexOfLast}
              filteredRequests={filteredRequests}
              entriesPerPage={entriesPerPage}
              handleEntriesChange={handleEntriesChange}
              handlePrevious={handlePrevious}
              handleNext={handleNext}
            />
            {isExporting && (
              <div className="absolute top-0 left-0 w-full z-[100] p-4 bg-white shadow-xl">
                <MaterialRequestPDF ref={pdfRef} requests={filteredRequests.filter(r => selectedRequests.includes(r.request_id))} />
              </div>
            )}
          </div>
        </div>
      </div>
      <ModalManager
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        viewRequest={viewRequest}
        viewMaterials={viewMaterials}
        showApproveModal={showApproveModal}
        setShowApproveModal={setShowApproveModal}
        handleApprove={handleApprove}
        showRejectModal={showRejectModal}
        setShowRejectModal={setShowRejectModal}
        handleReject={handleReject}
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        successMessage={successMessage}
        showErrorModal={showErrorModal}
        setShowErrorModal={setShowErrorModal}
        errorMessage={errorMessage}
      />
    </>
  );
};

export default MaterialRequestManagement;