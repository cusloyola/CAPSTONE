import React, { useState, useEffect, useRef } from "react";
import { MARKUP_PERCENTAGE, TABLE_STYLES } from './BOMTableConstants';

import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { provideGlobalGridOptions } from 'ag-grid-community';
import BOMTableModal from './BOMTableModal';
import { recalcComputedRows, handleDeleteRow } from '../../../utils/calculationsUtils';
import { getColumnDefs, addRow, onCellValueChanged } from '../../../utils/tableUtils';
import { loadRowData, saveRowData } from "../../../utils/storageUtils";
import { handleGridKeyDown, handleDeleteAllRows, handleCellKeyDown } from "../../../utils/rowUtils";


import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// ✅ Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy" });



const BOMTable = () => {
  const gridApiRef = useRef(null);


  const [showModal, setShowModal] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs] = useState(getColumnDefs());
 
  const tableStyles = TABLE_STYLES;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "row" or "column"
  const [rowCount, setRowCount] = useState(1);
  const [isSubtotalRow, setIsSubtotalRow] = useState(false);
  const [isMainTitleRow, setIsMainTitleRow] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [subheaderCount, setSubheaderCount] = useState(1);
  const [specialRowType, setSpecialRowType] = useState("regular");
  const [markupPercentage, setMarkupPercentage] = useState(MARKUP_PERCENTAGE);
  const [computedRowType, setComputedRowType] = useState("subtotal");
  const [undoStack, setUndoStack] = useState([]); // Stack to store previous rowData states for undo


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
  const handleAddRow = (isSubtotalRowFlag, isMainTitleRowFlag, rowCount) => {
    addRow(
      rowData,
      isSubtotalRowFlag,
      isMainTitleRowFlag,
      rowCount,
      setRowData,
      setIsModalOpen,
      markupPercentage,
      computedRowType // NEW parameter
    );
  };


  // // Handle cell value changes
  // const handleCellValueChanged = (params) => {
  //   onCellValueChanged(params, setRowData);
  // };
  

  const onGridReady = (params) => {
    gridApiRef.current = params.api;
    console.log("✅ Grid API Set:", gridApiRef.current); // Debug log
  };

  const onRowDragEnd = (event) => {
    let newRowData = [];
    event.api.forEachNodeAfterFilterAndSort((node) => {
      newRowData.push(node.data);
    });
    const updatedData = recalcComputedRows(newRowData, markupPercentage);
    setRowData(updatedData);
    saveRowData(updatedData);
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

        <button
          onClick={() => {
            // Also provide an Undo button if needed
            setUndoStack((prevStack) => {
              if (prevStack.length === 0) return prevStack;
              const lastState = prevStack[prevStack.length - 1];
              setRowData(lastState);
              return prevStack.slice(0, prevStack.length - 1);
            });
          }}
          className="bg-yellow-500 text-white px-4 py-2 rounded "
        >
          Undo (Ctrl+Z)
        </button>


        <button
         onClick={() => handleDeleteAllRows(setRowData, setUndoStack)()}
          className="bg-red-500 text-white px-4 py-2 rounded "
        >
          Delete All Rows
        </button>
      </div>


      {/* ✅ Grid */}
      <div className="border border-gray-300" tabIndex="0"   onKeyDown={(event) =>
        handleGridKeyDown(event, gridApiRef.current, rowData, setRowData, setUndoStack, undoStack)
      }    >
        <div className="ag-theme-alpine ag-theme-legacy excel-grid" style={{ height: 1500, width: "100%" }}  >

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
            rowSelection="single"
            suppressRowClickSelection={true}
            enableClickSelection={false}
            onRowDoubleClicked={(params) => params.node.setSelected(true)}
            onGridReady={onGridReady}
            onCellKeyDown={handleCellKeyDown}
            suppressBrowserContextMenu={true}
            rowDragManaged={true}   // Enables managed row dragging
            animateRows={true}        // Optional: adds a nice animation during drag
            onRowDragEnd={onRowDragEnd}  // <-- this is the key
            onCellValueChanged={(params) => onCellValueChanged(params, setRowData)}
          />
        </div>
      </div>

      {/* Markup input (for computed rows) */}
      <div className="mt-4">
        <label>
          Markup Percentage:{" "}
          <input
            type="number"
            value={markupPercentage}
            onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
            className="border p-1"
          />
        </label>
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


                <label className="block mb-2">
                  <input
                    type="radio"
                    name="rowType"
                    value="subtotal"
                    checked={isSubtotalRow && computedRowType === "subtotal"}
                    onChange={() => {
                      setIsSubtotalRow(true);
                      setIsMainTitleRow(false);
                      setComputedRowType("subtotal");
                    }}
                    className="mr-2"
                  />
                  Subtotal Row
                </label>

                <label className="block mb-2">
                  <input
                    type="radio"
                    name="rowType"
                    value="total"
                    checked={isSubtotalRow && computedRowType === "total"}
                    onChange={() => {
                      setIsSubtotalRow(true);
                      setIsMainTitleRow(false);
                      setComputedRowType("total");
                    }}
                    className="mr-2"
                  />
                  Total (Sum of All Subtotals)
                </label>

                <label className="block mb-2">
                  <input
                    type="radio"
                    name="rowType"
                    value="markup"
                    checked={isSubtotalRow && computedRowType === "markup"}
                    onChange={() => {
                      setIsSubtotalRow(true);
                      setIsMainTitleRow(false);
                      setComputedRowType("markup");
                    }}
                    className="mr-2"
                  />
                  Markup (Based on Total)
                </label>


                {isSubtotalRow && computedRowType === "markup" && (
                  <label className="block mb-2">
                    Markup Percentage:
                    <input
                      type="number"
                      value={markupPercentage}
                      onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
                      className="border p-2 ml-2"
                    />
                  </label>
                )}

                <label className="block mb-2">
                  <input
                    type="radio"
                    name="rowType"
                    value="grandTotal"
                    checked={isSubtotalRow && computedRowType === "grandTotal"}
                    onChange={() => {
                      setIsSubtotalRow(true);
                      setIsMainTitleRow(false);
                      setComputedRowType("grandTotal");
                    }}
                    className="mr-2"
                  />
                  Grand Total (Total + Markup)
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
