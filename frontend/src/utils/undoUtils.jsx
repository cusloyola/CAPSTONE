// undoUtils.js

export const undoLastChange = (undoStack, setRowData, setUndoStack) => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setRowData(lastState);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
  };
  