import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const EditQTOModal = ({ visible, data, onClose, onSuccess }) => {
    const [formRows, setFormRows] = useState([]);

    useEffect(() => {
        if (!data) return;

        // Single row (label) edit
        if (data?.data?.nodeType === 'label') {
            setFormRows([
                {
                    qto_id: data.data.qto_id ?? null,
                    label: data.data.name ?? '',
                    length: data.data.length ?? '',
                    width: data.data.width ?? '',
                    depth: data.data.depth ?? '',
                    units: data.data.units ?? 1,
                },
            ]);
        }

        // Grouped child labels under a child node
        if (data?.data?.nodeType === 'child' && data.children?.length) {
            const rows = data.children.map((entry) => ({
                qto_id: entry.data.qto_id ?? null,
                label: entry.data.name ?? '',
                length: entry.data.length ?? '',
                width: entry.data.width ?? '',
                depth: entry.data.depth ?? '',
                units: entry.data.units ?? 1,
            }));
            setFormRows(rows);
        }
    }, [data]);

    const handleChange = (index, field, value) => {
        setFormRows((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };
    const handleSubmit = async () => {
        try {
            for (const row of formRows) {
                const length = parseFloat(row.length) || 0;
                const width = parseFloat(row.width) || 0;
                const depth = parseFloat(row.depth) || 0;
                const units = parseFloat(row.units) || 1;

                const updatedRow = {
                    ...row,
                    length,
                    width,
                    depth,
                    units,
                    calculated_value: length * width * depth * units,
                };

                console.log("🔄 Sending PUT to /api/qto/update:", updatedRow);

                const res = await fetch('http://localhost:5000/api/qto/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedRow),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("❌ Server response:", errorText);
                    throw new Error('Failed to update');
                }
            }

            onSuccess?.();  // Tell parent to reload data
            onClose();      // Close modal
        } catch (err) {
            console.error('Update failed:', err);
            alert('Failed to update. Please try again.');
        }
    };



    if (!visible || formRows.length === 0) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 z-10 max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                    Edit {formRows.length > 1
                        ? `(${formRows.length}) Entries for: ${data.data?.name}`
                        : `Label: ${formRows[0].label}`}
                </h2>

                <div className="space-y-6">
                    {formRows.map((row, index) => (
                        <div key={index} className="border p-4 rounded bg-gray-50">
                            {formRows.length > 1 && (
                                <h4 className="font-medium mb-2">Label: {row.label}</h4>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm">Length (m)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-2 py-1"
                                        value={row.length}
                                        onChange={(e) => handleChange(index, 'length', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm">Width (m)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-2 py-1"
                                        value={row.width}
                                        onChange={(e) => handleChange(index, 'width', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm">Depth (m)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-2 py-1"
                                        value={row.depth}
                                        onChange={(e) => handleChange(index, 'depth', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm">Units</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-2 py-1"
                                        value={row.units}
                                        onChange={(e) => handleChange(index, 'units', e.target.value)}
                                    />
                                </div>

                                {/* ✅ Add this new read-only Calculated Volume field here */}
                                <div className="col-span-2">
                                    <label className="block mb-1 text-sm">Calculated Volume (m³)</label>
                                    <div className="text-lg font-bold">
                                        {(
                                            (parseFloat(row.length) || 0) *
                                            (parseFloat(row.width) || 0) *
                                            (parseFloat(row.depth) || 0) *
                                            (parseFloat(row.units) || 1)
                                        ).toFixed(3)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 mt-4">
                    <button
                        className="mr-2 px-4 py-2 border rounded text-sm hover:bg-gray-100"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        onClick={handleSubmit}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
};
export default EditQTOModal;
