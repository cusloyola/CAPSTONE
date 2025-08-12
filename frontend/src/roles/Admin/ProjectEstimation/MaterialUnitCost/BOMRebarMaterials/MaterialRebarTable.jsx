import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FaEllipsisH, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

import AddModalMUC from "../MUCCrud/AddModalMUC";
import EditModalBOMRebarMaterials from "./EditModalBOMRebarMaterials";
import DeleteModalBOMRebarMaterials from "./DeleteModalBOMRebarMaterials";



const ActionMenu = ({ node, setSelectedRowData, setShowRowModal, setShowDeleteModal }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button onClick={() => setOpen(prev => !prev)} className="p-2 rounded hover:bg-gray-100">
                <FaEllipsisH className="text-gray-600" />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 right-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
                    <button
                        className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {
                            setSelectedRowData(node.data);
                            setShowRowModal(true);
                            setOpen(false);
                        }}
                    >
                        <FaPencilAlt className="text-blue-600" />
                        Edit
                    </button>
                    <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        onClick={() => {
                            setSelectedRowData(node.data);
                            setShowDeleteModal(true);
                            setOpen(false);
                        }}
                    >
                        <FaTrashAlt className="text-red-600" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

const MaterialRebarTable = () => {
    const { proposal_id } = useParams();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showRowModal, setShowRowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [parentTotals, setParentTotals] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [entriesCount, setEntriesCount] = useState(10);


    const fetchMaterialCosts = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/rebar-details/rebars/${proposal_id}`);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const response = await res.json();
            console.log("Rebar fetched:", response);
            setNodes(buildTree(response.data || []));
        } catch (err) {
            console.error("Failed to fetch material costs:", err.message);
        }
    };


    const fetchParentTotals = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/mto/list-parent/${proposal_id}`);
            if (!response.ok) throw new Error(`Status: ${response.status}`);

            const data = await response.json();
            console.log("Parent totals fetched:", data);
            setParentTotals(data);
        } catch (error) {
            console.error("Failed to fetch parent totals:", error);
        }
    };


    const buildTree = (items) => {
        const parentMap = {};

        items.forEach((item) => {
            const { parent_title, parent_id, label } = item;

            if (!parentMap[parent_title]) {
                parentMap[parent_title] = {
                    key: `p-${parent_id}`,
                    data: {
                        name: parent_title,
                        nodeType: 'parent',
                        work_item_id: parent_id
                    },
                    children: []
                };
            }

            parentMap[parent_title].children.push({
                key: `${parentMap[parent_title].key}-m-${parentMap[parent_title].children.length}`,
                data: {
                    ...item,
                    name: label,
                    nodeType: 'material'
                }
            });
        });

        return Object.values(parentMap);
    };

    const actionTemplate = (node) => {
        if (node.data.nodeType !== 'material') return null;
        return (
            <ActionMenu
                node={node}
                setSelectedRowData={setSelectedRowData}
                setShowRowModal={setShowRowModal}
                setShowDeleteModal={setShowDeleteModal}
            />
        );
    };


    const filteredNodes = nodes.map((parent) => {
        const parentMatches = parent.data.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchingChildren = parent.children.filter((child) => {
            const childMatches = child.data.name.toLowerCase().includes(searchTerm.toLowerCase());
            return parentMatches || childMatches;
        });

        if (parentMatches || matchingChildren.length > 0) {
            return { ...parent, children: matchingChildren };
        }

        return null;
    }).filter(Boolean);


    useEffect(() => {
        if (!proposal_id) return;
        fetchMaterialCosts();
        fetchParentTotals();
    }, [proposal_id]);

    return (
        <div className="space-y-6 bg-white shadow-rounded">
            {/* <div className="bg-[#030839] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Material Take Off Table</h1>
                <Button
                    onClick={() => setShowAddModal(true)}
                    label="+ Add Parent"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded"
                />
            </div> */}

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <label htmlFor="entries" className="text-sm text-gray-700">Show</label>
                    <select
                        id="entries"
                        value={entriesCount}
                        onChange={(e) => setEntriesCount(Number(e.target.value))}
              className="mx-2 border p-1 rounded w-14 mt-2  "
                    >
                        {[2, 10, 25, 50, 100].map((num) => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-700">entries</span>
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Search material..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 rounded w-64"
                    />
                </div>
            </div>

            <TreeTable
                value={filteredNodes.slice(0, entriesCount)}
                tableStyle={{ minWidth: '60rem' }}
                rowClassName={(node) => {
                    if (node.data.nodeType === 'parent') return 'qto-parent-row';
                    if (node.data.nodeType === 'child') return 'qto-child-row';
                    return '';
                }}
            >
                <Column field="name" header="Item" expander style={{ width: '25%' }} />
                <Column field="material_name" header="Material Name" />
                <Column field="brand_name" header="Brand Name" />
                <Column field="unitCode" header="Unit" />
                <Column field="total_per_rebar" header="Total Qty Per Rebar" />
                <Column field="default_unit_cost" header="Unit Cost" />

                <Column
                    field="material_cost"
                    header="Total Cost"
                    body={(node) => {
                        if (node.data.nodeType === 'parent') {
                            if (!Array.isArray(parentTotals)) return '—';

                            const found = parentTotals.find(p =>
                                Number(p.mto_parent_id) === Number(node.data.work_item_id)
                            );

                            return found?.mto_parent_grandTotal
                                ? `₱ ${parseFloat(found.mto_parent_grandTotal).toLocaleString()}`
                                : '—';
                        }

                        return node.data?.material_cost
                            ? `₱ ${parseFloat(node.data.material_cost).toLocaleString()}`
                            : '—';
                    }}
                />




                <Column header="Actions" body={actionTemplate} style={{ width: '120px' }} />
            </TreeTable>

            {/* Modals */}
            {showAddModal && (
                <AddModalMUC
                    proposal_id={proposal_id}
                    onClose={() => {
                        setShowAddModal(false);
                        fetchMaterialCosts();
                        fetchParentTotals();
                    }}
                />
            )}

            {showRowModal && selectedRowData && (
                <>
                    {/* ADD THIS LOG */}
                    {console.log("Parent - selectedRowData before passing to modal:", selectedRowData)}
                    <EditModalBOMRebarMaterials
                        proposal_id={proposal_id}
                        data={{
                            ...selectedRowData,
                            parent_id: selectedRowData.parent_work_item_id,
                        }}
                        onClose={() => {
                            setShowRowModal(false);
                            fetchMaterialCosts();
                            fetchParentTotals();
                        }}
                    />
                </>
            )}
            {showDeleteModal && selectedRowData && (
                <DeleteModalBOMRebarMaterials
                    data={selectedRowData}
                    onClose={() => {
                        setShowDeleteModal(false);
                        fetchMaterialCosts();
                        fetchParentTotals();
                    }}
                />
            )}
        </div>
    );
};

export default MaterialRebarTable;
