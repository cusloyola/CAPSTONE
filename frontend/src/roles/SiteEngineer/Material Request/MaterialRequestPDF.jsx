import React, { forwardRef } from "react";

const MaterialRequestPDF = forwardRef(({ requests }, ref) => {
    // Helper to sum totals
    const getTotals = (items) => {
        let totalQty = 0;
        let totalCost = 0;
        if (Array.isArray(items)) {
            items.forEach(item => {
                const qty = Number(item.request_quantity) || 0;
                // Use the unit cost directly from the item object
                const unitCost = Number(item.default_unit_cost) || 0;
                totalQty += qty;
                totalCost += qty * unitCost;
            });
        }
        return { totalQty, totalCost };
    };

    // Helper to format price with commas
    const formatPrice = (value) =>
        "₱" + Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Helper to capitalize first letter
    const capitalize = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

    return (
        <div ref={ref} className="p-4 bg-white">
            <div className="mb-6">
                <div className="flex items-center">
                    <img
                        src="/images/assets/drl_construction_address.png"
                        alt="Logo"
                        className="h-[80px] project-image"
                    />
                </div>
                <h1 className="text-center text-xl font-bold mt-6 mb-10">
                    Material Request Summary
                </h1>
            </div>
            {(!requests || requests.length === 0) ? (
                <p className="text-gray-600">No requests selected.</p>
            ) : (
                requests.map((request) => {
                    const items = Array.isArray(request.items) ? request.items : [];
                    const { totalQty, totalCost } = getTotals(items);
                    // Determine label for approved_at
                    let approvedLabel = "";
                    if (request.status === "approved") {
                        approvedLabel = "Date Approved";
                    } else if (request.status === "rejected") {
                        approvedLabel = "Date Rejected";
                    }
                    return (
                        <div key={request.request_id} className="mb-8 pb-4 border-b border-gray-300">
                            <div className="space-y-1">
                                <div className="flex">
                                    <strong className="w-40">Project:</strong>
                                    <span>{request.project_name}</span>
                                </div>
                                <div className="flex">
                                    <strong className="w-40">Urgency:</strong>
                                    <span>{request.urgency}</span>
                                </div>
                                <div className="flex">
                                    <strong className="w-40">Request Date:</strong>
                                    <span>
                                        {new Date(request.request_date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex">
                                    <strong className="w-40">Status:</strong>
                                    <span style={{
                                        color:
                                            request.status === "approved"
                                                ? "green"
                                                : request.status === "pending"
                                                    ? "orange"
                                                    : "red"
                                    }}>
                                        {capitalize(request.status)}
                                    </span>
                                </div>
                                {/* Approved/Rejected Date */}
                                {request.approved_at && approvedLabel && (
                                    <div className="flex">
                                        <strong className="w-40">{approvedLabel}:</strong>
                                        <span>
                                            {new Date(request.approved_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </span>
                                    </div>
                                )}
                                <div className="flex">
                                    <strong className="w-40">Notes:</strong>
                                    <span>{request.notes}</span>
                                </div>
                            </div>

                            {/* Materials Table */}
                            <div className="mt-8">
                                <p>
                                    <strong>Requested Materials</strong>
                                </p>
                                {items.length > 0 ? (
                                    <table className="ml-10 mt-2 w-[95%] border border-gray-300 text-xs">
                                        <thead style={{ backgroundColor: "#f3f4f6" }}>
                                            <tr>
                                                <th className="border px-4 py-2 text-left">Material Name</th>
                                                <th className="border px-4 py-2 text-left">Brand</th>
                                                <th className="border px-4 py-2 text-left">Unit</th>
                                                <th className="border px-4 py-2 text-right">Unit Cost</th>
                                                <th className="border px-4 py-2 text-right">Quantity</th>
                                                <th className="border px-4 py-2 text-right">Total Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, idx) => {
                                                const qty = Number(item.request_quantity) || 0;
                                                const unitCost = Number(item.default_unit_cost) || 0;
                                                return (
                                                    <tr key={item.resource_id || item.item_id || idx}>
                                                        <td className="border px-4 py-2">{item.material_name}</td>
                                                        <td className="border px-4 py-2">{item.brand_name || "-"}</td>
                                                        <td className="border px-4 py-2">{item.unitName || "-"}</td>
                                                        <td className="border px-4 py-2 text-right">{formatPrice(unitCost)}</td>
                                                        <td className="border px-4 py-2 text-right">{qty}</td>
                                                        <td className="border px-4 py-2 text-right">{formatPrice(qty * unitCost)}</td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Totals row */}
                                            <tr>
                                                <td className="border px-4 py-2 font-bold text-right" colSpan={4}>Total</td>
                                                <td className="border px-4 py-2 font-bold text-right">{totalQty}</td>
                                                <td className="border px-4 py-2 font-bold text-right">{formatPrice(totalCost)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="ml-10 mt-2 text-gray-600">No materials listed.</div>
                                )}
                            </div>

                            <div className="flex mt-16 items-start gap-2">
                                <strong className="w-40 shrink-0">Requested By:</strong>
                                <span className="whitespace-nowrap">Engr. Gino Herrera</span>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
});

export default MaterialRequestPDF;