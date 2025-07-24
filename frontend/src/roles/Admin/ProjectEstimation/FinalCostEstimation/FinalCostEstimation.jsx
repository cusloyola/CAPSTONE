import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaFileExport } from "react-icons/fa";
import AddModalFinalEntry from "./AddModalFinalEntry";

const FinalCostEstimation = () => {
    const { proposal_id } = useParams();
    const [costData, setCostData] = useState([]);
    const [showExport, setShowExport] = useState(false);

  const fetchCostData = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/cost-estimation/proposal/${proposal_id}/final-cost`);
    if (!res.ok) throw new Error("Failed to fetch cost data.");
    const data = await res.json();

    const adjusted = data.map((row) => {
      const quantity = parseFloat(row.quantity) || 0;
      const laborUC = parseFloat(row.labor_uc) || 0;
      const laborAmount = laborUC * quantity;

      // If MTO total exists, override material only
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
    console.error("Error fetching cost data:", err);
  }
};


    useEffect(() => {
        fetchCostData();
    }, [proposal_id]);

    const handleExportExcel = () => {
        console.log("Exporting to Excel...");
        setShowExport(false);
    };

    const handleExportPDF = () => {
        console.log("Exporting to PDF...");
        setShowExport(false);
    };

const formatNumber = (value) => {
    const num = parseFloat(value);
    if (!num) return ""; // Show nothing for 0, null, NaN

    return Number.isInteger(num)
        ? num.toLocaleString(undefined, { useGrouping: true }) // e.g., 1,000
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
    const details = costData.map(row => ({
        sow_proposal_id: row.sow_proposal_id,
        amount: parseFloat(row.total_with_allowance ?? row.total_amount) || 0
    }));

    try {
        const res = await fetch(`http://localhost:5000/api/cost-estimation/${proposal_id}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                details,
                total: totalAmount,
                markup_percent: markupPercent,
                markup_amount: markupAmount,
                grand_total: grandTotal
            })
        });

        if (!res.ok) throw new Error("Failed to save final estimation");
        alert("Final estimation saved successfully!");
    } catch (err) {
        console.error(err);
        alert("Something went wrong while saving.");
    }
};




    return (
        <div className="p-4 space-y-6 bg-white shadow rounded">
            {/* Header */}
            <div className="bg-[#030839] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Final Cost Estimation</h1>
                <div className="relative">
                    <button
                        className="p-2 hover:text-gray-100 hover:bg-[#8142c2] rounded-full transition"
                        onClick={() => setShowExport(prev => !prev)}
                        title="Export Options"
                    >
                        <FaFileExport className="text-xl text-white" />
                    </button>
                    {showExport && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-10">
                            <button onClick={handleExportExcel} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Export to Excel</button>
                            <button onClick={handleExportPDF} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Export to PDF</button>
                        </div>
                    )}
                </div>
            </div>
            {costData.length > 0 ? (
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
                                        <td className="border px-4 py-2">{groupIndex + 1}.</td>
                                        <td colSpan="8" className="border px-4 py-2">{typeName}</td>
                                    </tr>

                                    {rows.map((row, index) => (
                                        <tr key={row.sow_proposal_id || `${groupIndex}-${index}`}>
                                            <td className="border px-4 py-2"></td>
                                            <td className="border px-4 py-2 pl-6">{row.description}</td>
                                            <td className="border px-4 py-2 text-right">{formatNumber(row.quantity)}</td>
                                            <td className="border px-4 py-2 text-right">{row.unit}</td>
                                            <td className="border px-4 py-2 text-right">{formatNumber(row.material_uc)}</td>
                                            <td className="border px-4 py-2 text-right">{formatNumber(row.material_amount)}</td>
                                            <td className="border px-4 py-2 text-right">{formatNumber(row.labor_uc)}</td>
                                            <td className="border px-4 py-2 text-right">{formatNumber(row.labor_amount)}</td>
                                            <td className="border px-4 py-2 text-right font-bold">
                                                {formatNumber(row.total_with_allowance ?? row.total_amount)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-100 font-semibold">
                                        <td colSpan="8" className="border px-4 py-2 text-right">Subtotal:</td>
                                        <td className="border px-4 py-2 font-bold text-right">
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
                            <td colSpan="8" className="border px-4 py-2 text-right">Total:</td>
                            <td className="border px-4 py-2">{formatNumber(totalAmount)}</td>
                        </tr>
                        <tr>
                            <td colSpan="8" className="border px-4 py-2 text-right">Markup ({markupPercent}%):</td>
                            <td className="border px-4 py-2">{formatNumber(markupAmount)}</td>
                        </tr>
                        <tr className="bg-yellow-200 font-bold">
                            <td colSpan="8" className="border px-4 py-2 text-right">Grand Total:</td>
                            <td className="border px-4 py-2">{formatNumber(grandTotal)}</td>
                        </tr>
                    </tfoot>


                </table>
            ) : (
                <p className="text-center text-gray-500 mt-4">No cost data available for this proposal.</p>
            )}

<button
    onClick={handleSaveEstimation}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
    Save Final Estimation
</button>


        </div>
    );
};

export default FinalCostEstimation;
