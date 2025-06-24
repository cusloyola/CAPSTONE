import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';

import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

import AddModalMUC from "./AddModalMUC";

const MaterialUnitCost = () => {
    const { proposal_id } = useParams();
    const [showAddModal, setShowAddModal] = useState(false);
    const [nodes, setNodes] = useState([]);

    const fetchMaterialCosts = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/materialunitcost/material-cost/${proposal_id}`);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            console.log("Fetched material cost data:", data);
            setNodes(buildTree(data));
        } catch (err) {
            console.error("Failed to fetch material costs:", err.message);
        }
    };

    const buildTree = (data) => {
        return data.map((item, index) => ({
            key: `p-${index}`,
            data: {
                name: item.item_title || `Item ${index + 1}`, // Use actual title or fallback
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
                        material_uc: item.material_uc
                    }
                }
            ]
        }));
    };

    useEffect(() => {
        fetchMaterialCosts();
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

            {showAddModal && (
                <AddModalMUC
                    proposal_id={proposal_id}
                    onClose={() => {
                        setShowAddModal(false);
                        fetchMaterialCosts();
                    }}
                />
            )}
        </div>
    );
};

export default MaterialUnitCost;
