import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PROGRESSBILL_API_URL = "http://localhost:5000/api/progress-billing";

const formatNumber = (value) =>
    value != null
        ? Number(value).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        : "0.00";

const ProgressBillingTableDesign = () => {
    const { billing_id } = useParams();
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProgressBilling = async () => {
        console.log("📥 Fetching billing summary for ID:", billing_id);
        try {
            const res = await fetch(`${PROGRESSBILL_API_URL}/summary/${billing_id}`);

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Server error ${res.status}: ${errorText}`);
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid JSON response from server");
            }

            const data = await res.json();
            console.log("✅ Fetched Progress Billing Data:", data);

            const safeArray = Array.isArray(data) ? data : [data];
            setProgressData(safeArray);
        } catch (error) {
            console.error("❌ Error fetching progress billing summary:", error);
            setProgressData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (billing_id) {
            fetchProgressBilling();
        } else {
            console.warn("⚠️ No billing_id found in route.");
        }
    }, [billing_id]);

    // Group by type_name while keeping order from backend
    const grouped = [];

    let lastType = null;

    progressData.forEach((item) => {
        const currentType = item.type_name || "Others";
        if (!lastType || lastType !== currentType) {
            grouped.push({ typeName: currentType, items: [item] });
            lastType = currentType;
        } else {
            grouped[grouped.length - 1].items.push(item);
        }
    });

    // ✅ Continuous item number across all groups
    let itemCounter = 1;

    return (
        <div className="p-4 space-y-6 bg-white shadow rounded">
            <div className="bg-[#2fbcbc] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Progress Billing</h1>
                <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100">
                    Add Progress Billing
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table-auto w-full border border-gray-300 text-sm min-w-[1000px]">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2 text-left">Item No.</th>
                            <th className="border px-4 py-2 text-left">Description</th>
                            <th className="border px-4 py-2 text-left">Qty</th>
                            <th className="border px-4 py-2 text-left">Unit</th>
                            <th className="border px-4 py-2 text-left">Amount</th>
                            <th className="border px-4 py-2 text-left">Wt.%</th>
                            <th className="border px-4 py-2 text-left">% Accomp. Previous</th>
                            <th className="border px-4 py-2 text-left">% Accomp. Present</th>
                            <th className="border px-4 py-2 text-left">% Accomp. to Date</th>
                            <th className="border px-4 py-2 text-left">Wt.% Accomp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="10" className="text-center p-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : progressData.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center p-4">
                                    No data found.
                                </td>
                            </tr>
                        ) : (
                            grouped.map(({ typeName, items }) => (
                                <React.Fragment key={typeName}>
                                    <tr className="bg-blue-100 font-semibold">
                                        <td colSpan="10" className="px-4 py-2">{typeName}</td>
                                    </tr>
                                    {items.map((item, itemIndex) => (
                                        <tr key={`${typeName}-${itemIndex}`}>
                                            <td className="border px-4 py-2">{itemCounter++}</td>
                                            <td className="border px-4 py-2">{item.item_title}</td>
                                            <td className="border px-4 py-2">
                                                {formatNumber(
                                                    item.type_name === "Reinforcement"
                                                        ? item.rebar_overall_weight
                                                        : item.total_with_allowance !== 0
                                                            ? item.total_with_allowance
                                                            : item.total_value
                                                )}
                                            </td>

                                            <td className="border px-4 py-2">{item.unit}</td>
                                            <td className="border px-4 py-2">{formatNumber(item.amount)}</td>
                                            <td className="border px-4 py-2">N/A</td>
                                            <td className="border px-4 py-2">0.00%</td>
                                            <td className="border px-4 py-2">0.00%</td>
                                            <td className="border px-4 py-2">0.00%</td>
                                            <td className="border px-4 py-2">0.00%</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProgressBillingTableDesign;
