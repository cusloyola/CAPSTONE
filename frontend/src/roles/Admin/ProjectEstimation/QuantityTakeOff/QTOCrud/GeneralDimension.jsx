import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FaPencilAlt, FaTrashAlt, FaCalculator, FaEllipsisH } from 'react-icons/fa';

import EditQTOModal from './EditQTOModal';
import AddQtoModal from '../AddQtoModal';
import DeleteQTOModal from './DeleteQTOModal';
import AddAllowanceQTOModal from './AddAllowanceQTOModal';

const QTO_DIMENSION_API = 'http://localhost:5000/api/qto';

const GeneralDimension = () => {
    const { proposal_id, project_id } = useParams();
    const [nodes, setNodes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showRowModal, setShowRowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [showAllowanceModal, setShowAllowanceModal] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);


    useEffect(() => {
        if (!proposal_id) return;
        fetch(`${QTO_DIMENSION_API}/${proposal_id}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch QTO data');
                return res.json();
            })
            .then((data) => {
                setNodes(buildTreeStructure(data));
            })
            .catch((err) => console.error('Error loading QTO table:', err));
    }, [proposal_id]);

    const buildTreeStructure = (flatData) => {
        const tree = [];

        flatData.forEach((entry) => {
            const {
                parent_title,
                item_title,
                label,
                units,
                length,
                width,
                depth,
                calculated_value,
                floor_label,
                floor_code,
                parent_total_value,
                child_total_volume,
                sow_proposal_id,    // add this
                parent_id

            } = entry;

            let parentNode = tree.find((n) => n.data.name === parent_title);
            if (!parentNode) {
                parentNode = {
                    key: `p-${tree.length}`,
                    data: {
                        name: parent_title,
                        nodeType: 'parent',
                        volume: parent_total_value ? parseFloat(parent_total_value).toFixed(2) : '—',
                        sow_proposal_id,
                        allowance: entry.allowance_percentage ?? 0,
                        adjustedVolume: entry.total_with_allowance ?? 0,
                    },
                    children: [],
                };
                tree.push(parentNode);
            }

            let childNode = parentNode.children.find((c) => c.data.name === item_title);
            if (!childNode) {
                childNode = {
                    key: `${parentNode.key}-c-${parentNode.children.length}`,
                    data: {
                        name: item_title,
                        nodeType: 'child',
                        volume: child_total_volume != null ? parseFloat(child_total_volume) : null,
                    },
                    children: [],
                };
                parentNode.children.push(childNode);
            }


            const rowNode = {
                key: `${childNode.key}-r-${childNode.children.length}`,
                data: {
                    name: label,
                    nodeType: 'label',
                    floor: floor_label || floor_code ? `${floor_label ?? ''}${floor_label && floor_code ? ' - ' : ''}${floor_code ?? ''}` : '—',
                    length,
                    width,
                    depth,
                    units,
                    volume: calculated_value,
                    qto_id: entry.qto_id,
                    sow_proposal_id,
                },
            };

            childNode.children.push(rowNode);
        });

        return tree;
    };

    const findNodeByKey = (nodes, key) => {
        for (const node of nodes) {
            if (node.key === key) return node;
            if (node.children?.length) {
                const found = findNodeByKey(node.children, key);
                if (found) return found;
            }
        }
        return null;
    };

    const actionTemplate = (node) => {
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

        if (!node || (node.data?.nodeType !== 'label' && node.data?.nodeType !== 'parent')) return null;

        const isParent = node.data.nodeType === 'parent';

        return (
            <div className="relative inline-block" ref={dropdownRef}>
                <button
                    onClick={() => {
                        setSelectedRowData(node);
                        setOpen((prev) => !prev);
                    }}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    <FaEllipsisH className="text-gray-600" />
                </button>

                {open && (
                    <div className="absolute z-50 mt-2 right-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
                        {isParent ? (
                            <>
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() => {
                                        setSelectedNode(node);         // store selected node data
                                        setShowAllowanceModal(true);   // show the modal
                                        setOpen(false);                // close dropdown or menu
                                    }}
                                >
                                    <FaPencilAlt className="text-blue-600" />
                                    Add Allowance
                                </button>

                                <button
                                    className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() => {
                                        alert(`Round off volume for: ${node.data.name}`);
                                        setOpen(false);
                                    }}
                                >
                                    <FaCalculator className="text-indigo-600" />
                                    Round Off
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() => {
                                        setSelectedRowData(node);
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
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 space-y-6 bg-white shadow-rounded">
            <div className="bg-[#030839] text-white flex justify-between items-center p-4 rounded">
                <h2 className="text-xl font-semibold">Quantity Take-Off Table</h2>
                <Button
                    label="+ Add Parent"
                    onClick={() => setShowAddModal(true)}
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
                <Column field="name" header="Item / Label" expander style={{ width: '20%' }} />
                <Column field="floor" header="Floor" style={{ width: '16%', textAlign: 'center' }} />
                <Column field="length" header="Length (m)" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="width" header="Width (m)" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="depth" header="Depth (m)" style={{ width: '10%', textAlign: 'center' }} />
                <Column
                    header="Initial Quantity"
                    body={(node) =>
                        node.data?.volume != null && !isNaN(node.data.volume)
                            ? parseFloat(node.data.volume).toFixed(2)
                            : '—'
                    }
                    style={{ width: '15%', textAlign: 'center' }}
                />


                <Column
                    header="%"
                    body={(node) =>
                        node.data?.nodeType === 'parent'
                            ? parseFloat(node.data.allowance).toFixed(2)
                            : null
                    }
                    style={{ width: '10%', textAlign: 'center' }}
                />


                <Column
                    header="Adjusted Quantity"
                    body={(node) =>
                        node.data?.nodeType === 'parent'
                            ? parseFloat(node.data.adjustedVolume).toFixed(2)
                            : null
                    }
                    style={{ width: '15%', textAlign: 'center' }}
                />

                <Column header="Actions" body={actionTemplate} style={{ width: '15%', textAlign: 'center' }} />
            </TreeTable>

            {showAddModal && (
                <AddQtoModal
                    proposal_id={proposal_id}
                    project_id={project_id}
                    onClose={() => setShowAddModal(false)}
                    onSelectItem={(items) => setSelectedItems((prev) => [...prev, ...items])}
                />

            )}

            <EditQTOModal
                visible={showRowModal}
                data={selectedRowData}
                onClose={() => setShowRowModal(false)}
                onSuccess={() => {
                    setShowRowModal(false);
                    fetch(`${QTO_DIMENSION_API}/${proposal_id}`)
                        .then((res) => res.json())
                        .then((data) => setNodes(buildTreeStructure(data)));
                }}
            />

            <DeleteQTOModal
                visible={showDeleteModal}
                data={selectedRowData}
                onClose={() => setShowDeleteModal(false)}
                onDelete={() => {
                    fetch(`${QTO_DIMENSION_API}/${proposal_id}`)
                        .then(res => res.json())
                        .then(data => setNodes(buildTreeStructure(data)))
                        .catch(error => console.error("Error refreshing table after delete:", error)); // Add error handling for fetch
                }}
            />

            {showAllowanceModal && (
                <AddAllowanceQTOModal
                    node={selectedNode}
                    onClose={() => setShowAllowanceModal(false)}
                    onSave={(updatedData) => {
                        // ✅ Re-fetch QTO data instead of calling undefined fetchCostData
                        fetch(`${QTO_DIMENSION_API}/${proposal_id}`)
                            .then((res) => res.json())
                            .then((data) => setNodes(buildTreeStructure(data)))
                            .catch((err) => console.error("Error refreshing QTO after saving allowance:", err));

                        setShowAllowanceModal(false);
                    }}

                />
            )}

        </div>
    );
};

export default GeneralDimension;
