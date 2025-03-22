export const formatNumber = (value) => {
  if (value === 0 || value === "") return ""; // Return empty for zero or blank values
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

export const parseNumber = (value) => {
if (value === "" || value == null) return 0;  // If empty or null, return 0
const cleanedValue = value.toString().replace(/,/g, ""); // Remove commas
return parseFloat(cleanedValue) || 0;  // Parse number or return 0 if invalid
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
