import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FaPencilAlt, FaTrashAlt, FaCalculator } from 'react-icons/fa';

import EditQTOModal from './EditQTOModal';
import AddQtoModal from '../AddQtoModal';
import DeleteQTOModal from './DeleteQTOModal';

const QTO_DIMENSION_API = 'http://localhost:5000/api/qto';

const QuantityTakeOffTable = () => {
    const { proposal_id } = useParams();
    const [nodes, setNodes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showRowModal, setShowRowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

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
                length,
                width,
                depth,
                calculated_value,
                floor_label,
                floor_code,
                parent_total_value, // 👈 must match SQL alias
            } = entry;

            let parentNode = tree.find((n) => n.data.name === parent_title);
            if (!parentNode) {
                parentNode = {
                    key: `p-${tree.length}`,
                    data: {
                        name: parent_title,
                        nodeType: 'parent',
                        volume: parent_total_value ? parseFloat(parent_total_value).toFixed(2) : '—'
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
                    },
                    children: [],
                };
                parentNode.children.push(childNode);
            }

            const rowNode = {
                key: `${childNode.key}-r-${childNode.children.length}`,
                data: {
                    name: label,
                    floor:
                        floor_label || floor_code
                            ? `${floor_label ?? ''}${floor_label && floor_code ? ' - ' : ''}${floor_code ?? ''}`
                            : '—',
                    length,
                    width,
                    depth,
                    volume: calculated_value,
                },
            };

            childNode.children.push(rowNode);
        });

        return tree;
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

        // Skip action button for child group headers (e.g., "nodeType === child")
        if (!node || (node.data?.nodeType !== 'child' && node.data?.nodeType !== 'parent')) return null;

        const isParent = node.data.nodeType === 'parent';

        return (
            <div className="relative inline-block text-left" ref={dropdownRef}>
                <Button
                    label="More Actions"
                    icon="pi pi-chevron-down"
                    className="text-sm px-3 py-1 bg-gray-100 border rounded shadow-sm"
                    onClick={() => {
                        setSelectedRowData(node.data); // either parent or row
                        setOpen((prev) => !prev);
                    }}
                />
                {open && (
                    <div className="absolute z-50 mt-2 right-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
                        {isParent ? (
                            <>
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() => {
                                        // 🔧 Logic for adding allowance
                                        alert(`Edit allowance for: ${node.data.name}`);
                                        setOpen(false);
                                    }}
                                >
                                    <FaPencilAlt className="text-blue-600" />
                                    Add Allowance
                                </button>

                                <button
                                    className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={() => {
                                        // 🔧 Logic for rounding off
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
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
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
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="p-6 bg-white rounded-lg max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Quantity Take-Off Table</h2>
                <Button
                    label="+ Add Parent"
                    onClick={() => setShowAddModal(true)}
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
                <Column field="name" header="Item / Label" expander style={{ width: '20%' }} />
                <Column field="floor" header="Floor" style={{ width: '16%', textAlign: 'center' }} />
                <Column field="length" header="Length (m)" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="width" header="Width (m)" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="depth" header="Depth (m)" style={{ width: '10%', textAlign: 'center' }} />
                <Column field="volume" header="Volume (m³)" style={{ width: '15%', textAlign: 'center' }} />
                <Column header="Actions" body={actionTemplate} style={{ width: '15%', textAlign: 'center' }} />
            </TreeTable>

            {showAddModal && (
                <AddQtoModal
                    proposal_id={proposal_id}
                    onClose={() => setShowAddModal(false)}
                    onSelectItem={(items) => setSelectedItems((prev) => [...prev, ...items])}
                />
            )}

            <EditQTOModal
                visible={showRowModal}
                data={selectedRowData}
                onClose={() => setShowRowModal(false)}
            />


            <DeleteQTOModal
                visible={showDeleteModal}
                data={selectedRowData}
                onClose={() => setShowDeleteModal(false)}
                onDelete={() => {
                    alert(`Deleted row: ${selectedRowData.name}`);
                    setShowDeleteModal(false);
                }}
            />

        </div>
    );
};

export default QuantityTakeOffTable;
