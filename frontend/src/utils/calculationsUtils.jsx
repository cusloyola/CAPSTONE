export const formatNumber = (value) => {
  if (value === 0 || value === "") return ""; 
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

export const parseNumber = (value) => {
if (value === "" || value == null) return 0;  
const cleanedValue = value.toString().replace(/,/g, ""); 
return parseFloat(cleanedValue) || 0;  
};

  
// calculationsUtils.js
export const computeTotalAmount = (row) => {
  const quantity = parseNumber(row.quantity);
  const materialUC = parseNumber(row.materialUC);
  const laborAmount = parseNumber(row.laborAmount);
  let totalAmount = 0;
  if (quantity && materialUC) {
    totalAmount += quantity * materialUC;
  }
  if (laborAmount) {
    totalAmount += laborAmount;
  }
  console.log("Computed totalAmount:", totalAmount);
  return totalAmount;
};
export const recalcComputedRows = (allRows, markupPercentage) => {
  // Filter out computed rows (those with isSubtotal true) to work only with raw data
  const rawData = allRows.filter(row => !row.isSubtotal);

  // Update each raw row's totalAmount using computeTotalAmount
  const updatedRawData = rawData.map(row => ({
    ...row,
    totalAmount: computeTotalAmount(row)
  }));

  // If there's only one (or zero) raw row, return the raw data without a computed row
  if (updatedRawData.length < 2) {
    return updatedRawData;
  }

  // Calculate the subtotal by summing up the totalAmount of all raw rows
  const subtotal = updatedRawData.reduce(
    (acc, row) => acc + parseNumber(row.totalAmount),
    0
  );

  // Create a computed row for the subtotal
  const subtotalRow = {
    id: updatedRawData.length + 1,         // A new unique id (ensure uniqueness in your app)
    scopeOfWorks: "Subtotal",
    totalAmount: subtotal,
    isSubtotal: true,                      // Flag to mark this as a computed row
    isMainTitle: false,
    computedType: "Subtotal",              // Label for computed row type
  };

  // Append the subtotal row to the raw data
  return [...updatedRawData, subtotalRow];
};

// This assumes you already have recalcComputedRows defined (see previous snippet)
// and markupPercentage available.

// export const handleDeleteRow = (rowId) => {
//   // Remove the row with the specified id from the data
//   const updatedData = rowData.filter((row) => row.id !== rowId);
  
//   // Recalculate computed rows (e.g., Subtotal) using the updated data.
//   // recalcComputedRows returns raw data with a new Subtotal row appended.
//   const recalculatedData = recalcComputedRows(updatedData, markupPercentage);
  
//   // Update state and localStorage with the recalculated data
//   setRowData(recalculatedData);
//   localStorage.setItem("rowData", JSON.stringify(recalculatedData));
// };
