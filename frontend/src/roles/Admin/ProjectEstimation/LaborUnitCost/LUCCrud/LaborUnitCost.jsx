import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';

import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FaPencilAlt, FaTrashAlt, FaCalculator } from 'react-icons/fa';

import AddModalLUC from "./AddModalLUC";

const LaborUnitCost = () => {
    const { proposal_id } = useParams();

    const [showAddModal, setShowAddModal] = useState(false);
    const [nodes, setNodes] = useState([]);

    const fetchLaborCostData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/laborunitcost/labor-rate/details/${proposal_id}`);
            const data = await res.json();
            setNodes(buildTree(data));
        } catch (err) {
            console.error("Error fetching labor cost data: ", err);
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
        if (!node?.data?.nodeType) return null;

        return (
            <div className="relative inline-block text-left">
                <Button
                    label="More Actions"
                    icon="pi pi-chevron-down"
                    className="text-sm px-3 py-1 bg-gray-100 border rounded shadow-sm"
                />
            </div>
        );
    };

    return (
        <div className="p-4 space-y-6 bg-white shadow-rounded">
            <div className="bg-[#ce468f] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">Labor Unit Cost</h1>
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
                <Column field="name" header="Item / Labor Type" expander style={{ width: '20%' }} />
                <Column field="quantity" header="Qty" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="daily_rate" header="Daily Rate" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="average_output" header="Avg Output" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="allowance_percent" header="Allowance (%)" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="labor_row_cost" header="Row Cost" style={{ width: '15%', textAlign: 'center' }} />
                <Column header="Actions" body={actionTemplate} style={{ width: '15%', textAlign: 'center' }} />
            </TreeTable>

            {showAddModal && (
                <AddModalLUC
                    proposal_id={proposal_id}
                    onClose={() => {
                        setShowAddModal(false);
                        fetchLaborCostData();
                    }}
                />
            )}
        </div>
    );
};

export default LaborUnitCost;
