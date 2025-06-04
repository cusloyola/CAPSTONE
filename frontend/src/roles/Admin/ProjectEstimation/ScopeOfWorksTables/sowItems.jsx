import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/sowproposal/sow-work-items/raw";
const API_BASE = "http://localhost:5000/api/sowproposal/sow-work-items";

const SowItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [unitFilter, setUnitFilter] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [workTypes, setWorkTypes] = useState([]);
    const [form, setForm] = useState({
        item_title: "",
        item_description: "",
        unitCode: "",
        sequence_order: "",
        work_type_id: "",
    });

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));

        // Fetch work types
        fetch("http://localhost:5000/api/sowproposal/work-types")
            .then(res => res.json())
            .then(data => setWorkTypes(data))
            .catch(() => setWorkTypes([]));
    }, []);

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const fetchItems = () => {
        setLoading(true);
        fetch(API_URL)
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    };

    // Add or Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editItem ? "PUT" : "POST";
        const url = editItem ? `${API_BASE}/${editItem.work_item_id}` : API_BASE;
        // Convert sequence_order to number
        const payload = { ...form, sequence_order: Number(form.sequence_order), work_type_id: Number(form.work_type_id) };
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                alert("Failed to save item.");
                return;
            }
            await res.json();
            setShowForm(false);
            setEditItem(null);
            setForm({ item_title: "", item_description: "", unitCode: "", sequence_order: "", work_type_id: "" });
            fetchItems();
        } catch (err) {
            alert("Error saving item: " + err.message);
            console.error("Error details:", err);
        }
    };

    // Delete
    const handleDelete = (id) => {
        if (!window.confirm("Delete this item?")) return;
        fetch(`${API_BASE}/${id}`, { method: "DELETE" })
            .then(res => res.json())
            .then(() => fetchItems());
    };

    // Open form for add
    const openAddForm = () => {
        setEditItem(null);
        setForm({ item_title: "", item_description: "", unitCode: "", sequence_order: "", work_type_id: "" });
        setShowForm(true);
    };

    // Open form for edit
    const openEditForm = (item) => {
        setEditItem(item);
        setForm({
            item_title: item.item_title,
            item_description: item.item_description,
            unitCode: item.unitCode,
            sequence_order: item.sequence_order,
            work_type_id: item.work_type_id ? String(item.work_type_id) : ""
        });
        setShowForm(true);
    };

    // Filtering
    const filtered = items.filter(item =>
        (item.item_title?.toLowerCase().includes(search.toLowerCase()) ||
            item.item_description?.toLowerCase().includes(search.toLowerCase())) &&
        (unitFilter ? item.unitCode === unitFilter : true)
    );

    // Pagination
    const totalPages = Math.ceil(filtered.length / entriesPerPage);
    const paginated = filtered.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

    // Unique units for filter dropdown
    const units = Array.from(new Set(items.map(i => i.unitCode).filter(Boolean)));

    return (
        <div className="p-4 space-y-6 bg-white shadow rounded">
            <div className="bg-[#8682d4] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Manage Work Items</h1>
                <div className="flex items-center space-x-2">
                    <button
                        className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
                        onClick={openAddForm}>
                        Add New Item
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <form
                    className="w-full border border-gray-300 rounded mb-6"
                    style={{ background: "#f9fafb" }}
                    onSubmit={handleSubmit}
                >
                    <table className="table-auto w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2 text-left">Item Title</th>
                                <th className="border px-4 py-2 text-left">Item Description</th>
                                <th className="border px-4 py-2 text-left">Unit of Measure</th>
                                <th className="border px-4 py-2 text-left">Sequence Order</th>
                                <th className="border px-4 py-2 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border px-4 py-2">
                                    <input
                                        className="border p-2 rounded w-full"
                                        placeholder="Item Title"
                                        value={form.item_title}
                                        onChange={e => setForm({ ...form, item_title: e.target.value })}
                                        required
                                    />
                                </td>
                                <td className="border px-4 py-2">
                                    <input
                                        className="border p-2 rounded w-full"
                                        placeholder="Item Description"
                                        value={form.item_description}
                                        onChange={e => setForm({ ...form, item_description: e.target.value })}
                                        required
                                    />
                                </td>
                                <td className="border px-4 py-2">
                                    <input
                                        className="border p-2 rounded w-full"
                                        placeholder="Unit of Measure"
                                        value={form.unitCode}
                                        onChange={e => setForm({ ...form, unitCode: e.target.value })}
                                        required
                                    />
                                </td>
                                <td className="border px-4 py-2">
                                    <input
                                        className="border p-2 rounded w-full"
                                        placeholder="Sequence Order"
                                        type="number"
                                        value={form.sequence_order}
                                        onChange={e => setForm({ ...form, sequence_order: e.target.value })}
                                        required
                                    />
                                </td>
                                <td className="border px-4 py-2">
                                    <select
                                        className="border p-2 rounded w-full"
                                        value={form.work_type_id}
                                        onChange={e => setForm({ ...form, work_type_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Work Type</option>
                                        {workTypes.map(type => (
                                            <option key={type.work_type_id} value={type.work_type_id}>
                                                {type.type_name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="border px-4 py-2">
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                            {editItem ? "Update" : "Add"}
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            )}

            {/* Section 2: Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-2">
                    <label className="block font-medium text-gray-700">
                        Unit of Measure:
                    </label>
                    <select
                        className="border p-2 rounded w-48"
                        value={unitFilter}
                        onChange={e => setUnitFilter(e.target.value)}
                    >
                        <option value="">All Unit of Measures</option>
                        {units.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <label className="text-sm">
                        Show
                        <select
                            className="mx-2 border p-1 rounded"
                            value={entriesPerPage}
                            onChange={e => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        >
                            <option value={1}>1</option>
                            <option value={15}>15</option>
                            <option value={50}>50</option>
                        </select>
                        entries
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <label className="block font-medium text-gray-700">
                        Search:
                    </label>
                    <input
                        id="searchInput"
                        type="text"
                        className="border p-2 rounded w-64"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <table className="table-auto w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2 text-left">Item Title</th>
                        <th className="border px-4 py-2 text-left">Item Description</th>
                        <th className="border px-4 py-2 text-left">Unit of Measure</th>
                        <th className="border px-4 py-2 text-left">Sequence Order</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4">Loading...</td>
                        </tr>
                    ) : paginated.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4">No items found.</td>
                        </tr>
                    ) : paginated.map(item => (
                        <tr key={item.work_item_id}>
                            <td className="border px-4 py-2">{item.item_title}</td>
                            <td className="border px-4 py-2">{item.item_description}</td>
                            <td className="border px-4 py-2">{item.unitCode}</td>
                            <td className="border px-4 py-2">{item.sequence_order}</td>
                            <td className="border px-4 py-2">
                                <div className="flex gap-x-2">
                                    <button
                                        className="bg-yellow-500 text-white px-6 h-10 rounded hover:bg-yellow-700"
                                        onClick={() => openEditForm(item)}
                                    >Edit</button>
                                    <button
                                        className="bg-red-600 text-white px-6 h-10 rounded hover:bg-red-700"
                                        onClick={() => handleDelete(item.work_item_id)}
                                    >Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                <p>
                    Showing {(filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1)}
                    {" "}
                    to {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries
                </p>
                <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SowItems;