import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { provideGlobalGridOptions } from 'ag-grid-community';
import BOMTableModal from './BOMTableModal';
// import { computeTotalCost, computeTotalAmount} from '../../../utils/calculationsUtils';
import { getColumnDefs, addRow, onCellValueChanged } from '../../../utils/tableUtils';
import { loadRowData, saveRowData } from "../../../utils/storageUtils";




import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";




// ✅ Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy" });




const BOMTable = () => {
  const [showModal, setShowModal] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columnDefs] = useState(getColumnDefs());




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




  const [rowCount, setRowCount] = useState(1);
  const [isSubtotalRow, setIsSubtotalRow] = useState(false);
  const [modalType, setModalType] = useState(""); // 'row' or 'column'
  const [columnName, setColumnName] = useState("");
  const [subheaderCount, setSubheaderCount] = useState(1);
  const [isMainTitleRow, setIsMainTitleRow] = useState(false);




 // ✅ Load row data from localStorage when the component mounts
useEffect(() => {
  const savedRowData = localStorage.getItem("rowData");
  if (savedRowData) {
    setRowData(JSON.parse(savedRowData)); // Set the row data if it exists in localStorage
  }
}, []); // Runs only once when the component mounts

// ✅ Save row data to localStorage whenever rowData changes
useEffect(() => {
  if (rowData.length > 0) {
    localStorage.setItem("rowData", JSON.stringify(rowData));
  }
}, [rowData]); // Runs every time rowData changes


  // Handle Add Row
  const handleAddRow = (isSubtotalRow, isMainTitleRow, rowCount) => {
    addRow(rowData, isSubtotalRow, isMainTitleRow, rowCount, setRowData, setIsModalOpen);
  };




  // Handle Cell Value Changes
  const handleCellValueChanged = (params) => {
    onCellValueChanged(params, setRowData);
  };






  return (
    <div className="p-4">
      <style>{tableStyles}</style>




      {/* ✅ Buttons to Open Modal */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => {
            setModalType("row");
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ➕ Add Row
        </button>




        <button
          onClick={() => {
            setModalType("column");
            setIsModalOpen(true);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          ➕ Add Column
        </button>
      </div>




      {/* ✅ Grid */}
      <div className="border border-gray-300">
        <div className="ag-theme-alpine ag-theme-legacy excel-grid" style={{ height: 1500, width: "100%" }}>



        <AgGridReact
  rowData={rowData}
  columnDefs={columnDefs}
  defaultColDef={{
    resizable: true,
    sortable: true,
    filter: true,
    editable: true,
    singleClickEdit: true,
  }}
  onCellValueChanged={(params) => onCellValueChanged(params, setRowData)}
/>


 
        </div>
      </div>




      {/* ✅ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-lg font-semibold mb-4">
              {modalType === "row" ? "Add a New Row" : "Add a New Column"}
            </h2>




            {modalType === "row" && (
              <>
                <label className="block mb-2">
                  <input
                    type="radio"
                    name="rowType"
                    value="regular"
                    checked={!isSubtotalRow && !isMainTitleRow}
                    onChange={() => {
                      setIsSubtotalRow(false);
                      setIsMainTitleRow(false);
                    }}
                    className="mr-2"
                  />
                  Regular Row
                </label>




                <label className="block mb-2">
                  <input
                    type="radio"
                    name="rowType"
                    value="mainTitle"
                    checked={isMainTitleRow}
                    onChange={() => {
                      setIsMainTitleRow(true);
                      setIsSubtotalRow(false);
                    }}
                    className="mr-2"
                  />
                  Main Title (Fixed No)
                </label>




                <label className="block mb-4">
                  <input
                    type="radio"
                    name="rowType"
                    value="subtotal"
                    checked={isSubtotalRow}
                    onChange={() => {
                      setIsSubtotalRow(true);
                      setIsMainTitleRow(false);
                    }}
                    className="mr-2"
                  />
                  Subtotal Row
                </label>




                <label className="block mb-4">
                  Number of Rows:
                  <input
                    type="number"
                    value={isSubtotalRow || isMainTitleRow ? 1 : rowCount}
                    onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded mt-1"
                    disabled={isSubtotalRow || isMainTitleRow} // Disable if subtotal or main title
                  />
                </label>
              </>
            )}




            {/* ✅ Add Column Form */}
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




            {/* ✅ Buttons */}
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
              <button
                onClick={() => handleAddRow(isSubtotalRow, isMainTitleRow, rowCount)} // Add Row Handler
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={modalType === "column" && !columnName.trim()} // Prevent empty column names
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




export default BOMTable;









