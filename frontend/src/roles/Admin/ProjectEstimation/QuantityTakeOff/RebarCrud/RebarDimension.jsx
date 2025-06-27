import React, { useState, useEffect, useRef } from 'react';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { useParams } from 'react-router-dom';
import { FaPencilAlt, FaTrashAlt, FaEllipsisH } from 'react-icons/fa';

const REBAR_API = 'http://localhost:5000/api/rebar';

const RebarDimension = () => {
    const { proposal_id } = useParams();
    const [nodes, setNodes] = useState([]);
    const [rebarUsageTotals, setRebarUsageTotals] = useState([]);

   useEffect(() => {
  const fetchRebarDetails = async () => {
    try {
      const res = await fetch(`${REBAR_API}/by-proposal/${proposal_id}`);
      const result = await res.json();
      if (Array.isArray(result.data)) {
        setNodes(buildTreeStructure(result.data));
      }
    } catch (err) {
      console.error("❌ Error fetching rebar details:", err);
    }
  };

  if (proposal_id) fetchRebarDetails();
}, [proposal_id]);


   useEffect(() => {
    const fetchRebarTotals = async () => {
        try {
            const res = await fetch(`${REBAR_API}/total-used/${proposal_id}`);
            const result = await res.json();

            console.log("✅ Fetched Totals:", result.data);

            if (Array.isArray(result.data)) {
                setRebarUsageTotals(result.data);
            } 
        } catch (err) {
            console.error("❌ Error fetching rebar total usage:", err);
        }
    };

    if (proposal_id) {
        fetchRebarTotals();
    }
}, [proposal_id]);


const buildTreeStructure = (data) => {
    const treeMap = new Map();

    data.forEach((entry, index) => {
        const {
            parent_title,     // ← This must be provided by your backend
            item_title,       // This is the child work item (e.g., Footing)
            work_item_id,
            rebar_details_id,
            rebar_masterlist_id,
            rebar_label,
            location,
            quantity,
            total_weight,
            floor_code,
            floor_label,
        } = entry;

        // Step 1: Add parent title (Reinforcement)
        if (!treeMap.has(parent_title)) {
            treeMap.set(parent_title, {
                key: `parent-${parent_title}`,
                data: { name: parent_title, nodeType: 'top' },
                children: [],
            });
        }

        const parentNode = treeMap.get(parent_title);

        // Step 2: Add child item (e.g., Footing)
        let childNode = parentNode.children.find(child => child.key === `wi-${work_item_id}`);
        if (!childNode) {
            childNode = {
                key: `wi-${work_item_id}`,
                data: { name: item_title, nodeType: 'parent' },
                children: [],
            };
            parentNode.children.push(childNode);
        }

        // Step 3: Add rebar row
        childNode.children.push({
            key: `rebar-${rebar_details_id || index}`,
            data: {
                name: `Rebar: ${rebar_label || rebar_masterlist_id}`,
                floor: floor_code && floor_label ? `${floor_code} - ${floor_label}` : floor_label || floor_code || '—',
                location: location || '—',
                quantity: quantity || 0,
                total_weight: total_weight || 0,
            },
        });
    });

    return Array.from(treeMap.values());
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

        if (!node || node.data?.nodeType === 'parent') return null;

        return (
            <div className="relative inline-block" ref={dropdownRef}>
                <button
                    onClick={() => setOpen(prev => !prev)}
                    className="p-2 rounded hover:bg-gray-100"
                >
                    <FaEllipsisH className="text-gray-600" />
                </button>

                {open && (
                    <div className="absolute z-50 mt-2 right-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
                        <button
                            className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                                console.log("Edit clicked", node);
                                setOpen(false);
                            }}
                        >
                            <FaPencilAlt className="text-blue-600" />
                            Edit
                        </button>
                        <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            onClick={() => {
                                console.log("Delete clicked", node.data);
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

    return (
    <div className="p-6 bg-white rounded-lg max-w-7xl mx-auto">
    <h2 className="text-xl font-semibold mb-4">Rebar Dimensions</h2>

    <TreeTable value={nodes} tableStyle={{ minWidth: '60rem' }}>
        <Column field="name" header="Item / Label" expander style={{ width: '20%' }} />
        <Column field="floor" header="Floor" style={{ width: '16%', textAlign: 'center' }} />
        <Column field="location" header="Location" style={{ width: '16%', textAlign: 'center' }} />
        <Column field="quantity" header="Quantity" style={{ width: '10%', textAlign: 'center' }} />
        <Column field="total_weight" header="Total Weight" style={{ width: '10%', textAlign: 'center' }} />
        <Column header="Actions" body={actionTemplate} style={{ width: '15%', textAlign: 'center' }} />
    </TreeTable>

    {rebarUsageTotals.length > 0 && (
        <>
            <hr className="my-6 border-t border-gray-300" />

            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">📊 Rebar Usage Summary</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 text-left border-b">Rebar</th>
                                <th className="py-2 px-4 text-right border-b">Total Quantity Used</th>
                                <th className="py-2 px-4 text-right border-b">Total Weight Used (kg)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rebarUsageTotals.map((row) => (
                                <tr key={row.rebar_masterlist_id} className="border-t">
                                    <td className="py-2 px-4">{row.rebar_label || `ID: ${row.rebar_masterlist_id}`}</td>
                                    <td className="py-2 px-4 text-right">{row.total_quantity_used}</td>
                                    <td className="py-2 px-4 text-right">{row.total_weight_used}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )}
</div>

    );
};

export default RebarDimension;
