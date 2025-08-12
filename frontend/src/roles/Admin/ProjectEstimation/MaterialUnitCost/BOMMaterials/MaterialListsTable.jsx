import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useParams } from "react-router-dom";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { FaEllipsisV, FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import EditModalBOMMaterials from "./EditModalBOMMaterials";
import DeleteModalBOMMaterials from "./DeleteModalBOMMaterials";

const ActionMenu = ({
  node,
  setSelectedRowData,
  setShowRowModal,
  setShowDeleteModal,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button onClick={() => setOpen((prev) => !prev)} className="p-2 rounded hover:bg-gray-100">
        <FaEllipsisV className="text-gray-600" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 right-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center gap-2"
            onClick={() => {
              setSelectedRowData(node.data);
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
        </div>
      )}
    </div>
  );
};

const MaterialListTable = forwardRef(({ proposal_id, selectedParent, setParentList }, ref) => {
  const [showRowModal, setShowRowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [parentTotals, setParentTotals] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesCount, setEntriesCount] = useState(10);


  const fetchMaterialCosts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/mto/list/${proposal_id}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setNodes(buildTree(data.items || []));
    } catch (err) {
      console.error("Failed to fetch material costs:", err.message);
    }
  };

  const fetchParentTotals = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/mto/list-parent/${proposal_id}`);
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = await res.json();
      setParentList?.(data);
    } catch (err) {
      console.error("Failed to fetch parent totals:", err.message);
    }
  };

  useImperativeHandle(ref, () => ({
    refreshTable: () => {
      fetchMaterialCosts();
      fetchParentTotals();
    },
  }));

  useEffect(() => {
    if (proposal_id) {
      fetchMaterialCosts();
      fetchParentTotals();
    }
  }, [proposal_id]);


  const buildTree = (items) => {
    const parentMap = {};
    items.forEach((item) => {
      const { parent_title, item_title, item_type, parent_id } = item;

      if (!parentMap[parent_title]) {
        parentMap[parent_title] = {
          key: `p-${parent_id || parent_title}`,
          data: {
            name: parent_title,
            nodeType: "parent",
            work_item_id: parent_id,
          },
          children: [],
        };
      }

      const parentNode = parentMap[parent_title];
      let childNode = parentNode.children.find((c) => c.data.name === item_title);
      if (!childNode) {
        childNode = {
          key: `${parentNode.key}-c-${parentNode.children.length}`,
          data: {
            name: item_title,
            nodeType: "child",
          },
          children: [],
        };
        parentNode.children.push(childNode);
      }

      if (item_type === "child") {
        childNode.children.push({
          key: `${childNode.key}-m-${childNode.children.length}`,
          data: {
            ...item,
            name: item.material_name,
            nodeType: "material",
          },
        });
      }
    });

    return Object.values(parentMap);
  };

  const existingMTOList = nodes
    .flatMap((p) => p.children || [])
    .flatMap((c) => c.children || [])
    .map((m) => ({
      resource_id: m.data.resource_id,
      sow_proposal_id: m.data.sow_proposal_id,
      work_item_id: m.data.work_item_id,
    }));

  const actionTemplate = (node) => {
    if (node.data.nodeType !== "material") return null;
    return (
      <ActionMenu
        node={node}
        setSelectedRowData={setSelectedRowData}
        setShowRowModal={setShowRowModal}
        setShowDeleteModal={setShowDeleteModal}
      />
    );
  };

  
const filteredByParent =
  selectedParent === "All" || !selectedParent
    ? nodes
    : nodes.filter((node) => node.data.name === selectedParent);

const filteredBySearch = filteredByParent.map((parent) => {
  const parentMatches = parent.data.name.toLowerCase().includes(searchTerm.toLowerCase());

  const matchingChildren = parent.children.map((child) => {
    const childMatches = child.data.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (childMatches || parentMatches) {
      return { ...child }; 
    }

    return null;
  }).filter(Boolean);

  if (parentMatches || matchingChildren.length > 0) {
    return { ...parent, children: matchingChildren };
  }

  return null;
}).filter(Boolean);

const paginatedNodes = filteredBySearch.slice(0, entriesCount);


  return (
    <div className="space-y-6 bg-white shadow-rounded">

      <div className="flex justify-between items-center mb-4">
  {/* Show Entries Dropdown */}
  <div className="flex items-center space-x-2">
    <label htmlFor="entries">Show</label>
    <select
      id="entries"
      value={entriesCount}
      onChange={(e) => setEntriesCount(Number(e.target.value))}
              className="mx-2 border p-1 rounded w-14 mt-2  "
    >
      {[2, 10, 25, 50, 100].map((num) => (
        <option key={num} value={num}>{num}</option>
      ))}
    </select>
    <span>entries</span>
  </div>

  {/* Search Input */}
  <div>
    <input
      type="text"
      placeholder="Search material..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border p-2 rounded w-64"
    />
  </div>
</div>

      <TreeTable
        value={paginatedNodes}
        tableStyle={{ minWidth: "60rem" }}
        rowClassName={(node) => {
          if (node.data.nodeType === "parent") return "qto-parent-row";
          if (node.data.nodeType === "child") return "qto-child-row";
          return "";
        }}
      >
        <Column field="name" header="Item / Material" expander style={{ width: "25%", fontSize: "14px" }} />
        <Column field="brand_name" header="Brand Name" style={{fontSize: "14px" }}  />
        <Column field="unitCode" header="Unit"  style={{ fontSize: "14px" }} />
        <Column field="multiplier" header="Multiplier" style={{fontSize: "14px" }}  />
        <Column field="actual_qty" header="Qty" style={{  fontSize: "14px" }} />
        <Column
          field="total_cost"
          header="Total Cost"
          style={{  fontSize: "14px" }}
          body={(node) => {
            if (node.data.nodeType === "parent") {
              const found = parentTotals.find(
                (p) => Number(p.mto_parent_id) === Number(node.data.work_item_id)
              );
              return found?.mto_parent_grandTotal
                ? `₱ ${parseFloat(found.mto_parent_grandTotal).toLocaleString()}`
                : "—";
            }
            return node.data?.total_cost
              ? `₱ ${parseFloat(node.data.total_cost).toLocaleString()}`
              : "—";
          }}
        />
        <Column header="Actions" body={actionTemplate} style={{ width: "120px" }} />
      </TreeTable>

      {showRowModal && selectedRowData && (
        <EditModalBOMMaterials
          proposal_id={proposal_id}
          data={{
            ...selectedRowData,
            parent_id: selectedRowData.parent_work_item_id,
            mto_id: selectedRowData.mto_id,
            existingMTOList: existingMTOList,
          }}
          onClose={() => setShowRowModal(false)}
          onSave={() => {
            fetchMaterialCosts();
            fetchParentTotals();
          }}
        />
      )}

      {showDeleteModal && selectedRowData && (
        <DeleteModalBOMMaterials
          data={selectedRowData}
          onClose={() => {
            setShowDeleteModal(false);
            fetchMaterialCosts();
            fetchParentTotals();
          }}
        />
      )}
    </div>
  );
});

export default MaterialListTable;
