// import React, { useState, useEffect } from "react";

// const EditModalMUC = ({ data, onClose, onSave }) => {
//     const [form, setForm] = useState({
//         material_cost_id: data.material_cost_id,
//         market_value: data.market_value || 0,
//         allowance: data.allowance || 0,
//         material_uc: 0
//     });

//     // Auto-calculate material_uc when market_value or allowance changes
//     useEffect(() => {
//         const mv = parseFloat(form.market_value) || 0;
//         const al = parseFloat(form.allowance) || 0;
// const computed = mv * al;
//         setForm((prev) => ({ ...prev, material_uc: computed.toFixed(2) }));
//     }, [form.market_value, form.allowance]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setForm((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async () => {
//         const payload = {
//             material_cost_id: form.material_cost_id,
//             market_value: parseFloat(form.market_value),
//             allowance: parseFloat(form.allowance),
//             material_uc: parseFloat(form.material_uc)
//         };

//         try {
//             const res = await fetch("http://localhost:5000/api/materialunitcost/update", {
//                 method: "PUT",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload)
//             });

//             const result = await res.json();
//             console.log("Server response:", result);

//             if (!res.ok) throw new Error(`Update failed: ${res.status}`);

//             onClose();
//             if (onSave) onSave();
//         } catch (err) {
//             console.error("Edit error:", err);
//         }
//     };

//     return (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//             {/* Backdrop */}
//             <div
//                 className="absolute inset-0 bg-black opacity-50"
//                 onClick={onClose}
//             ></div>

//             {/* Modal Container */}
//             <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 z-10">
//                 <h2 className="text-xl font-semibold mb-4">Edit Material Cost</h2>

//                 <div className="space-y-6">
//                     <div className="border p-4 rounded bg-gray-50">
//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block mb-1 text-sm">Market Value</label>
//                                 <input
//                                     type="number"
//                                     name="market_value"
//                                     value={form.market_value}
//                                     onChange={handleChange}
//                                     className="w-full border rounded px-2 py-1"
//                                 />
//                             </div>

//                             <div>
// <label className="block mb-1 text-sm">Allowance Multiplier</label>
//                                 <input
//                                     type="number"
//                                     name="allowance"
//                                     value={form.allowance}
//                                     onChange={handleChange}
//                                     className="w-full border rounded px-2 py-1"
//                                 />
//                             </div>

//                             <div className="col-span-2">
//                                 <label className="block mb-1 text-sm">Material Unit Cost</label>
//                                 <div className="text-lg font-bold px-3 py-2 rounded">
//                                     {form.material_uc}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="flex justify-end pt-4 mt-4">
//                     <button
//                         className="mr-2 px-4 py-2 border rounded text-sm hover:bg-gray-100"
//                         onClick={onClose}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
//                         onClick={handleSubmit}
//                     >
//                         Save
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EditModalMUC;
