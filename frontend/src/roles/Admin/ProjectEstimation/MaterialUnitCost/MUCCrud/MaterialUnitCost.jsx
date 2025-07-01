import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';

import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FaEllipsisH, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

import AddModalMUC from "./AddModalMUC";
import EditModalMUC from "./EditModalMUC";
import DeleteModalMUC from "./DeleteModalMUC";

// Action dropdown only for child rows
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
            <button
                onClick={() => {
                    setSelectedRowData(node);
                    setOpen(prev => !prev);
                }}
                className="p-2 rounded hover:bg-gray-100"
            >
                <FaEllipsisH className="text-gray-600" />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 right-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
                    <button
                        className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {
                            setSelectedRowData(node.data); // ✅ Fix here
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
                            setSelectedRowData(node.data); // ✅ Fix here
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

const MaterialUnitCost = () => {
    const { proposal_id } = useParams();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showRowModal, setShowRowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [nodes, setNodes] = useState([]);

    const fetchMaterialCosts = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/materialunitcost/material-cost/${proposal_id}`);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setNodes(buildTree(data));
        } catch (err) {
            console.error("Failed to fetch material costs:", err.message);
        }
    };

    const buildTree = (data) => {
        return data.map((item, index) => ({
            key: `p-${index}`,
            data: {
                name: item.item_title || `Item ${index + 1}`,
                nodeType: 'parent'
            },
            children: [
                {
                    key: `p-${index}-c-0`,
                    data: {
                        name: 'Details',
                        nodeType: 'child',
                        market_value: item.market_value,
                        allowance: item.allowance,
                        material_uc: item.material_uc,
                        material_cost_id: item.material_cost_id // <-- Make sure this exists
                    }
                }
            ]
        }));
    };

    useEffect(() => {
        fetchMaterialCosts();
    }, [proposal_id]);

    const actionTemplate = (node) => {
        if (!node?.data || node.data.nodeType !== 'child') return null;

        return (
            <ActionMenu
                node={node}
                setSelectedRowData={setSelectedRowData}
                setShowRowModal={setShowRowModal}
                setShowDeleteModal={setShowDeleteModal}
            />
        );
    };

    return (
        <div className="p-4 space-y-6 bg-white shadow-rounded">
            <div className="bg-[#030839] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Material Unit Cost</h1>
                <Button
                    onClick={() => setShowAddModal(true)}
                    label="+ Add Parent"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded"
                />
            </div>

            <TreeTable
                value={nodes}
                selectOnEdit={false}
                tableStyle={{ minWidth: '60rem' }}
                rowClassName={(node) => {
                    if (node.data.nodeType === 'parent') return 'qto-parent-row';
                    if (node.data.nodeType === 'child') return 'qto-child-row';
                    return '';
                }}
            >
                <Column field="name" header="Item Title" expander style={{ width: '25%' }} />
                <Column field="market_value" header="Market Value" style={{ width: '20%' }} />
                <Column field="allowance" header="Allowance" style={{ width: '20%' }} />
                <Column field="material_uc" header="Material Unit Cost" style={{ width: '20%' }} />
                <Column header="Actions" body={actionTemplate} style={{ width: '15%' }} />
            </TreeTable>

            {/* Modals */}
            {showAddModal && (
                <AddModalMUC
                    proposal_id={proposal_id}
                    onClose={() => {
                        setShowAddModal(false);
                        fetchMaterialCosts();
                    }}
                />
            )}

            {showRowModal && selectedRowData && (
                <EditModalMUC
                    data={selectedRowData}
                    onClose={() => {
                        setShowRowModal(false);
                        fetchMaterialCosts(); 
                    }}
                    onSave={fetchMaterialCosts} 
                />
            )}


            {showDeleteModal && selectedRowData && (
                <DeleteModalMUC
                    data={selectedRowData}
                    onClose={() => {
                        setShowDeleteModal(false);
                        fetchMaterialCosts();
                    }}
                />
            )}
        </div>
    );
};

export default MaterialUnitCost;
