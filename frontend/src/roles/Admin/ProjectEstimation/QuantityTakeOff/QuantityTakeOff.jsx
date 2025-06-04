import React, { useState } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

export default function QuantityTakeOffTable() {
    const [nodes, setNodes] = useState([
        {
            key: '0',
            data: { name: 'Excavation', length: '', width: '', height: '', volume: '' },
            children: [
                {
                    key: '0-0',
                    data: { name: 'Footing', length: '', width: '', height: '', volume: '' },
                    children: [
                        {
                            key: '0-0-0',
                            data: { name: 'Floor 1', length: '', width: '', height: '', volume: '' },
                        },
                        {
                            key: '0-0-1',
                            data: { name: 'Floor 2', length: '', width: '', height: '', volume: '' },
                        },
                    ],
                },
            ],
        },
        {
            key: '1',
            data: { name: 'Beams', length: '', width: '', height: '', volume: '' },
            children: [
                {
                    key: '1-0',
                    data: { name: 'Mezzanine', length: '', width: '', height: '', volume: '' },
                    children: [
                        {
                            key: '1-0-0',
                            data: { name: 'MB1', length: '', width: '', height: '', volume: '' },
                        },
                        {
                            key: '1-0-1',
                            data: { name: 'MB2', length: '', width: '', height: '', volume: '' },
                        },
                    ],
                },
            ],
        },
    ]);

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

    const onEditorValueChange = (options, value) => {
        const updatedNodes = [...nodes];
        const node = findNodeByKey(updatedNodes, options.node.key);
        node.data[options.field] = value;
        setNodes(updatedNodes);
    };

    const inputEditor = (options) => (
        <InputText
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={options.rowData[options.field]}
            onChange={(e) => onEditorValueChange(options, e.target.value)}
        />
    );

    const addRow = (nodeKey) => {
        const updatedNodes = [...nodes];
        const parentNode = findNodeByKey(updatedNodes, nodeKey);
        const newKey = `${nodeKey}-${(parentNode.children || []).length}`;
        const newRow = {
            key: newKey,
            data: { name: '', length: '', width: '', height: '', volume: '' },
        };
        parentNode.children = [...(parentNode.children || []), newRow];
        setNodes(updatedNodes);
    };

    const addParentRow = () => {
        const updatedNodes = [...nodes];
        const newKey = `${updatedNodes.length}`;
        const newRow = {
            key: newKey,
            data: { name: 'New Parent', length: '', width: '', height: '', volume: '' },
            children: [],
        };
        updatedNodes.push(newRow);
        setNodes(updatedNodes);
    };

    const actionTemplate = (rowData) => {
        const key = rowData.key;
        const depth = key.split('-').length;

        return (
            <div className="flex gap-2">
                {(depth === 1 || depth === 2) && (
                    <Button
                        onClick={() => addRow(key)}
                        label={depth === 1 ? '+ Add Child' : '+ Add Sub'}
                        className={`text-xs px-3 py-1 rounded ${
                            depth === 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
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
                    onClick={addParentRow}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded"
                />
            </div>
            <TreeTable value={nodes} editMode="cell" tableStyle={{ minWidth: '60rem' }}>
                <Column field="name" header="Work Item" expander editor={inputEditor} style={{ width: '25%' }} />
                <Column field="length" header="Length" editor={inputEditor} style={{ width: '15%' }} />
                <Column field="width" header="Width" editor={inputEditor} style={{ width: '15%' }} />
                <Column field="height" header="Height" editor={inputEditor} style={{ width: '15%' }} />
                <Column field="volume" header="Volume" editor={inputEditor} style={{ width: '15%' }} />
                <Column header="Actions" body={actionTemplate} style={{ width: '15%' }} />
            </TreeTable>
        </div>
    );
}
