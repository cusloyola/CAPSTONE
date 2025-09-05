import React, { useRef, useState, useEffect } from "react";
import { FaTrash, FaEllipsisV, FaPrint } from "react-icons/fa";
import { StatusBadge } from "../../Admin/Site Report/dsrButtons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const IncidentReportTable = ({
  reports,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  selectedReports,
  setSelectedReports,
  selectAll,
  setSelectAll,
  onAdd,
  fetchReports,
  onAction, // view/edit handler
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  const reportRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!openMenuId) return;
      const menuEl = menuRefs.current[openMenuId];
      if (menuEl && !menuEl.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const columns = [
    {
      key: "report_date",
      label: "Date",
      format: (value) => {
        if (!value) return "N/A";
        const d = new Date(value);
        return isNaN(d)
          ? "Invalid Date"
          : d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
      },
    },
    { key: "project_name", label: "Project" },
    { key: "description", label: "Description" },
    { key: "full_name", label: "Reported By" },
    {
      key: "status",
      label: "Status",
      customRender: (report) => <StatusBadge status={report.status} />,
    },];

  const filteredReports = reports
    .filter((r) => {
      const incidentDate = new Date(r.report_date);
      const matchQuery =
        r.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.incident_type?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      const matchMonth =
        filterMonth === "" || incidentDate.getMonth() === Number(filterMonth);
      const matchYear =
        filterYear === "" || incidentDate.getFullYear() === Number(filterYear);
      return matchQuery && matchStatus && matchMonth && matchYear;
    })
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date));

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentReports = filteredReports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredReports.length / entriesPerPage);

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleBulkDelete = () => {
    if (selectedReports.length === 0) {
      alert("Please select at least one incident to delete.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setLoadingDelete(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/incidentReports/bulk-delete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedReports }),
        }
      );
      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok) {
        alert(data?.error || "Failed to delete incidents");
        return;
      }
      await fetchReports();
      setSelectedReports([]);
      setSelectAll(false);
      setShowConfirm(false);
    } catch (error) {
      console.error("❌ Bulk delete error:", error);
      alert("Error deleting incidents");
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleClick = (report, type) => {
    onAction(report, type);
    setOpenMenuId(null);
  };

  const handleSelectReport = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReports([]);
    } else {
      const allIds = filteredReports.map((r) => r.incident_report_id);
      setSelectedReports(allIds);
    }
    setSelectAll(!selectAll);
  };

  const getBase64Image = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  };

  const handlePrint = async () => {
    if (selectedReports.length === 0) {
      alert("Please select at least one incident to print.");
      return;
    }

    const reportsToPrint = reports.filter((r) =>
      selectedReports.includes(r.incident_report_id)
    );

    const doc = new jsPDF();

    for (let i = 0; i < reportsToPrint.length; i++) {
      const report = reportsToPrint[i];
      if (i > 0) doc.addPage();

      const headerImg = new Image();
      headerImg.src = "/images/assets/drl_construction_address.png";

      await new Promise((resolve) => {
        headerImg.onload = () => {
          doc.addImage(headerImg, "PNG", 15, 5, 180, 25);
          resolve();
        };
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Incident Report", 105, 40, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 48, {
        align: "center",
      });

      autoTable(doc, {
        startY: 60,
        body: [
          ["Date:", new Date(report.report_date).toLocaleDateString("en-US")],
          ["Project:", report.project_name || "N/A"],
          ["Reported By:", report.full_name || "N/A"],
          ["Status:", report.status || "N/A"],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          lineColor: 0,
          halign: "left",
        },
        styles: {
          fontSize: 11,
          cellPadding: 3,
          textColor: 0,
          lineColor: 0,
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 40 },
          1: { cellWidth: 140 },
        },
      });

      if (report.description) {
        let yPos = doc.lastAutoTable.finalY + 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Description:", 14, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const splitDescription = doc.splitTextToSize(report.description, 180);
        doc.text(splitDescription, 14, yPos);
      }

      // Add incident images
      const images = [report.image1, report.image2, report.image3, report.image4].filter(Boolean);
      if (images.length > 0) {
        let imageYPos = report.description 
          ? doc.lastAutoTable.finalY + 40 + (doc.splitTextToSize(report.description, 180).length * 4)
          : doc.lastAutoTable.finalY + 20;

        // Check if we need a new page for images (more conservative check)
        const imageSize = 80;
        const verticalSpacing = 25;
        const totalImageHeight = (2 * imageSize) + verticalSpacing + 40; // 2 rows + spacing + labels
        
        if (imageYPos + totalImageHeight > 280) {
          doc.addPage();
          imageYPos = 30;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Incident Images:", 14, imageYPos);
        imageYPos += 20;

        // Enhanced grid configuration for perfect 2x2 layout
        const pageWidth = doc.internal.pageSize.getWidth() - 28; // Subtract left and right margins
        const horizontalSpacing = (pageWidth - (2 * imageSize)) / 3; // Space between and around images

        // Calculate positions for 2x2 grid
        const positions = [
          // Row 1
          { x: 14 + horizontalSpacing, y: imageYPos }, // Top left
          { x: 14 + horizontalSpacing + imageSize + horizontalSpacing, y: imageYPos }, // Top right
          // Row 2  
          { x: 14 + horizontalSpacing, y: imageYPos + imageSize + verticalSpacing }, // Bottom left
          { x: 14 + horizontalSpacing + imageSize + horizontalSpacing, y: imageYPos + imageSize + verticalSpacing } // Bottom right
        ];

        // Process first 4 images on current page
        for (let j = 0; j < Math.min(images.length, 4); j++) {
          const pos = positions[j];
          
          try {
            const imageUrl = `http://localhost:5000/${images[j]}`;
            const base64Image = await getBase64Image(imageUrl);
            
            // Add image with fixed square dimensions
            doc.addImage(base64Image, "JPEG", pos.x, pos.y, imageSize, imageSize);
            
            // Add centered label below image
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(`Image ${j + 1}`, pos.x + (imageSize / 2), pos.y + imageSize + 10, { align: "center" });
            
          } catch (error) {
            console.warn(`Could not load image ${j + 1}:`, error);
            
            // Draw placeholder rectangle with border
            doc.setDrawColor(150, 150, 150);
            doc.setFillColor(240, 240, 240);
            doc.rect(pos.x, pos.y, imageSize, imageSize, 'FD');
            
            // Add placeholder text
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(120, 120, 120);
            doc.text("Image Not", pos.x + (imageSize / 2), pos.y + (imageSize / 2) - 5, { align: "center" });
            doc.text("Available", pos.x + (imageSize / 2), pos.y + (imageSize / 2) + 5, { align: "center" });
            doc.setTextColor(0, 0, 0); // Reset text color
            
            // Add centered label below placeholder
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(`Image ${j + 1}`, pos.x + (imageSize / 2), pos.y + imageSize + 10, { align: "center" });
          }
        }

        // Handle more than 4 images - continue on next page
        if (images.length > 4) {
          doc.addPage();
          imageYPos = 30;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text("Incident Images (continued):", 14, imageYPos);
          imageYPos += 20;

          // Recalculate positions for new page
          const newPositions = [
            { x: 14 + horizontalSpacing, y: imageYPos },
            { x: 14 + horizontalSpacing + imageSize + horizontalSpacing, y: imageYPos },
            { x: 14 + horizontalSpacing, y: imageYPos + imageSize + verticalSpacing },
            { x: 14 + horizontalSpacing + imageSize + horizontalSpacing, y: imageYPos + imageSize + verticalSpacing }
          ];

          for (let j = 4; j < Math.min(images.length, 8); j++) {
            const gridIndex = j - 4; // Reset index for second page
            const pos = newPositions[gridIndex];

            try {
              const imageUrl = `http://localhost:5000/${images[j]}`;
              const base64Image = await getBase64Image(imageUrl);
              doc.addImage(base64Image, "JPEG", pos.x, pos.y, imageSize, imageSize);
              
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9);
              doc.text(`Image ${j + 1}`, pos.x + (imageSize / 2), pos.y + imageSize + 10, { align: "center" });
              
            } catch (error) {
              console.warn(`Could not load image ${j + 1}:`, error);
              doc.setDrawColor(150, 150, 150);
              doc.setFillColor(240, 240, 240);
              doc.rect(pos.x, pos.y, imageSize, imageSize, 'FD');
              
              doc.setFont("helvetica", "normal");
              doc.setFontSize(10);
              doc.setTextColor(120, 120, 120);
              doc.text("Image Not", pos.x + (imageSize / 2), pos.y + (imageSize / 2) - 5, { align: "center" });
              doc.text("Available", pos.x + (imageSize / 2), pos.y + (imageSize / 2) + 5, { align: "center" });
              doc.setTextColor(0, 0, 0);
              
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9);
              doc.text(`Image ${j + 1}`, pos.x + (imageSize / 2), pos.y + imageSize + 10, { align: "center" });
            }
          }
        }
      }

      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Page ${i + 1} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 20,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
    }

    doc.save("incident-reports.pdf");
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-10">Incident Reports</h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
          <div className="bg-gradient-to-l from-blue-500 to-blue-800 p-5 rounded-2xl shadow space-y-2">
            <p className="text-md text-white font-semibold">Total Reports</p>
            <h2 className="text-4xl font-bold text-white">{reports.length}</h2>
          </div>
          <div className="bg-gradient-to-l from-yellow-500 to-yellow-600 p-5 rounded-2xl shadow space-y-2">
            <p className="text-md text-white font-semibold">Pending Reports</p>
            <h2 className="text-4xl font-bold text-white">
              {reports.filter((r) => r.status === "pending").length}
            </h2>
          </div>
          <div className="bg-gradient-to-l from-green-500 to-green-600 p-5 rounded-2xl shadow space-y-2">
            <p className="text-md text-white font-semibold">Approved Reports</p>
            <h2 className="text-4xl font-bold text-white">
              {reports.filter((r) => r.status === "approved").length}
            </h2>
          </div>
          <div className="bg-gradient-to-l from-red-500 to-red-700 p-5 rounded-2xl shadow space-y-2">
            <p className="text-md text-white font-semibold">Rejected Reports</p>
            <h2 className="text-4xl font-bold text-white">
              {reports.filter((r) => r.status === "rejected").length}
            </h2>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="flex flex-wrap gap-4 mt-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded w-48"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="border p-2 rounded w-48"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded w-48"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {[...new Set(reports.map((r) => new Date(r.report_date).getFullYear()))]
              .sort((a, b) => b - a)
              .map((y, i) => (
                <option key={i} value={y}>
                  {y}
                </option>
              ))}
          </select>

          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-64 h-10"
          />
        </div>

        {/* Table */}
        <div className="max-w-7xl mx-auto bg-white p-6 mt-6 md:p-8 rounded-md shadow-lg">
          <div className="mb-6 pb-2 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Incident Reports Overview
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm flex items-center gap-2 disabled:opacity-50"
                disabled={selectedReports.length === 0}
              >
                <FaTrash />
              </button>
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm flex items-center gap-2 disabled:opacity-50"
                disabled={selectedReports.length === 0}
              >
                <FaPrint />
              </button>
              <button
                onClick={onAdd}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                + Add Incident
              </button>
            </div>
          </div>

          <div className="overflow-visible shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedReports.length === currentReports.length &&
                        currentReports.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentReports.map((report) => (
                  <tr
                    key={report.incident_report_id}
                    ref={(el) =>
                    (reportRefs.current[`table-${report.incident_report_id}`] =
                      el)
                    }
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.incident_report_id)}
                        onChange={() => handleSelectReport(report.incident_report_id)}
                      />
                    </td>
                    {columns.map((col, i) => (
                      <td
                        key={i}
                        className="px-6 py-4 text-sm text-gray-700 whitespace-pre-wrap"
                      >
                        {col.customRender 
                          ? col.customRender(report)
                          : col.format
                          ? col.format(report[col.key])
                          : report[col.key]}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm relative">
                      <div
                        className="relative inline-block text-left overflow-visible"
                        ref={(el) =>
                          (menuRefs.current[report.incident_report_id] = el)
                        }
                      >
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === report.incident_report_id
                                ? null
                                : report.incident_report_id
                            )
                          }
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FaEllipsisV />
                        </button>
                        {openMenuId === report.incident_report_id && (
                          <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg">
                            <div className="py-1">
                              <button
                                onClick={() => handleClick(report, "view")}
                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                              >
                                View
                              </button>
                              {["pending"].includes(
                                report.status?.toLowerCase()
                              ) && (
                                  <button
                                    onClick={() => handleClick(report, "edit")}
                                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                  >
                                    Edit
                                  </button>
                                )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0 px-4 pb-4">
              <div className="text-sm text-gray-600">
                Showing{" "}
                {filteredReports.length === 0
                  ? "0"
                  : `${indexOfFirst + 1} to ${Math.min(
                    indexOfLast,
                    filteredReports.length
                  )}`}{" "}
                of {filteredReports.length} entries
              </div>
              <div className="space-x-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border rounded ${currentPage === 1
                    ? "bg-gray-200 text-gray-400"
                    : "bg-white hover:bg-gray-100"
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 border rounded ${currentPage === totalPages || totalPages === 0
                    ? "bg-gray-200 text-gray-400"
                    : "bg-white hover:bg-gray-100"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Delete Modal */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-bold">{selectedReports.length}</span>{" "}
                incident(s)? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                  disabled={loadingDelete}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  disabled={loadingDelete}
                >
                  {loadingDelete ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportTable;
