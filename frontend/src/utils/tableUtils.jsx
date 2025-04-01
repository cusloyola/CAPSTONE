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


export const onCellValueChanged = (params, prevRowData, setRowData) => {
  const { colDef, newValue, data } = params;
  const updatedRowData = prevRowData.map(row => {
      if (row.id === data.id) {
          let updatedRow = { ...row, [colDef.field]: newValue };

          if (colDef.field === 'quantity' || colDef.field === 'materialUC' || colDef.field === 'laborUC') {
              const quantity = parseFloat(updatedRow.quantity) || 0;
              const materialUC = parseFloat(updatedRow.materialUC) || 0;
              const laborUC = parseFloat(updatedRow.laborUC) || 0;

              updatedRow = {
                  ...updatedRow,
                  materialAmount: quantity * materialUC,
                  laborAmount: quantity * laborUC,
                  totalAmount: (quantity * materialUC) + (quantity * laborUC)
              };
          }

          return updatedRow;
      }
      return row;
  });

  if (typeof setRowData === 'function') {
      setRowData(updatedRowData);
  } else {
    console.error("setRowData is not a function in tableUtils.jsx");
  }

  return updatedRowData;
};


export const getColumnDefs = () => [
  {
      field: "id",
      headerName: "No",
      width: 80,
      editable: false,
      rowDrag: true,
      suppressMenu: true,
      suppressSorting: true,
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
  { field: "scopeOfWorks", headerName: "Scope of Works", width: 350, editable: true },
  { field: "quantity", headerName: "Quantity", width: 120, editable: true },
  { field: "unit", headerName: "Unit", width: 100, editable: true },
  {
      headerName: "Material Cost",
      children: [
          {
              field: "materialUC",
              headerName: "U/C",
              width: 120,
              editable: true,
              cellRenderer: (params) => params.data?.isSubtotal ? "" : formatNumber(params.data?.materialUC || 0),
          },
          {
              field: "materialAmount",
              headerName: "Amount",
              width: 120,
              editable: false,
              cellRenderer: (params) => params.data?.isSubtotal ? "" : formatNumber(params.data?.materialAmount || 0),
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
              cellRenderer: (params) => params.data?.isSubtotal ? "" : formatNumber(params.data?.laborUC || 0),
          },
          {
              field: "laborAmount",
              headerName: "Amount",
              width: 120,
              editable: false,
              cellRenderer: (params) => params.data?.isSubtotal ? "Subtotal" : formatNumber(params.data?.laborAmount || 0), // Modified line
          },
      ],
  },
  {
      headerName: "Total Amount",
      field: "totalAmount",
      valueGetter: (params) => {
          if (params.data?.isSubtotal) {
              return formatNumber(params.data.totalAmount || 0);
          }
          const quantity = parseNumber(params.data?.quantity) || 0;
          const materialUC = parseNumber(params.data?.materialUC) || 0;
          const laborAmount = parseNumber(params.data?.laborAmount) || 0;
          let totalAmount = materialUC * quantity + laborAmount;
          return formatNumber(totalAmount || 0);
      },
      cellStyle: (params) => params.data?.isSubtotal ? { textAlign: "left", fontWeight: "bold" } : {},
      cellRendererParams: {
          colSpan: (params) => (params.data?.isSubtotal ? 2 : 1),
      },
  },
];

export const deleteRow = (rowData, rowId, setRowData) => {
  const updatedData = rowData.filter(row => row.id !== rowId);
  setRowData(updatedData);
  localStorage.setItem("rowData", JSON.stringify(updatedData));
};
