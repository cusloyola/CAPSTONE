// rowUtils.js

export const deleteRowById = (rowData, rowId, setRowData, setUndoStack, markupPercentage) => {
    // Save current state for undo
    setUndoStack((prev) => [...prev, rowData]);
    // Filter out the row with the given id
    const updatedData = rowData.filter((row) => row.id !== rowId);
    // Recalculate computed rows (Subtotal) based on the updated raw data
    const recalculatedData = recalcComputedRows(updatedData, markupPercentage);
    // Update state with the recalculated data
    setRowData(recalculatedData);
    saveRowDataToLocalStorage(recalculatedData);
  };
  
  export const handleAddRow = (rowData, isSubtotalRowFlag, isMainTitleRowFlag, rowCount, setRowData, setIsModalOpen, markupPercentage, computedRowType) => {
    addRow(rowData, isSubtotalRowFlag, isMainTitleRowFlag, rowCount, setRowData, setIsModalOpen, markupPercentage, computedRowType);
  };
  

  // rowUtils.jsx
export const addRow = (
    rowData,
    isSubtotalRowFlag,
    isMainTitleRowFlag,
    rowCount,
    setRowData,
    setIsModalOpen,
    markupPercentage,
    computedRowType
  ) => {
    const newRow = {
      id: rowCount + 1, // Generate new row ID
      isSubtotalRowFlag,
      isMainTitleRowFlag,
      computedRowType,
      markupPercentage,
      // Add other necessary properties
    };
  
    const updatedRowData = [...rowData, newRow];
    setRowData(updatedRowData);
    localStorage.setItem('rowData', JSON.stringify(updatedRowData));
    setIsModalOpen(true);
  };
  

  // rowUtils.jsx
  export const handleDeleteAllRows = (setRowData, setUndoStack, currentRowData) => () => {
    setUndoStack((prevStack) => {
        console.log("handleDeleteAllRows: Previous rowData:", currentRowData);
        return [...prevStack, currentRowData];
    });
    setRowData([]);
};


export const handleCellKeyDown = (params, rowData, setRowData, setUndoStack, recalcComputedRows, markupPercentage) => {
  if (params.event.key === "Backspace") {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows.length === 0) return;
    
    const rowId = selectedRows[0].id;
    if (!rowId) return;

    setUndoStack((prev) => [...prev, rowData]);
    const updatedData = rowData.filter((row) => row.id !== rowId);
    const recalculatedData = recalcComputedRows(updatedData, markupPercentage);
    setRowData(recalculatedData);

    params.event.preventDefault();
  }
};


export const handleGridKeyDown = (event, gridApi, rowData, setRowData, setUndoStack, undoStack) => {
  if (!gridApi || typeof gridApi.getSelectedRows !== "function") {
    console.error("🚨 gridApi is undefined or invalid:", gridApi);
    return;
  }

  console.log("✅ gridApi is valid:", gridApi);

  if (event.key === "Backspace") {
    const selectedRows = gridApi.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) return;

    const rowId = selectedRows[0].id;
    setUndoStack((prev) => [...prev, rowData]);
    const updatedData = rowData.filter((row) => row.id !== rowId);
    setRowData(updatedData);

    event.preventDefault();
  }
  else if (event.ctrlKey && event.key.toLowerCase() === "z") {
    if (undoStack.length === 0) return;

    const lastState = undoStack[undoStack.length - 1];
    setRowData(lastState);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    event.preventDefault();
  }
};
