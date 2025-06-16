import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import AddQtoModal from './AddQtoModal';

const QTO_DIMENSION_API = 'http://localhost:5000/api/qto';

const QuantityTakeOffTable = () => {
    const { proposal_id } = useParams();

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [nodes, setNodes] = useState([]);

    // ✅ Convert flat structure to Parent ➝ Children ➝ Rows
    const buildTreeStructure = (flatData) => {
        const tree = [];

        flatData.forEach((entry, index) => {
            const {
                parent_title,
                item_title,
                label,
                length,
                width,
                depth,
                calculated_value
            } = entry;

            // 1. 🔹 Parent node (e.g. Excavation)
            let parentNode = tree.find(node => node.data.name === parent_title);
            if (!parentNode) {
                parentNode = {
                    key: `p-${tree.length}`,
                    data: { name: parent_title, nodeType: 'parent' },
                    children: []
                };
                tree.push(parentNode);
            }

            // 2. 🔹 Child node (e.g. Footing)
            let childNode = parentNode.children.find(child => child.data.name === item_title);
            if (!childNode) {
                childNode = {
                    key: `${parentNode.key}-c-${parentNode.children.length}`,
                    data: { name: item_title, nodeType: 'child' },
                    children: []
                };
                parentNode.children.push(childNode);
            }

            // 3. 📄 QTO Row (e.g. Footing A with dimensions)
            const rowNode = {
                key: `${childNode.key}-r-${childNode.children.length}`,
                data: {
                    name: label,
                    floor: entry.floor_label || entry.floor_code
                        ? `${entry.floor_label ?? ''}${entry.floor_label && entry.floor_code ? ' - ' : ''}${entry.floor_code ?? ''}`
                        : '—',
                    length,
                    width,
                    depth,
                    volume: calculated_value
                }
            };

            childNode.children.push(rowNode);
        });

        return tree;
    };

    useEffect(() => {
        if (!proposal_id) return;

        fetch(`${QTO_DIMENSION_API}/${proposal_id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch QTO data");
                return res.json();
            })
            .then((data) => {
                const treeData = buildTreeStructure(data);
                setNodes(treeData);
            })
            .catch((err) => {
                console.error("Error loading QTO table:", err);
            });
    }, [proposal_id]);

    const handleOpenModal = () => setShowAddModal(true);
    const handleCloseModal = () => setShowAddModal(false);

    const handleSelectItem = (items) => {
        setSelectedItems(prev => [...prev, ...items]);
    };

    const findNodeByKey = (nodes, key) => {
        const path = key.split('-');
        let node;
        while (path.length) {
            const list = node ? node.children : nodes;
            node = list.find(n => n.key === path.slice(0, path.length).join('-'));
            path.pop();
        }
        return node;
    };

    const onEditorValueChange = (options, value) => {
        const updatedNodes = [...nodes];
        const node = findNodeByKey(updatedNodes, options.node.key);
        if (node) {
            node.data[options.field] = value;
            setNodes(updatedNodes);
        }
    };

    const inputEditor = (options) => (
        <InputText
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={options.rowData[options.field] || ''}
            onChange={(e) => onEditorValueChange(options, e.target.value)}
        />
    );

    const addRow = (nodeKey) => {
        const updatedNodes = [...nodes];
        const parentNode = findNodeByKey(updatedNodes, nodeKey);
        const newKey = `${nodeKey}-r-${(parentNode.children || []).length}`;
        const newRow = {
            key: newKey,
            data: { name: '', length: '', width: '', depth: '', volume: '' },
        };
        parentNode.children = [...(parentNode.children || []), newRow];
        setNodes(updatedNodes);
    };

    const actionTemplate = (rowData) => {
        const key = rowData.key;
        if (!key) return null;

        const depth = key.split('-').filter(k => k === 'c' || k === 'r').length;

        return (
            <div className="flex gap-2">
                {depth < 2 && (
                    <Button
                        onClick={() => addRow(key)}
                        label={depth === 0 ? '+ Add Child' : '+ Add QTO Row'}
                        className={`text-xs px-3 py-1 rounded ${depth === 0 ? 'bg-green-600' : 'bg-blue-600'} text-white`}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="p-6 bg-white shadow rounded-lg max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Quantity Take-Off Table</h2>
                <Button
                    label="+ Add Parent"
                    onClick={handleOpenModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded"
                />
            </div>

            <TreeTable
                value={nodes}
                editMode="cell"
                tableStyle={{ minWidth: '60rem' }}
                rowClassName={(node) => {
                    if (node.data.nodeType === 'parent') return 'qto-parent-row';
                    if (node.data.nodeType === 'child') return 'qto-child-row';
                    return '';
                }}
            >


                <Column field="name" header="Item / Label" expander editor={inputEditor} style={{ width: '20%' }} />
                <Column field="floor" header="Floor" editor={inputEditor} style={{ width: '16%', textAlign: 'center' }} />
                <Column field="length" header="Length (m)" editor={inputEditor} style={{ width: '10%', textAlign: 'center' }} />
                <Column field="width" header="Width (m)" editor={inputEditor} style={{ width: '10%', textAlign: 'center' }} />
                <Column field="depth" header="Depth (m)" editor={inputEditor} style={{ width: '10%', textAlign: 'center' }} />
                <Column field="volume" header="Volume (m³)" editor={inputEditor} style={{ width: '15%', textAlign: 'center' }} />
                <Column header="Actions" body={actionTemplate} style={{ width: '15%' }} />
            </TreeTable>

            {showAddModal && (
                <AddQtoModal
                    proposal_id={proposal_id}
                    onClose={handleCloseModal}
                    onSelectItem={handleSelectItem}
                />
            )}
        </div>
    );
};

export default QuantityTakeOffTable;
