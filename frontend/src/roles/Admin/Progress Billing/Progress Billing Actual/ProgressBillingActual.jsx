import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddPresentModal from "./AddPresentModal";
import ProgressCharts from "../Progress Billing Charts/ProgressCharts";

const PROGRESSBILL_API_URL = "http://localhost:5000/api/progress-billing";

const formatNumber = (value) => {
    if (value == null) return "0";
    const num = Number(value);
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(2);
};

const roundTwo = (num) => {
    if (typeof num !== "number" || isNaN(num)) return 0;
    const parts = num.toString().split(".");
    const decimal = parts[1] || "";
    if (decimal.length < 3) return Number(num.toFixed(2));
    const thirdDigit = parseInt(decimal[2], 10);
    const base = Math.floor(num * 100) / 100;
    return thirdDigit >= 5 ? base + 0.01 : base;
};

const ProgressBillingTableDesign = () => {
    const { billing_id } = useParams();
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState(null);
    const [accomplishments, setAccomplishments] = useState({});

    const [showExtraModal, setShowExtraModal] = useState(false);
const [newItem, setNewItem] = useState({
  category: "",
  description: "",
  qty: "",
  unit: "",
  amount: ""
});


    const fetchProgressBilling = async () => {
        try {
            const res = await fetch(`${PROGRESSBILL_API_URL}/summary/${billing_id}`);
            if (!res.ok) throw new Error(`Server error ${res.status}: ${await res.text()}`);

            const contentType = res.headers.get("content-type");
            if (!contentType?.includes("application/json")) {
                throw new Error("Invalid JSON response from server");
            }

            const data = await res.json();
            const safeArray = Array.isArray(data) ? data : [data];

            const unique = Array.from(
                new Map(safeArray.map((item) => [item.sow_proposal_id, item])).values()
            );
            setProgressData(unique);

        } catch (error) {
            console.error("❌ Error fetching progress billing summary:", error);
            setProgressData([]);
        } finally {
            setLoading(false);
        }
    };


    const fetchAccomplishments = async () => {
        try {
            const res = await fetch(`${PROGRESSBILL_API_URL}/accomp/${billing_id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch accomplishments");

            const list = data.data || data;
            const formatted = {};
            list.forEach((row) => {
                formatted[row.sow_proposal_id] = {
                    percent_previous: parseFloat(row.percent_previous) || 0,
                    percent_present: parseFloat(row.percent_present) || 0,
                };
            });

            setAccomplishments(formatted);
        } catch (error) {
            console.error("❌ Error fetching accomplishments", error);
            setAccomplishments({});
        }
    };

    useEffect(() => {
        if (billing_id) {
            fetchProgressBilling();
            fetchAccomplishments();
        }
    }, [billing_id]);

    const grouped = [];
    let lastType = null;
    progressData.forEach((item) => {
        const currentType = item.type_name || "Others";
        if (lastType !== currentType) {
            grouped.push({ typeName: currentType, items: [item] });
            lastType = currentType;
        } else {
            grouped[grouped.length - 1].items.push(item);
        }
    });

    let itemCounter = 1;

    const handleOpenModal = (item) => {
        setSelectedItems(item);
        setShowModal(true);
    };

    return (
        <div className="space-y-6 ">
     <div className="flex justify-between items-center mt-6 mb-6">
  <h1 className="text-2xl font-semibold">Progress Billing</h1>
  <div className="flex gap-2">
    <button
      title="Enter % accomplishment for this billing period"
      className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
      onClick={() => handleOpenModal(null)}
    >
      Add % Present
    </button>
    <button
      title="Add extra billing items"
      className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
      onClick={() => setShowExtraModal(true)}
    >
      Add Extra Items
    </button>
  </div>
</div>

            
      <hr />

            <div className="overflow-x-auto">
                <table className="table-auto w-full mt-10 border border-gray-300 text-sm min-w-[1000px]">
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
                                <td colSpan="10" className="text-center p-4">Loading...</td>
                            </tr>
                        ) : progressData.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center p-4">No data found.</td>
                            </tr>
                        ) : (
                            grouped.map(({ typeName, items }) => (
                                <React.Fragment key={typeName}>
                                    <tr className="bg-blue-100 font-semibold">
                                        <td colSpan="10" className="px-4 py-2">{typeName}</td>
                                    </tr>
                                    {items.map((item, itemIndex) => {
                                        const acc = accomplishments[item.sow_proposal_id] || {};
                                        const prev = acc.percent_previous || 0;
                                        const pres = acc.percent_present || 0;
                                        const toDate = acc.percent_to_date != null ? acc.percent_to_date / 100 : (prev + pres) / 100;
                                        const wtAccomp = item.wt_percent * toDate;

                                        return (
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
                                                <td className="border px-4 py-2">{formatNumber(item.wt_percent)}%</td>
                                                <td className="border px-4 py-2">{formatNumber(prev)}%</td>
                                                <td className="border px-4 py-2">{formatNumber(pres)}%</td>

                                                <td className="border px-4 py-2">
                                                    {formatNumber(acc.percent_to_date ?? (prev + pres))}%
                                                </td>
                                                <td className="border px-4 py-2">{formatNumber(roundTwo(wtAccomp))}%</td>
                                            </tr>
                                        );
                                    })}
                                </React.Fragment>
                            ))
                        )}

                        <tr>
                            <td colSpan="10" className="py-5"></td>
                        </tr>

                        {!loading && progressData.length > 0 && (
                            <tr className="bg-gray-200 font-semibold">
                                <td colSpan="9" className="text-right px-4 py-4">
                                    Total Wt.% Accomplishment:
                                </td>
                                <td className="border px-4 py-2">
                                    {
                                        formatNumber(
                                            progressData.reduce((sum, item) => {
                                                const acc = accomplishments[item.sow_proposal_id] || {};
                                                const prev = acc.percent_previous || 0;
                                                const pres = acc.percent_present || 0;
                                                const toDate = (prev + pres) / 100;
                                                return sum + item.wt_percent * toDate;
                                            }, 0)
                                        ) + "%"
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AddPresentModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    fetchAccomplishments();
                }}
                billing_id={billing_id}
                items={progressData}
                accomplishments={accomplishments}
            />

            {showExtraModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
      <h2 className="text-xl font-semibold mb-4">Add Extra Item</h2>

      {/* Category Dropdown */}
      <label className="block mb-2 font-medium">Category</label>
      <select
        value={newItem.category}
        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
        className="w-full border px-3 py-2 rounded mb-4"
      >
        <option value="">Select category</option>
        {grouped.map(({ typeName }) => (
          <option key={typeName} value={typeName}>{typeName}</option>
        ))}
      </select>

      {/* Description */}
      <label className="block mb-2 font-medium">Description</label>
      <input
        type="text"
        value={newItem.description}
        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        className="w-full border px-3 py-2 rounded mb-4"
        placeholder="Enter item description"
      />

      {/* Qty */}
      <label className="block mb-2 font-medium">Quantity</label>
      <input
        type="number"
        value={newItem.qty}
        onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      {/* Unit */}
      <label className="block mb-2 font-medium">Unit</label>
      <input
        type="text"
        value={newItem.unit}
        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      {/* Amount */}
      <label className="block mb-2 font-medium">Amount</label>
      <input
        type="number"
        value={newItem.amount}
        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => setShowExtraModal(false)}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            console.log("Extra item data:", newItem); // Later send to backend
            setShowExtraModal(false);
          }}
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}



        </div>
    );
};

export default ProgressBillingTableDesign;
