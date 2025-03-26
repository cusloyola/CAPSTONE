// tableUtils.jsx
import { formatNumber, parseNumber, computeTotalAmount } from '../utils/calculationsUtils';
import { loadRowData, saveRowData } from "../utils/storageUtils";


// addRow: Accepts all needed variables as parameters
export const addRow = (
  rowData,
  isSubtotalRow,
  isMainTitleRow,
  rowCount,
  setRowData,
  setIsModalOpen,
  markupPercentage,
  computedRowType = "subtotal" // default value if not provided
) => {
  if (!Array.isArray(rowData)) {
    console.error("rowData is not an array:", rowData);
    return;
  }

  let newRows = [];

  if (isSubtotalRow) {
    // Depending on the computedRowType, add the corresponding computed row.
    if (computedRowType === "total") {
      // *** Change: Filter only rows that are original subtotals (computedType === "Subtotal")
      let totalSum = rowData
        .filter(row => row.isSubtotal && row.computedType === "Subtotal")
        .reduce((acc, row) => acc + parseNumber(row.totalAmount), 0);
      newRows.push({
        id: rowData.length + 1,
        scopeOfWorks: "Total",
        totalAmount: totalSum,
        isSubtotal: true,
        isMainTitle: false,
        computedType: "Total", // Label for computed row
      });
    } else if (computedRowType === "markup") {
      // *** Change: Sum only original subtotal rows for markup calculation
      let totalSum = rowData
        .filter(row => row.isSubtotal && row.computedType === "Subtotal")
        .reduce((acc, row) => acc + parseNumber(row.totalAmount), 0);
      let markupAmount = (totalSum * parseNumber(markupPercentage)) / 100;
      newRows.push({
        id: rowData.length + 1,
        scopeOfWorks: `Markup (${markupPercentage}%)`,
        totalAmount: markupAmount,
        isSubtotal: true,
        isMainTitle: false,
        computedType: "Markup",
      });
    } else if (computedRowType === "grandTotal") {
      // *** Change: Again, only original subtotal rows are summed
      let totalSum = rowData
        .filter(row => row.isSubtotal && row.computedType === "Subtotal")
        .reduce((acc, row) => acc + parseNumber(row.totalAmount), 0);
      let markupAmount = (totalSum * parseNumber(markupPercentage)) / 100;
      let grandTotal = totalSum + markupAmount;
      newRows.push({
        id: rowData.length + 1,
        scopeOfWorks: "Grand Total",
        totalAmount: grandTotal,
        isSubtotal: true,
        isMainTitle: false,
        computedType: "Grand Total",
      });
    } else {
      // Original Subtotal logic (computedRowType "subtotal")
      let lastSubtotalIndex = rowData.map(row => row.isSubtotal).lastIndexOf(true);
      let startIdx = lastSubtotalIndex === -1 ? 0 : lastSubtotalIndex + 1;
      let sumRows = rowData.slice(startIdx);
      let subtotal = sumRows.reduce((acc, row) => {
        if (!row.isSubtotal && row.totalAmount) {
          return acc + parseNumber(row.totalAmount);
        }
        return acc;
      }, 0);
      newRows.push({
        id: rowData.length + 1,
        scopeOfWorks: "Subtotal",
        totalAmount: subtotal,
        isSubtotal: true,
        isMainTitle: false,
        computedType: "Subtotal", // Original subtotal marker
      });
    }
  } else if (isMainTitleRow) {
    newRows.push({
      id: rowData.length + 1,
      scopeOfWorks: "Main Title",
      quantity: "",
      unit: "",
      materialUC: "",
      laborUC: "",
      materialAmount: "",
      laborAmount: "",
      totalAmount: "",
      isSubtotal: false,
      isMainTitle: true,
    });
  } else {
    // Regular row creation remains unchanged
    newRows = Array.from({ length: rowCount }, (_, index) => ({
      id: rowData.length + index + 1,
      scopeOfWorks: "",
      quantity: "",
      unit: "",
      materialUC: "",
      laborUC: "",
      materialAmount: "",
      laborAmount: "",
      totalAmount: "",
      isSubtotal: false,
      isMainTitle: false,
    }));
  }

  setRowData(prevRowData => {
    const updatedData = [...prevRowData, ...newRows];
    saveRowData(updatedData);
    return updatedData;
  });

  setIsModalOpen(false);
};



export const onCellValueChanged = (params, setRowData) => {
  setRowData(prevRowData =>
    prevRowData.map((row) => {
      if (row.id === params.data.id) {
        const updatedRow = { ...row };

        // Update calculations only for the edited row
        updatedRow.materialAmount = parseNumber(updatedRow.quantity) * parseNumber(updatedRow.materialUC);
        updatedRow.laborAmount = parseNumber(updatedRow.quantity) * parseNumber(updatedRow.laborUC);
        updatedRow.totalAmount = computeTotalAmount(updatedRow); // Ensure computeTotalAmount is imported or defined

        return updatedRow;
      }
      return row;
    })
  );
};

export const getColumnDefs = () => [
  {
    field: "id",
    headerName: "No",
    width: 80,
    editable: false,
    rowDrag: true, // Enables drag handle for row reordering
    suppressMenu: true,
    suppressSorting: true,
    // Generates a row number. If the row is computed (isSubtotal true), it returns an empty string.
    valueGetter: (params) => {
      const gridApi = params.api;
      if (!gridApi) return "";
      const rowData = [];
      gridApi.forEachNode(node => rowData.push(node.data));
      if (params.data?.isSubtotal) {
        return "";
      }
      const mainTitleCount = rowData
        .slice(0, params.node.rowIndex)
        .filter(row => row.isMainTitle).length;
      return params.data?.isMainTitle ? mainTitleCount + 1 : "";
    },
  },
  { 
    field: "scopeOfWorks", 
    headerName: "Scope of Works", 
    width: 350, 
    editable: true 
  },
  {
    field: "quantity",
    headerName: "Quantity",
    width: 120,
    editable: true,
    cellRenderer: (params) => (params.value ? params.value : ""),
  },
  { 
    field: "unit", 
    headerName: "Unit", 
    width: 100, 
    editable: true 
  },
  {
    headerName: "Material Cost",
    children: [
      {
        field: "materialUC",
        headerName: "U/C",
        width: 120,
        editable: true,
        // If this row is computed, do not display a value; otherwise, format the value.
        cellRenderer: (params) =>
          params.data?.isSubtotal ? "" : formatNumber(params.value || ""),
      },
      {
        field: "materialAmount",
        headerName: "Amount",
        width: 120,
        editable: false,
        cellRenderer: (params) =>
          params.data?.isSubtotal ? "" : formatNumber(params.value || ""),
      },
    ],
  },
  {
    headerName: "Labor Cost",
    children: [
      {
        field: "laborUC",
        headerName: "U/C",
        width: 120,
        editable: true,
        cellRenderer: (params) =>
          params.data?.isSubtotal ? "" : formatNumber(params.value || ""),
      },
      {
        field: "laborAmount",
        headerName: "Amount",
        width: 120,
        editable: false,
        cellRenderer: (params) => {
          // For computed rows, display the computedType label along with the computed total value in bold.
          if (params.data?.isSubtotal) {
            return (
              <span style={{ fontWeight: "bold" }}>
                {params.data.computedType}: {formatNumber(params.data.totalAmount || "")}
              </span>
            );
          }
          return formatNumber(params.value || "");
        },
        cellRendererParams: {
          // For computed rows, span two columns.
          colSpan: (params) => (params.data?.isSubtotal ? 2 : 1),
        },
      },
    ],
  },
  {
    headerName: "Total Amount",
    field: "totalAmount",
    valueGetter: (params) => {
      // If the row is computed, just return the stored totalAmount (formatted).
      if (params.data?.isSubtotal) {
        return formatNumber(params.data.totalAmount || "");
      }
      // Otherwise, calculate the total amount based on quantity, material unit cost, and labor amount.
      const quantity = parseNumber(params.data.quantity) || 0;
      const materialUC = parseNumber(params.data.materialUC) || 0;
      const laborAmount = parseNumber(params.data.laborAmount) || 0;
      let totalAmount = materialUC * quantity + laborAmount;
      return totalAmount ? formatNumber(totalAmount) : "";
    },
    cellStyle: (params) =>
      params.data?.isSubtotal ? { textAlign: "left", fontWeight: "bold" } : {},
    cellRendererParams: {
      colSpan: (params) => (params.data?.isSubtotal ? 2 : 1),
    },
  },
];


export const deleteRow = (rowData, rowId, setRowData) => {
  const updatedData = rowData.filter(row => row.id !== rowId);
  setRowData(updatedData);
  // Optionally, update localStorage
  localStorage.setItem("rowData", JSON.stringify(updatedData));
};
