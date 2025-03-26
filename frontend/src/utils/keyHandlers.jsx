// keyHandlers.js

export const handleCellKeyDown = (params, rowData, setRowData, setUndoStack, markupPercentage) => {
    if (params.event.key === "Backspace") {
      const selectedRows = params.api.getSelectedRows();
      if (selectedRows.length === 0) return;
      const rowId = selectedRows[0].id;
      if (!rowId) return;
      deleteRowById(rowData, rowId, setRowData, setUndoStack, markupPercentage);
      params.event.preventDefault();
    }
  };
  
  export const handleGridKeyDown = (event, rowData, setRowData, undoStack, setUndoStack) => {
    // Backspace deletion via grid-level handler
    if (event.key === "Backspace") {
      const selectedRows = gridApi.getSelectedRows();
      if (selectedRows.length === 0) return;
      const rowId = selectedRows[0].id;
      deleteRowById(rowData, rowId, setRowData, setUndoStack);
      event.preventDefault();
    }
    // Ctrl+Z to undo
    else if (event.ctrlKey && event.key.toLowerCase() === "z") {
      undoLastChange(undoStack, setRowData, setUndoStack);
      event.preventDefault();
    }
  };
  

  