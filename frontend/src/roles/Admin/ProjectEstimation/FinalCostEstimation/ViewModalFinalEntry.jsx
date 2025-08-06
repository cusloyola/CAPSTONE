import React, { useState } from "react";
import { FaDownload, FaPrint } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import "../FinalCostEstimation/Downloads/pdfstyles.css";



const ViewModalFinalEntry = ({
    onClose,
    costData,
    totalAmount,
    markupPercent,
    markupAmount,
    grandTotal,
    projectInfo,
    hideActions = false,

}) => {
    const [showOptions, setShowOptions] = useState(false);
    const { project_name, location, owner, project_manager, date } = projectInfo || {};

    const formatNumber = (value) => {
        const num = parseFloat(value);
        if (!num) return "";
        return Number.isInteger(num)
            ? num.toLocaleString()
            : num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    const exportToPDF = () => {
        const element = document.getElementById("pdf-content");
        if (!element) return;

        // Temporarily add a print-friendly class
        element.classList.add("pdf-mode");

        const opt = {
            margin: 0, // Don't rely on html2pdf margins
            filename: "Cost_Estimate.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            },
            jsPDF: {
                unit: "in",
                format: "a4",
                orientation: "landscape",
            },
        };

        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                element.classList.remove("pdf-mode"); // Remove the class after saving
            });
    };

    const exportToExcel = () => {
        const worksheetData = costData.map((row) => ({
            Description: row.description,
            Quantity: row.quantity,
            Unit: row.unit,
            "Material UC": row.material_uc,
            "Material Amount": row.material_amount,
            "Labor UC": row.labor_uc,
            "Labor Amount": row.labor_amount,
            Total: row.total_with_allowance ?? row.total_amount,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Estimate");
        XLSX.writeFile(workbook, "cost-estimate.xlsx");
    };

    const handleDownload = (type) => {
        setShowOptions(false);
        if (type === "pdf") exportToPDF();
        else if (type === "excel") exportToExcel();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto z-[99999]">
            <div className="fixed inset-0 bg-gray-400/50 backdrop-blur-[32px]" onClick={onClose}></div>

            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl w-[1500px] h-[700px] shadow-xl z-10 flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-6 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                    ✕
                </button>

                <h2 className="text-xl font-semibold p-6">Printable View – Final Estimation</h2>

                <div className="flex-1 overflow-y-auto px-12 py-4" id="pdf-content">
                  
                    <div className="mb-10">
                        <div className="flex justify-between items-center project-header">
                            <img src="/images/assets/drl_construction_address.png" alt="Logo" className="h-[100px] project-image" />

                            <div className="flex gap-5 no-print">

                                <div className="relative group flex flex-col items-center space-y-1">
                                    <button
                                        onClick={() => setShowOptions(!showOptions)}
                                        className="p-3 rounded-full hover:bg-gray-200 transition-all"
                                    >
                                        <FaDownload className="text-gray-700 text-xl" />
                                    </button>
                                    {showOptions && (
                                        <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded shadow p-2 z-10 w-28">
                                            <button
                                                onClick={() => handleDownload("pdf")}
                                                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100"
                                            >
                                                PDF
                                            </button>
                                            <button
                                                onClick={() => handleDownload("excel")}
                                                className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100"
                                            >
                                                Excel
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* Print */}
                                <div className="group flex flex-col items-center space-y-1">
                                    <button
                                        onClick={handlePrint}
                                        className="p-3 rounded-full hover:bg-gray-200 transition-all"
                                    >
                                        <FaPrint className="text-gray-700 text-xl" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1 mt-4">
                            <div className="flex">
                                <span className="w-32 font-semibold project-name">PROJECT</span>
                                <span className="uppercase font-semibold project-name">: &nbsp; {project_name || "—"}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 font-semibold">LOCATION</span>
                                <span className="uppercase font-semibold">: &nbsp; {location || "—"}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 font-semibold">SUBJECT</span>
                                <span className="uppercase font-semibold">: &nbsp; ESTIMATED COST</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 font-semibold">DATE</span>
                                <span className="uppercase font-semibold">: &nbsp; {date || "—"}</span>
                            </div>
                            <div className="flex">
                                <span className="w-32 font-semibold">OWNER</span>
                                <span className="uppercase font-semibold">: &nbsp; {owner || "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="table-auto w-full border border-gray-300 text-sm pdf-table">
                        <thead className="bg-gray-100">
                            <tr>
                                <th rowSpan="2" className="border px-4 py-2 text-center uppercase">No.</th>
                                <th rowSpan="2" className="border px-4 py-2 text-center uppercase">Description/Scope of Works</th>
                                <th rowSpan="2" className="border px-4 py-2 text-center uppercase">Qty</th>
                                <th rowSpan="2" className="border px-4 py-2 text-center uppercase">Unit</th>
                                <th colSpan="2" className="border px-4 py-2 text-center uppercase">Material Cost</th>
                                <th colSpan="2" className="border px-4 py-2 text-center uppercase">Labor Cost</th>
                                <th rowSpan="2" className="border px-4 py-2 text-center uppercase">Amount</th>
                            </tr>
                            <tr>
                                <th className="border px-4 py-2 text-center uppercase">U/C</th>
                                <th className="border px-4 py-2 text-center uppercase">Amount</th>
                                <th className="border px-4 py-2 text-center uppercase">U/C</th>
                                <th className="border px-4 py-2 text-center uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(
                                costData.reduce((acc, row) => {
                                    const type = row.type_name || "Uncategorized";
                                    if (!acc[type]) acc[type] = [];
                                    acc[type].push(row);
                                    return acc;
                                }, {})
                            ).map(([typeName, rows], groupIndex) => {
                                const subtotalTotalAmount = rows.reduce(
                                    (sum, row) => sum + (parseFloat(row.total_amount) || 0),
                                    0
                                );

                                return (
                                    <React.Fragment key={groupIndex}>
                                        <tr className="bg-blue-100 font-semibold">
                                            <td className="border px-4 py-2 text-center">{groupIndex + 1}.</td>
                                            <td colSpan="8" className="border px-4 py-2">{typeName}</td>
                                        </tr>
                                        {rows.map((row, index) => (
                                            <tr key={index}>
                                                <td className="border px-4 py-2"></td>
                                                <td className="border px-4 py-2 pl-6">{row.description}</td>
                                                <td className="border px-2 py-2 text-right">{formatNumber(row.quantity)}</td>
                                                <td className="border px-4 py-2 text-right">{row.unit}</td>
                                                <td className="border px-2 py-2 text-right">{formatNumber(row.material_uc)}</td>
                                                <td className="border px-2 py-2 text-right">{formatNumber(row.material_amount)}</td>
                                                <td className="border px-2 py-2 text-right">{formatNumber(row.labor_uc)}</td>
                                                <td className="border px-2 py-2 text-right">{formatNumber(row.labor_amount)}</td>
                                                <td className="border px-2 py-2 text-right font-bold">
                                                    {formatNumber(row.total_with_allowance ?? row.total_amount)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-100 font-semibold">
                                            <td colSpan="8" className="border px-4 py-2 text-right">Subtotal:</td>
                                            <td className="border px-2 py-2 text-right">{formatNumber(subtotalTotalAmount)}</td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-white-200 text-sm font-semibold">
                            <tr>
                                <td colSpan="9" className="py-2 h-8"></td>
                            </tr>
                            <tr>
                                <td colSpan="8" className="border px-4 py-2 text-right">Total:</td>
                                <td className="border px-2 py-2 text-right">{formatNumber(totalAmount)}</td>
                            </tr>
                            <tr>
                                <td colSpan="8" className="border px-2 py-2 text-right">
                                    Markup ({markupPercent}%):
                                </td>
                                <td className="border px-2 py-2 text-right">{formatNumber(markupAmount)}</td>
                            </tr>
                            <tr className="bg-yellow-200 font-bold">
                                <td colSpan="8" className="border px-2 py-2 text-right">Grand Total:</td>
                                <td className="border px-2 py-2 text-right">{formatNumber(grandTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="mt-20">
                        <h2>PREPARED BY:</h2>
                        <br />
                        <div className="flex">
                            <span className="uppercase font-semibold">{project_manager || "—"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewModalFinalEntry;