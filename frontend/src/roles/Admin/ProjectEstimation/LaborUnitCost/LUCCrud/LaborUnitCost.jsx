import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';

import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FaEllipsisV, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

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
                <FaEllipsisV className="text-gray-600 ml-12" />
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
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesCount, setEntriesCount] = useState(10);


    const [parentFilter, setParentFilter] = useState('All');
    const [allParentTitles, setAllParentTitles] = useState([]);

    const fetchLaborCostData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/laborunitcost/labor-rate/details/${proposal_id}`);
            const data = await res.json();

            // Store unique parent titles
            const uniqueParents = [...new Set(data.map(row => row.item_title))];
            setAllParentTitles(uniqueParents);

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
                    labor_rate_id: row.labor_rate_id, 

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

    const filteredNodes = nodes
        .filter(parent => {
            return parentFilter === 'All' || parent.data.name === parentFilter;
        })
        .map(parent => {
            const parentName = parent.data.name?.toLowerCase() || '';
            const query = searchTerm.toLowerCase();

            const parentMatches = parentName.includes(query);

            const matchingChildren = parent.children?.filter(child =>
                `${child.data.name} ${child.data.quantity} ${child.data.daily_rate}`
                    .toLowerCase()
                    .includes(query)
            );

            if (!searchTerm) return parent;

            if (parentMatches || matchingChildren.length > 0) {
                return {
                    ...parent,
                    children: matchingChildren.length > 0 ? matchingChildren : parent.children
                };
            }

            return null;
        })
        .filter(Boolean)
        .slice(0, entriesCount);



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
        <div className="space-y-6 bg-white shadow-rounded">
            <div className="flex justify-between items-center mt-6">
                <p className="text-2xl font-semibold">Labor Details</p>
                <Button
                    onClick={() => setShowAddModal(true)}
                    label="Add Labor"
                    className="text-white px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-900"
                />
            </div>

       <div>
    <hr className="mb-2" />
    <div className="mt-12 mb-4">
      <select
        value={parentFilter}
        onChange={(e) => setParentFilter(e.target.value)}
        className="border p-2 rounded w-48"
      >
        <option value="All">All Items</option>
        {allParentTitles.map((title, idx) => (
          <option key={idx} value={title}>{title}</option>
        ))}
      </select>
    </div>
  </div>



            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <label htmlFor="entries" className="text-sm text-gray-700">Show</label>
                    <select
                        id="entries"
                        value={entriesCount}
                        onChange={(e) => setEntriesCount(Number(e.target.value))}
              className="mx-2 border p-1 rounded w-14 mt-2  "
                    >
                        {[5, 10, 25, 50, 100].map((num) => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-700">entries</span>
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="Search labor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border p-2 rounded w-64"
                    />
                </div>
            </div>


            <TreeTable
                value={filteredNodes}
                tableStyle={{ minWidth: '60rem' }}
                rowClassName={(node) => {
                    if (node.data.nodeType === 'parent') return 'qto-parent-row';
                    if (node.data.nodeType === 'child') return 'qto-child-row';
                    return '';
                }}
            >
                <Column field="name" header="Item / Labor Type" expander style={{ width: '20%', fontSize: '14px' }} />
                <Column field="quantity" header="Qty" style={{ width: '10%', textAlign: 'center', fontSize: '14px' }} />
                <Column field="daily_rate" header="Daily Rate" style={{ width: '10%', textAlign: 'center', fontSize: '14px' }} />
                <Column field="average_output" header="Avg Output" style={{ width: '10%', textAlign: 'center', fontSize: '14px' }} />
                <Column field="allowance_percent" header="Allowance" style={{ width: '10%', textAlign: 'center', fontSize: '14px' }} />
                <Column field="labor_row_cost" header="Row Cost" style={{ width: '15%', textAlign: 'center', fontSize: '14px' }} />
                <Column header="Actions" body={actionTemplate} style={{ width: '15%', fontSize: '14px' }} />
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
