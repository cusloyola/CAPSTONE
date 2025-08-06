import React, { useState, useEffect } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { useParams } from 'react-router-dom';
import { FaPencilAlt, FaTrashAlt, FaEllipsisH } from 'react-icons/fa';

import EditRebarModal from './EditRebarModal';
import DeleteRebarModal from './DeleteRebarModal';
import RebarActionsDropdown from './RebarActionsDropdown';

const REBAR_API = 'http://localhost:5000/api/rebar';

const RebarDimension = () => {
    const { proposal_id } = useParams();
    const [nodes, setNodes] = useState([]);
    const [rebarUsageTotals, setRebarUsageTotals] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRebar, setSelectedRebar] = useState(null);

    const [entryLimit, setEntryLimit] = useState(30);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredNodes, setFilteredNodes] = useState([]); // this will be used in TreeTable


    const fetchRebarDetails = async () => {
        try {
            const res = await fetch(`${REBAR_API}/by-proposal/${proposal_id}`);
            const result = await res.json();
            if (Array.isArray(result.data)) {
                setNodes(buildTreeStructure(result.data));
            }
        } catch (err) {
            console.error("❌ Error fetching rebar details:", err);
        }
    };

    const fetchRebarTotals = async () => {
        try {
            const res = await fetch(`${REBAR_API}/total-used/${proposal_id}`);
            const result = await res.json();
            if (Array.isArray(result.data)) {
                setRebarUsageTotals(result.data);
            }
        } catch (err) {
            console.error("❌ Error fetching rebar total usage:", err);
        }
    };

    useEffect(() => {
        if (proposal_id) {
            fetchRebarDetails();
            fetchRebarTotals();
        }
    }, [proposal_id]);

    useEffect(() => {
        if (!nodes.length) return;

        const keyword = searchQuery.trim().toLowerCase();

        const filterTree = (node) => {
            const { name, location, floor, quantity, total_weight } = node.data || {};
            const searchable = `${name ?? ""} ${location ?? ""} ${floor ?? ""} ${quantity ?? ""} ${total_weight ?? ""}`.toLowerCase();

            const childMatches = node.children
                ? node.children
                    .map(filterTree)
                    .filter(Boolean)
                : [];

            const selfMatches = searchable.includes(keyword);

            if (selfMatches || childMatches.length > 0) {
                return {
                    ...node,
                    children: childMatches.length > 0
                        ? childMatches.map(applyEntryLimit)
                        : node.children ?? []
                };
            }

            return null;
        };

        const applyEntryLimit = (node) => {
            if (!node.children || node.children.length === 0) return node;
            return {
                ...node,
                children: node.children.slice(0, entryLimit)
            };
        };

        const filteredTree = keyword
            ? nodes.map(filterTree).filter(Boolean)
            : nodes.map(applyEntryLimit);

        setFilteredNodes(filteredTree);
    }, [nodes, searchQuery, entryLimit]);



    const buildTreeStructure = (data) => {
        const treeMap = new Map();

        data.forEach((entry, index) => {
            const {
                parent_title, item_title, work_item_id, rebar_details_id,
                rebar_masterlist_id, rebar_label, location, quantity,
                total_weight, floor_code, floor_label,
            } = entry;

            if (!treeMap.has(parent_title)) {
                treeMap.set(parent_title, {
                    key: `parent-${parent_title}`,
                    data: { name: parent_title, nodeType: 'top' },
                    children: [],
                });
            }

            const parentNode = treeMap.get(parent_title);

            let childNode = parentNode.children.find(child => child.key === `wi-${work_item_id}`);
            if (!childNode) {
                childNode = {
                    key: `wi-${work_item_id}`,
                    data: { name: item_title, nodeType: 'parent' },
                    children: [],
                };
                parentNode.children.push(childNode);
            }

            childNode.children.push({
                key: `rebar-${rebar_details_id || index}`,
                data: {
                    ...entry,
                    name: `Rebar: ${rebar_label || rebar_masterlist_id}`,
                    floor: floor_code && floor_label ? `${floor_code} - ${floor_label}` : floor_label || floor_code || '—',
                    location: location || '—',
                    quantity: quantity || 0,
                    total_weight: total_weight || 0,
                    nodeType: "leaf",
                },
            });
        });

        return Array.from(treeMap.values());
    };

    return (
        <div className="space-y-6 bg-white shadow-rounded">

            <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm">Show</span>
                    <select
                        className="border p-1 rounded w-14"
                        value={entryLimit}
                        onChange={(e) => setEntryLimit(Number(e.target.value))}
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="50">50</option>
                        <option value="80">80</option>
                        <option value="100">100</option>
                    </select>
                    <span className="text-sm">entries</span>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search Work List..."
                        className="border p-2 rounded w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>


            <TreeTable value={filteredNodes} tableStyle={{ minWidth: '60rem' }}>
                <Column field="name" header="Item / Label" expander style={{ width: '20%' }} />
                <Column field="floor" header="Floor" style={{ width: '16%', textAlign: 'center' }} />
                <Column field="location" header="Location" style={{ width: '16%', textAlign: 'center' }} />
                <Column field="quantity" header="Quantity" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="total_weight" header="Total Weight" style={{ width: '10%', textAlign: 'center' }} />
                <Column
                    header="Actions"
                    body={(node) =>
                        node.data?.nodeType === "parent" ? null : (
                            <RebarActionsDropdown
                                nodeData={node.data}
                                onEdit={(data) => {
                                    setSelectedRebar(data);
                                    setShowEditModal(true);
                                }}
                                onDelete={(data) => {
                                    setSelectedRebar(data);
                                    setShowDeleteModal(true);
                                }}
                            />
                        )
                    }
                    style={{ width: "15%", textAlign: "center" }}
                />
            </TreeTable>

            {rebarUsageTotals.length > 0 && (
                <>
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Rebar Usage Summary</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-4 text-left border-b">Rebar</th>
                                        <th className="py-2 px-4 text-right border-b">Total Quantity Used</th>
                                        <th className="py-2 px-4 text-right border-b">Total Weight Used (kg)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rebarUsageTotals.map((row) => (
                                        <tr key={row.rebar_masterlist_id} className="border-t">
                                            <td className="py-2 px-4">{row.rebar_label || `ID: ${row.rebar_masterlist_id}`}</td>
                                            <td className="py-2 px-4 text-right">{row.total_quantity_used}</td>
                                            <td className="py-2 px-4 text-right">{row.total_weight_used}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {showEditModal && (
                <EditRebarModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    rebarData={[selectedRebar]}
                    onSave={async (data) => {
                        const updated = data.map(entry => ({
                            ...entry,
                            sow_proposal_id: entry.sow_proposal_id ?? selectedRebar?.sow_proposal_id  // ✅ Must not be null
                        }));


                        try {
                            await Promise.all(
                                updated.map(async (entry) => {
                                    const res = await fetch(`${REBAR_API}/update/${entry.rebar_details_id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(entry)
                                    });

                                    if (!res.ok) {
                                        const msg = await res.text();
                                        throw new Error(msg || "Failed to update rebar entry");
                                    }
                                })
                            );

                            alert("Rebar updated successfully");
                            setShowEditModal(false);
                            fetchRebarDetails();
                            fetchRebarTotals();
                        } catch (err) {
                            console.error("❌ Error updating rebar:", err);
                            alert("Failed to update rebar");
                        }
                    }}
                />
            )}

            {showDeleteModal && (
                <DeleteRebarModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={async () => {
                        try {
                            const res = await fetch(`${REBAR_API}/delete/${selectedRebar.rebar_details_id}`, {
                                method: "DELETE"
                            });

                            if (!res.ok) {
                                const msg = await res.text();
                                throw new Error(msg || "Failed to delete rebar");
                            }

                            alert("✅ Rebar deleted successfully");
                            setShowDeleteModal(false);
                            fetchRebarDetails(); // refresh
                            fetchRebarTotals();  // refresh
                        } catch (err) {
                            console.error("❌ Error deleting rebar:", err);
                            alert("Failed to delete rebar. Please try again.");
                            setShowDeleteModal(false);
                        }
                    }}

                    rebarLabel={selectedRebar?.rebar_label}
                />
            )}
        </div>
    );
};

export default RebarDimension;
