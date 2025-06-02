import React, { useState } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

export default function QuantityTakeOffTable() {
    const [nodes, setNodes] = useState([
        {
            key: '0',
            data: { name: 'Excavation', size: '', type: '' },
          
        },
    ]);

    // Find node by key helper
    const findNodeByKey = (nodes, key) => {
        const path = key.split('-');
        let node;
        while (path.length) {
            const list = node ? node.children : nodes;
            node = list[parseInt(path[0], 10)];
            path.shift();
        }
        return node;
    };

    // Update node data on input change
    const onEditorValueChange = (options, value) => {
        const updatedNodes = [...nodes];
        const node = findNodeByKey(updatedNodes, options.node.key);
        node.data[options.field] = value;
        setNodes(updatedNodes);
    };

    // InputText editor with Tailwind styling
    const inputTextEditor = (options) => (
        <InputText
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={options.rowData[options.field]}
            onChange={(e) => onEditorValueChange(options, e.target.value)}
        />
    );


    // Add new child or subchild row
    const addRow = (nodeKey) => {
        const updatedNodes = [...nodes];
        const parentNode = findNodeByKey(updatedNodes, nodeKey);

        const newKey = `${nodeKey}-${(parentNode.children || []).length}`;
        const newRow = {
            key: newKey,
            data: { name: '', size: '', type: '' },
        };

        parentNode.children = [...(parentNode.children || []), newRow];
        setNodes(updatedNodes);
    };

    // Actions column with add buttons styled in Tailwind
    const actionTemplate = (rowData) => {
        const key = rowData.key;
        const depth = key.split('-').length;

        return (
            <div className="flex gap-2">
                {depth === 1 && (
                    <button
                        onClick={() => addRow(key)}
                        className="text-white bg-green-600 hover:bg-green-700 rounded px-3 py-1 text-xs font-semibold"
                        type="button"
                    >
                        + Add Child
                    </button>
                )}
                {depth === 2 && (
                    <button
                        onClick={() => addRow(key)}
                        className="text-white bg-blue-600 hover:bg-blue-700 rounded px-3 py-1 text-xs font-semibold"
                        type="button"
                    >
                        + Add Sub
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 bg-white shadow rounded-lg max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Quantity Take-Off Table</h2>
            <TreeTable
                value={nodes}
                editMode="cell"
                tableStyle={{ minWidth: '60rem' }}
                className="border border-gray-300 rounded" 
            >

                <Column
                    field="name"
                    header="Work Item (Specific Task)"
                    expander
                    editor={(options) => {
                        const depth = options.node.key.split('-').length;
                        if (depth === 2 || depth === 3) return inputTextEditor(options);
                        return null;
                    }}
                    style={{ height: '3.5rem' }}
                    className="text-sm"
                />
                <Column
                    field="size"
                    header="Length"
                    editor={inputTextEditor}
                    style={{ height: '3.5rem' }}
                    className="text-sm"
                />
                <Column
                    field="size"
                    header="Width"
                    editor={inputTextEditor}
                    style={{ height: '3.5rem' }}
                    className="text-sm"
                />
                <Column
                    field="size"
                    header="Height"
                    editor={inputTextEditor}
                    style={{ height: '3.5rem' }}
                    className="text-sm"
                />
                <Column
                    field="size"
                    header="Volume"
                    style={{ height: '3.5rem' }}
                    className="text-sm"
                />
                <Column
                    body={actionTemplate}
                    header="Actions"
                    style={{ width: '10rem' }}
                    className="text-sm"
                />
            </TreeTable>
        </div>
    );
}
