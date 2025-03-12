import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule, ClientSideRowModelModule } from "ag-grid-community";
import { provideGlobalGridOptions } from 'ag-grid-community';

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// ✅ Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy" });


const BOMTable = () => {
  // ✅ Styling for Excel-like appearance
  const tableStyles = `
    .excel-grid .ag-cell {
      border: 0.5px solid gray !important; 
      padding: 8px;
    }
    .excel-grid .ag-header-cell, 
    .excel-grid .ag-header-group-cell {
      background-color: #e0e0e0 !important; 
      color: black !important; 
      border: 0.5px solid gray !important; 
      font-weight: bold;
      text-align: center;
    }
  `;

  

  // ✅ State for row data
  const [rowData, setRowData] = useState([
    { id: 1, scopeOfWorks: "Foundation", quantity: 10, unit: "m3", materialUC: 500, laborUC: 200, materialAmount: 5000, laborAmount: 2000, totalAmount: 7000 },
    { id: 2, scopeOfWorks: "Walls", quantity: 20, unit: "m2", materialUC: 300, laborUC: 150, materialAmount: 6000, laborAmount: 3000, totalAmount: 9000 }
  ]);

  // ✅ State for column definitions
  const [columnDefs, setColumnDefs] = useState([
    { field: "id", headerName: "No", width: 80, editable: false },
    { field: "scopeOfWorks", headerName: "Scope of Works", width: 200, editable: true },
    { field: "quantity", headerName: "Quantity", width: 120, editable: true },
    { field: "unit", headerName: "Unit", width: 100, editable: true },
    { 
      headerName: "Material Cost",
      children: [
        { field: "materialUC", headerName: "U/C", width: 120, editable: true },
        { field: "materialAmount", headerName: "Amount", width: 120, editable: false }
      ]
    },
    { 
      headerName: "Labor Cost",
      children: [
        { field: "laborUC", headerName: "U/C", width: 120, editable: true },
        { field: "laborAmount", headerName: "Amount", width: 120, editable: false }
      ]
    },
    { field: "totalAmount", headerName: "Total Amount", width: 140, editable: false }
  ]);

  // ✅ Function to auto-update values when a cell changes
  const onCellValueChanged = (params) => {
    console.log("Edited Cell:", params);

    const updatedRowData = rowData.map((row) =>
      row.id === params.data.id
        ? {
            ...params.data,
            materialAmount: params.data.quantity * params.data.materialUC || 0,
            laborAmount: params.data.quantity * params.data.laborUC || 0,
            totalAmount:
              (params.data.quantity * params.data.materialUC || 0) +
              (params.data.quantity * params.data.laborUC || 0),
          }
        : row
    );
  
    setRowData(updatedRowData);
  };
  

  // ✅ Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // 'row' or 'column'
  const [columnName, setColumnName] = useState("");
  const [subheaderCount, setSubheaderCount] = useState(1);

  // ✅ Function to add a new row
  const addRow = () => {
    const newRow = {
      id: rowData.length + 1,
      scopeOfWorks: "",
      quantity: 0,
      unit: "",
      materialUC: 0,
      laborUC: 0,
      materialAmount: 0,
      laborAmount: 0,
      totalAmount: 0
    };
    setRowData([...rowData, newRow]);
    setIsModalOpen(false);
  };

  // ✅ Function to add a new column
  const addColumn = () => {
    let newColumns = [...columnDefs];

    if (subheaderCount === 2) {
      newColumns.push({
        headerName: columnName,
        children: [
          { field: `${columnName.toLowerCase()}UC`, headerName: "U/C", width: 120, editable: true },
          { field: `${columnName.toLowerCase()}Amount`, headerName: "Amount", width: 120, editable: false }
        ]
      });
    } else {
      newColumns.push({
        field: columnName.toLowerCase(),
        headerName: columnName,
        width: 150,
        editable: true
      });
    }

    setColumnDefs(newColumns);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <style>{tableStyles}</style>

      {/* ✅ Buttons to Open Modal */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => { setModalType("row"); setIsModalOpen(true); }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ➕ Add Row
        </button>

        <button
          onClick={() => { setModalType("column"); setIsModalOpen(true); }}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          ➕ Add Column
        </button>
      </div>

      {/* ✅ Grid */}
      <div className="border border-gray-300">
        <div className="ag-theme-alpine ag-theme-legacy excel-grid" style={{ height: 500, width: "100%" }}>
          <AgGridReact
            key={columnDefs.length} // ✅ Ensure re-render when adding new columns
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              editable: true,
              singleClickEdit: true
            }}
            onCellValueChanged={onCellValueChanged} // ✅ Auto-calculate formulas
          />
        </div>
      </div>

      {/* ✅ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              {modalType === "row" ? "Add a New Row" : "Add a New Column"}
            </h2>

            {modalType === "column" && (
              <>
                <label className="block mb-2">
                  Column Name:
                  <input
                    type="text"
                    value={columnName}
                    onChange={(e) => setColumnName(e.target.value)}
                    className="w-full p-2 border rounded mt-1"
                  />
                </label>

                <label className="block mb-4">
                  Subheaders:
                  <select
                    value={subheaderCount}
                    onChange={(e) => setSubheaderCount(parseInt(e.target.value))}
                    className="w-full p-2 border rounded mt-1"
                  >
                    <option value={1}>1 Subheader</option>
                    <option value={2}>2 Subheaders</option>
                  </select>
                </label>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              <button onClick={modalType === "row" ? addRow : addColumn} className="bg-blue-500 text-white px-4 py-2 rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMTable;
