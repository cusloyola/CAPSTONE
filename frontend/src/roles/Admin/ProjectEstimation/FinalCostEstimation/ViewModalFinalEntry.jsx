import React, { useState, useRef } from "react";
import { FaDownload, FaPrint } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";

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
    const pdfContentRef = useRef();

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
    if (!costData || costData.length === 0) return;

    const ws_data = [];

    // --- Helper to format numbers ---
    const formatNum = (value) => {
        const num = parseFloat(value);
        if (!num) return "";
        return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // --- Project info ---
    ws_data.push(["PROJECT:", project_name || "—"]);
    ws_data.push(["LOCATION:", location || "—"]);
    ws_data.push(["SUBJECT:", "ESTIMATED COST"]);
    ws_data.push(["DATE:", date || "—"]);
    ws_data.push(["OWNER:", owner || "—"]);
    ws_data.push([]);

    // --- Table headers ---
    ws_data.push([
        "No.",
        "Description/Scope of Works",
        "Qty",
        "Material", "", // merged
        "Labor", "", // merged
        "Amount",
    ]);
    ws_data.push([
        "", "", "", // No., Description, Qty
        "U/C", "Amount", // Material
        "U/C", "Amount", // Labor
        "", // Total
    ]);

    // Group rows by type_name
    const groupedData = costData.reduce((acc, row) => {
        const type = row.type_name || "Uncategorized";
        if (!acc[type]) acc[type] = [];
        acc[type].push(row);
        return acc;
    }, {});

    let counter = 1;

    Object.entries(groupedData).forEach(([typeName, rows]) => {
        // Category row (blue)
        ws_data.push([counter++, typeName]);
        rows.forEach((row) => {
            ws_data.push([
                "",
                row.description,
                row.quantity || "",
                formatNum(row.material_uc),
                formatNum(row.material_amount),
                formatNum(row.labor_uc),
                formatNum(row.labor_amount),
                formatNum(row.total_with_allowance ?? row.total_amount),
            ]);
        });

        // Subtotal row
        const subtotal = rows.reduce((sum, row) => sum + (parseFloat(row.total_amount) || 0), 0);
        ws_data.push(["", "", "", "", "", "",`Subtotal(PHP)`, formatNum(subtotal)]);
    });

    // Total, Markup, Grand Total rows
    ws_data.push([]);
    ws_data.push(["", "", "", "", "", "", "Total", formatNum(totalAmount)]);
    ws_data.push(["", "", "", "", "", "",  `Markup (${markupPercent}%)`, formatNum(markupAmount)]);
    ws_data.push(["", "", "", "", "", "", "Grand Total(PHP)", formatNum(grandTotal)]);
    ws_data.push([]);
    ws_data.push(["Prepared By:", project_manager || "—"]);

    // --- Create worksheet ---
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Merge headers and project info
    ws['!merges'] = [
        { s: { r: 6, c: 3 }, e: { r: 6, c: 4 } }, // Material
        { s: { r: 6, c: 5 }, e: { r: 6, c: 6 } }, // Labor
        { s: { r: 0, c: 1 }, e: { r: 0, c: 7 } }, // Project name
        { s: { r: 1, c: 1 }, e: { r: 1, c: 7 } }, // Location
        { s: { r: 2, c: 1 }, e: { r: 2, c: 7 } }, // Subject
        { s: { r: 3, c: 1 }, e: { r: 3, c: 7 } }, // Date
        { s: { r: 4, c: 1 }, e: { r: 4, c: 7 } }, // Owner
    ];

    // Column widths
    ws['!cols'] = [
        { wch: 15 },   // No.
        { wch: 40 },  // Description
        { wch: 10 },  // Qty
        { wch: 12 },  // Material U/C
        { wch: 15 },  // Material Amount
        { wch: 20 },  // Labor U/C (for labels like Subtotal)
        { wch: 15 },  // Labor Amount
        { wch: 15 },  // Total
    ];

    // Row styles
    ws['!rows'] = ws_data.map((row, idx) => {
        const rowStyle = {};

        // Table headers centered
        if (idx === 6 || idx === 7) {
            rowStyle.hpt = 25;
            rowStyle.alignment = { horizontal: "center", vertical: "center" };
        } else {
            // Right-align numeric columns
            rowStyle.alignment = {
                horizontal: "left",
                vertical: "center",
            };
        }

        // Category rows (blue)
        if (typeof row[1] === "string" && groupedData[row[1]]) {
            rowStyle.fill = { fgColor: { rgb: "D0E4FF" } };
            rowStyle.font = { bold: true };
        }

        // Subtotal, Total, Markup, Grand Total rows bold
        if (row[5] && ["Subtotal", "Total", "Markup", "Grand Total"].some(label => row[5].includes(label))) {
            rowStyle.font = { bold: true };
        }

        // Grand Total highlight yellow
        if (row[5] && row[5].includes("Grand Total")) {
            rowStyle.fill = { fgColor: { rgb: "FFF3B0" } };
        }

        return rowStyle;
    });

    // --- Save workbook ---
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estimate");
    XLSX.writeFile(wb, "cost-estimate.xlsx");
};


    const handleDownload = (type) => {
        setShowOptions(false);
        if (type === "pdf") exportToPDF();
        else if (type === "excel") exportToExcel();
    };

    const handlePrint = useReactToPrint({
        content: () => pdfContentRef.current,
        documentTitle: "Final_Estimation",
        onAfterPrint: () => console.log("Print success"),
    });


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


                <div className="flex-1 overflow-y-auto px-12 py-4" id="pdf-content" >

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