import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FaEllipsisH, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

import AddModalMUC from "../MUCCrud/AddModalMUC";
import EditModalBOMMaterials from "./EditModalBOMMaterials";
import DeleteModalBOMMaterials from "./DeleteModalBOMMaterials";

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

const MaterialListTable = () => {
    const { proposal_id } = useParams();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showRowModal, setShowRowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [parentTotals, setParentTotals] = useState([]);

    const fetchMaterialCosts = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/mto/list/${proposal_id}`);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setNodes(buildTree(data.items || []));
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

    // Build tree with hierarchy: parent -> child -> material
    const buildTree = (items) => {
        const parentMap = {};

        items.forEach((item) => {
            const { parent_title, item_title, item_type, parent_id } = item;

            // Create parent node if missing
            if (!parentMap[parent_title]) {
                parentMap[parent_title] = {
                    key: `p-${parent_id || parent_title}`, // unique key
                    data: {
                        name: parent_title,
                        nodeType: 'parent',
                        work_item_id: parent_id // Important for matching parentTotals later
                    },
                    children: []
                };
            }

            const parentNode = parentMap[parent_title];

            // Create child node under parent if missing
            let childNode = parentNode.children.find(c => c.data.name === item_title);
            if (!childNode) {
                childNode = {
                    key: `${parentNode.key}-c-${parentNode.children.length}`,
                    data: {
                        name: item_title,
                        nodeType: 'child'
                    },
                    children: []
                };
                parentNode.children.push(childNode);
            }

            // Add material nodes under child if item_type === 'child'
            if (item_type === 'child') {
                const materialNode = {
                    key: `${childNode.key}-m-${childNode.children.length}`,
                    data: {
                        ...item,
                        name: item.material_name,
                        nodeType: 'material'
                    }
                };
                childNode.children.push(materialNode);
            }
        });

        return Object.values(parentMap);
    };

    // Actions column only for materials
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

    // On mount & proposal_id change, fetch data
    useEffect(() => {
        if (!proposal_id) return;
        fetchMaterialCosts();
        fetchParentTotals();
    }, [proposal_id]);

const existingMTOList = nodes
  .flatMap(parent => parent.children || [])
  .flatMap(child => child.children || [])
  .map(material => ({
    resource_id: material.data.resource_id,
    sow_proposal_id: material.data.sow_proposal_id,
    work_item_id: material.data.work_item_id
  }));


    return (
        <div className="p-4 space-y-6 bg-white shadow-rounded">
            <div className="bg-[#030839] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Material Take Off Table</h1>
                <Button
                    onClick={() => setShowAddModal(true)}
                    label="+ Add Parent"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded"
                />
            </div>

            <TreeTable
                value={nodes}
                tableStyle={{ minWidth: '60rem' }}
                rowClassName={(node) => {
                    if (node.data.nodeType === 'parent') return 'qto-parent-row';
                    if (node.data.nodeType === 'child') return 'qto-child-row';
                    return '';
                }}
            >
                <Column field="name" header="Item / Material" expander style={{ width: '25%' }} />
                <Column field="brand_name" header="Brand Name" />
                <Column field="unitCode" header="Unit" />
                <Column field="multiplier" header="Multiplier" />
                <Column field="actual_qty" header="Qty" />

                <Column
                    field="total_cost"
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

                        return node.data?.total_cost
                            ? `₱ ${parseFloat(node.data.total_cost).toLocaleString()}`
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
                <EditModalBOMMaterials
                    proposal_id={proposal_id}
                    data={{
                        ...selectedRowData,
                        parent_id: selectedRowData.parent_work_item_id,
                        mto_id: selectedRowData.mto_id, 
                        existingMTOList: existingMTOList, 


                    }} onClose={() => {
                        setShowRowModal(false);
                        fetchMaterialCosts();
                        fetchParentTotals();
                    }}
                    onSave={() => {
                        fetchMaterialCosts();
                        fetchParentTotals();
                    }}
                />
            )}



            {showDeleteModal && selectedRowData && (
                <DeleteModalBOMMaterials
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

export default MaterialListTable;
