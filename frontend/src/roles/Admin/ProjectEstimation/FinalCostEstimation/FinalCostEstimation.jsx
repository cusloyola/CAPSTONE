import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaFileExport } from "react-icons/fa";
import AddModalFinalEntry from "./AddModalFinalEntry";
import ViewModalFinalEntry from "./ViewModalFinalEntry";
import { saveFinalEstimation } from "../../../../api/finalCostEstimateApi";

const FinalCostEstimation = () => {
    const { proposal_id } = useParams();
    const [costData, setCostData] = useState([]);
    const [showExport, setShowExport] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [projectInfo, setProjectInfo] = useState({});


    const [searchTerm, setSearchTerm] = useState("");
    const [entriesCount, setEntriesCount] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState("All");


    const fetchCostData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/cost-estimation/proposal/${proposal_id}/final-cost`);
            if (!res.ok) throw new Error("Failed to fetch cost data.");

            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                console.warn("No cost data available.");
                setCostData([]); // clear if needed
                return;
            }

            // ✅ use the first row to extract project info
            const projectInfoRow = data[0];
            setProjectInfo({
                project_name: projectInfoRow.project_name,
                location: projectInfoRow.location,
                owner: projectInfoRow.client_name,
                subject: projectInfoRow.description,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                }),
                project_manager: projectInfoRow.projectManager,
            });

            const adjusted = data.map((row) => {
                const quantity = parseFloat(row.quantity) || 0;
                const laborUC = parseFloat(row.labor_uc) || 0;
                const laborAmount = laborUC * quantity;

                // Reinforcement with rebar total cost
                if (row.type_name === "Reinforcement" && row.mto_rebar_total_cost !== null && !isNaN(row.mto_rebar_total_cost)) {
                    const materialAmount = parseFloat(row.mto_rebar_total_cost);
                    const materialUC = quantity ? materialAmount / quantity : 0;

                    return {
                        ...row,
                        material_amount: materialAmount,
                        material_uc: materialUC,
                        labor_amount: laborAmount,
                        labor_uc: laborUC,
                        total_amount: materialAmount + laborAmount,
                    };
                }

                // Generic MTO override
                if (row.mto_total_cost !== null && !isNaN(row.mto_total_cost)) {
                    const materialAmount = parseFloat(row.mto_total_cost);
                    const materialUC = quantity ? materialAmount / quantity : 0;

                    return {
                        ...row,
                        material_amount: materialAmount,
                        material_uc: materialUC,
                        labor_amount: laborAmount,
                        labor_uc: laborUC,
                        total_amount: materialAmount + laborAmount,
                    };
                }

                // Default fallback
                return {
                    ...row,
                    labor_amount: laborAmount,
                    labor_uc: laborUC,
                    total_amount: (parseFloat(row.material_amount) || 0) + laborAmount,
                };
            });

            setCostData(adjusted);
        } catch (err) {
            console.error("❌ Error fetching cost data:", err);
        }
    };



    useEffect(() => {
        fetchCostData();
    }, [proposal_id]);

    const formatNumber = (value) => {
        const num = parseFloat(value);
        if (!num) return "";

        return Number.isInteger(num)
            ? num.toLocaleString(undefined, { useGrouping: true })
            : num.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
                useGrouping: true,
            });
    };


    const totalAmount = costData.reduce(
        (sum, row) => sum + (parseFloat(row.total_with_allowance ?? row.total_amount) || 0),
        0
    );

    const markupPercent = parseFloat(costData[0]?.markup_percent) || 0;
    const markupAmount = totalAmount * (markupPercent / 100);
    const grandTotal = totalAmount + markupAmount;

 const handleSaveEstimation = async () => {
  try {
    await saveFinalEstimation(
      proposal_id,
      costData,
      totalAmount,
      markupPercent,
      markupAmount,
      grandTotal
    );
    alert("Final estimation saved successfully!");
  } catch (err) {
    if (err.message.includes("already exists")) {
      alert("Warning: Final estimation for this proposal already exists. Delete it first to save again.");
    } else {
      alert("Something went wrong while saving.");
    }
  }
};


    let filteredData = costData;

    if (typeFilter !== "All") {
        filteredData = filteredData.filter(row => row.type_name === typeFilter);
    }

    if (searchTerm.trim() !== "") {
        filteredData = filteredData.filter(row =>
            (row.description || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const startIndex = (currentPage - 1) * entriesCount;
    const paginatedData =
        entriesCount === filteredData.length
            ? filteredData
            : filteredData.slice(startIndex, startIndex + entriesCount);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mt-6 mb-6">
                <p className="text-2xl font-semibold">Final Cost Estimation</p>
                <button
                    onClick={() => setShowViewModal(true)}
                    className="text-white text-gray-900 px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-900"
                >
                    Preview
                </button>

            </div>

            {costData.length > 0 ? (
                <>


                    <div>
                        <hr />

                        <div className="mt-12">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="border p-2 rounded"
                            >
                                <option value="All">All Types</option>
                                {[...new Set(costData.map(row => row.type_name))].map((type, idx) => (
                                    <option key={idx} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">

                        <div className="flex items-center space-x-2">
                            <label htmlFor="entries" className="text-sm text-gray-700">Show</label>
                            <select
                                id="entries"
                                value={entriesCount}
                                onChange={(e) =>
                                    setEntriesCount(e.target.value === "all" ? filteredData.length : Number(e.target.value))
                                }
              className="mx-2 border p-1 rounded w-14 mt-2  "
                            >
                                {[10, 25, 50, 100,].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                                <option value="all">All</option>
                            </select>
                            <span className="text-sm text-gray-700">entries</span>
                        </div>

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border p-2 rounded w-64"
                        />
                    </div>


                    <table className="table-auto w-full border border-gray-300 text-sm ">
                        <thead className="bg-gray-100">
                            <tr>
                                <th rowSpan="2" className="border px-4 py-2 text-left">No.</th>
                                <th rowSpan="2" className="border px-4 py-2 text-left">Description/Scope of Works</th>
                                <th rowSpan="2" className="border px-4 py-2 text-left">Quantity</th>
                                <th rowSpan="2" className="border px-4 py-2 text-left">Unit</th>
                                <th colSpan="2" className="border px-4 py-2 text-center">Material Cost</th>
                                <th colSpan="2" className="border px-4 py-2 text-center">Labor Cost</th>
                                <th rowSpan="2" className="border px-4 py-2 text-left"> Amount</th>
                            </tr>
                            <tr>
                                <th className="border px-4 py-2 text-left">U/C</th>
                                <th className="border px-4 py-2 text-left">Amount</th>
                                <th className="border px-4 py-2 text-left">U/C</th>
                                <th className="border px-4 py-2 text-left">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(
                                paginatedData.reduce((acc, row) => {


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
                                            <td className="border px-4 py-2">{groupIndex + 1}.</td>
                                            <td colSpan="8" className="border px-4 py-2">{typeName}</td>
                                        </tr>

                                        {rows.map((row, index) => (
                                            <tr key={row.sow_proposal_id || `${groupIndex}-${index}`}>
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
                                            <td className="border px-2 py-2 font-bold text-right">
                                                {formatNumber(subtotalTotalAmount)}
                                            </td>
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
                                <td colSpan="8" className="border px-2 py-2 text-right">Total:</td>
                                <td className="border px-2 py-2 text-right">{formatNumber(totalAmount)}</td>
                            </tr>
                            <tr>
                                <td colSpan="8" className="border px-2 py-2 text-right">Markup ({markupPercent}%):</td>
                                <td className="border px-2 py-2 text-right">{formatNumber(markupAmount)}</td>
                            </tr>
                            <tr className="bg-yellow-200 font-bold">
                                <td colSpan="8" className="border px-2 py-2 text-right">Grand Total:</td>
                                <td className="border px-2 py-2 text-right">{formatNumber(grandTotal)}</td>
                            </tr>
                        </tfoot>



                    </table>
                </>

            ) : (
                <p className="text-center text-gray-500 mt-4">No cost data available for this proposal.</p>
            )}


            <button
                onClick={handleSaveEstimation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Save Final Estimation
            </button>

            {showViewModal && (
                <ViewModalFinalEntry
                    onClose={() => setShowViewModal(false)}
                    costData={costData}
                    totalAmount={totalAmount}
                    markupPercent={markupPercent}
                    markupAmount={markupAmount}
                    grandTotal={grandTotal}
                    projectInfo={projectInfo}
                />
            )}




        </div>
    );
};

export default FinalCostEstimation;
