import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMaterialCostOverview } from "../../../../api/materialControlApi";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const MaterialControlDetail = () => {
    const { project_id } = useParams();
    const [budgetData, setBudgetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openSections, setOpenSections] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            if (!project_id) return;
            try {
                const data = await getMaterialCostOverview(project_id);
                setBudgetData(data.budget || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [project_id]);

    const totalOriginal = budgetData.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalRemaining = budgetData.reduce((sum, item) => sum + (item.remaining_amount || 0), 0);

    const toggleAccordion = (workTypeId) => {
        setOpenSections((prev) => ({
            ...prev,
            [workTypeId]: !prev[workTypeId],
        }));
    };

    // Group items by work_type_id and type_name
    const groupedDataObj = budgetData.reduce((acc, item) => {
        const workTypeId = item.work_type_id;
        if (!acc[workTypeId]) {
            acc[workTypeId] = {
                workTypeId,
                typeName: item.type_name,
                items: [],
            };
        }
        acc[workTypeId].items.push(item);
        return acc;
    }, {});

    // Convert object to array and sort by work_type_id ascending
    const groupedData = Object.values(groupedDataObj).sort((a, b) => a.workTypeId - b.workTypeId);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex p-6 gap-6">
            <div className="w-[450px] bg-white border border-gray-300 rounded-1xl p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Material Budget Overview</h2>

                {/* Legends */}
                <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>
                        <span className="text-gray-600 text-xs">Original Amount</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                        <span className="text-gray-600 text-xs">Budget Left</span>
                    </div>
                </div>
                <hr />

                <div className="flex-1 overflow-y-auto max-h-100 mt-2">
                    {groupedData.map((group) => (
                        <div key={group.workTypeId} className="mb-4 last:mb-0">
                            {/* Accordion Header */}
                            <button
                                className="w-full text-left py-3 px-4 rounded-md flex justify-between items-center"
                                onClick={() => toggleAccordion(group.workTypeId)}
                            >
                                <span className="font-semibold text-gray-800">{group.typeName}</span>
                                {openSections[group.workTypeId] ? (
                                    <FaChevronUp className="ml-2 text-gray-500" />
                                ) : (
                                    <FaChevronDown className="ml-2 text-gray-500" />
                                )}
                            </button>

                            {/* Accordion Content */}
                            {openSections[group.workTypeId] && (
                                <div className="p-4 border border-t-0 border-gray-200 rounded-b-md text-sm">
                                    {group.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-[40px_1fr_1fr_1fr] gap-4 items-center py-1 border-b last:border-b-0 border-gray-100"
                                        >
                                            {/* Item number circle */}
                                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
                                                {idx + 1}
                                            </div>

                                            <span className="text-gray-600 ">{item.item_title}</span>
                                            <span className="text-blue-600 font-medium">₱{item.amount?.toLocaleString()}</span>
                                            <span className="text-green-600 font-bold">₱{item.remaining_amount?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Total at the bottom */}
                <div className="grid grid-cols-[70px_1fr_1fr_1fr]  items-center font-bold text-gray-800 border-t border-gray-200 pt-2 mt-2 text-sm">
                    <div></div> {/* Empty column for the number */}
                    <span >Total</span>
                    <span className="text-blue-600">₱{totalOriginal.toLocaleString()}</span>
                    <span className="text-green-600">₱{totalRemaining.toLocaleString()}</span>
                </div>

            </div>

   

                {/* Right: Material Ledger */}
                <div className="flex-1 bg-white border border-gray-300 rounded-1xl p-6 flex flex-col">
                    <h2 className="text-xl font-bold mb-4">Material Ledger</h2>

                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="min-w-full border border-gray-200 text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="border-b px-3 py-2 text-left">#</th>
                                    <th className="border-b px-3 py-2 text-left">Work</th>
                                    <th className="border-b px-3 py-2 text-left">Material</th>
                                    <th className="border-b px-3 py-2 text-left">Quantity</th>
                                    <th className="border-b px-3 py-2 text-left">Brand</th>
                                    <th className="border-b px-3 py-2 text-left">Total Cost</th>

                                    <th className="border-b px-3 py-2 text-left">Previous Stock</th>
                                    <th className="border-b px-3 py-2 text-left">Issued</th>
                                    <th className="border-b px-3 py-2 text-left">Current Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="px-3 py-2">{idx + 1}</td>
                                        <td className="px-3 py-2">Excavation</td>
                                        <td className="px-3 py-2">Cement</td>
                                        <td className="px-3 py-2">₱500</td>
                                        <td className="px-3 py-2">Brand A</td>
                                        <td className="px-3 py-2">20 bags</td>
                                        <td className="px-3 py-2">100</td>
                                        <td className="px-3 py-2">20</td>
                                        <td className="px-3 py-2">80</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    );
};

export default MaterialControlDetail;
