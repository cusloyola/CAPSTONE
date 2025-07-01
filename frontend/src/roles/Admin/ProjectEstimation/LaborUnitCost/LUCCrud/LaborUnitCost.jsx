import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';

import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FaEllipsisH, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

import AddModalLUC from "./AddModalLUC";
import EditModalLUC from "./EditModalLUC";
import DeleteModalLUC from "./DeleteModalLUC";

// Dropdown for actions on child rows
const ActionMenu = ({ node, setSelectedRowData, setShowRowModal, setShowDeleteModal }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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
                    setSelectedRowData(node.data);
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

const LaborUnitCost = () => {
    const { proposal_id } = useParams();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRowModal, setShowRowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [nodes, setNodes] = useState([]);

    const fetchLaborCostData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/laborunitcost/labor-rate/details/${proposal_id}`);
            const data = await res.json();
            setNodes(buildTree(data));
        } catch (err) {
            console.error("❌ Error fetching labor cost data:", err);
        }
    };

    const buildTree = (data) => {
        const grouped = {};
        data.forEach(row => {
            if (!grouped[row.item_title]) {
                grouped[row.item_title] = {
                    labor_uc: row.labor_uc,
                    children: []
                };
            }

            grouped[row.item_title].children.push({
                key: `entry-${row.labor_entry_id}`,
                data: {
                    labor_entry_id: row.labor_entry_id,
                    sow_proposal_id: row.sow_proposal_id,
                                        labor_rate_id: row.labor_rate_id, // <--- Add this!

                    name: row.labor_type,
                    quantity: row.quantity,
                    daily_rate: row.daily_rate,
                    average_output: row.average_output,
                    allowance_percent: row.allowance_percent,
                    labor_row_cost: row.labor_row_cost,
                    nodeType: 'child'
                }
            });
        });

        return Object.entries(grouped).map(([title, group], index) => ({
            key: `parent-${index}`,
            data: {
                name: title,
                labor_uc: group.labor_uc,
                nodeType: 'parent'
            },
            children: group.children
        }));
    };

    useEffect(() => {
        fetchLaborCostData();
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
                <h1 className="text-lg font-semibold">Labor Unit Cost</h1>
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
                <Column field="name" header="Item / Labor Type" expander style={{ width: '20%' }} />
                <Column field="quantity" header="Qty" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="daily_rate" header="Daily Rate" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="average_output" header="Avg Output" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="allowance_percent" header="Allowance (%)" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="labor_row_cost" header="Row Cost" style={{ width: '15%', textAlign: 'center' }} />
                <Column header="Actions" body={actionTemplate} style={{ width: '15%' }} />
            </TreeTable>

            {/* Add */}
            {showAddModal && (
                <AddModalLUC
                    proposal_id={proposal_id}
                    onClose={() => {
                        setShowAddModal(false);
                        fetchLaborCostData();
                    }}
                />
            )}

            {/* Edit */}
            {showRowModal && selectedRowData && (
                <EditModalLUC
                    data={selectedRowData}
                    onClose={() => {
                        setShowRowModal(false);
                        fetchLaborCostData();
                    }}
                />
            )}

            {showDeleteModal && selectedRowData && (
                <DeleteModalLUC
                    data={selectedRowData}
                    labor_entry_id={selectedRowData.labor_entry_id}
                    onClose={() => {
                        setShowDeleteModal(false);
                        fetchLaborCostData();
                    }}
                    onDelete={() => {
                        setShowDeleteModal(false);
                        fetchLaborCostData();
                    }}
                />
            )}

        </div>
    );
};

export default LaborUnitCost;
