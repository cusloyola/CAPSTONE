// BOMTableUtils.js
import { formatNumber, parseNumber, computeTotalAmount } from '../../../utils/calculationsUtils';
import { saveRowData } from "../../../utils/storageUtils";

export const getColumnDefs = () => [
  {
    field: "id",
    headerName: "No",
    width: 80,
    editable: false,
    valueGetter: (params) => {
      const gridApi = params.api;
      if (!gridApi) return ""; // Safety check

      const rowData = [];
      gridApi.forEachNode(node => rowData.push(node.data)); // Get all rows

      if (params.data?.isSubtotal) {
        return ""; // Subtotal rows have no number
      }

      // Count only previous Main Title rows
      const mainTitleCount = rowData
        .slice(0, params.node.rowIndex)
        .filter(row => row.isMainTitle)
        .length;

      return params.data?.isMainTitle ? mainTitleCount + 1 : ""; // Show number for Main Title only
    }
  },
  { field: "scopeOfWorks", headerName: "Scope of Works", width: 350, editable: true },
  {
    field: "quantity",
    headerName: "Quantity",
    width: 120,
    editable: true,
    cellRenderer: (params) => (params.value ? params.value : "") // Hide 0 values
  },
  { field: "unit", headerName: "Unit", width: 100, editable: true },
  {
    headerName: "Material Cost",
    children: [
      {
        field: "materialUC",
        headerName: "U/C",
        width: 120,
        editable: true,
        cellRenderer: (params) => (params.data?.isSubtotal ? "" : formatNumber(params.value || ""))
      },
      {
        field: "materialAmount",
        headerName: "Amount",
        width: 120,
        editable: false,
        cellRenderer: (params) => (params.data?.isSubtotal ? "" : formatNumber(params.value || ""))
      }
    ]
  },
  {
    headerName: "Labor Cost",
    children: [
      {
        field: "laborUC",
        headerName: "U/C",
        width: 120,
        editable: true,
        cellRenderer: (params) => (params.data?.isSubtotal ? "" : formatNumber(params.value || ""))
      },
      {
        field: "laborAmount",
        headerName: "Amount",
        width: 120,
        editable: false,
        cellRenderer: (params) => {
          if (params.data?.isSubtotal) {
            return <span style={{ fontWeight: 'bold' }}>Subtotal</span>;
          }
          return formatNumber(params.value || ""); // No 0s displayed
        },
        cellRendererParams: {
          colSpan: (params) => (params.data?.isSubtotal ? 2 : 1)
        }
      }
    ]
  },
  {
    headerName: "Total Amount",
    field: "totalAmount",
    valueGetter: (params) => {
      if (params.data?.isSubtotal) {
        return formatNumber(params.data.totalAmount || ""); // Subtotal rows formatted properly
      }

      const quantity = parseNumber(params.data.quantity) || 0;
      const materialUC = parseNumber(params.data.materialUC) || 0;
      const laborAmount = parseNumber(params.data.laborAmount) || 0;

      let totalAmount = materialUC * quantity + laborAmount;

      return totalAmount ? formatNumber(totalAmount) : ""; // Hide 0 values
    },
    cellStyle: (params) => (params.data?.isSubtotal ? { textAlign: 'left', fontWeight: 'bold' } : {}),
    cellRendererParams: {
      colSpan: (params) => (params.data?.isSubtotal ? 2 : 1)
    }
  }
];

export const addRow = (rowData, isSubtotalRow, isMainTitleRow, rowCount, setRowData, setIsModalOpen) => {
  if (!Array.isArray(rowData)) {
    console.error("rowData is not an array:", rowData);
    return;
  }

  const count = isSubtotalRow ? 1 : rowCount;

  if (!isSubtotalRow && !isMainTitleRow && (isNaN(count) || count <= 0)) {
    alert("Please enter a valid number of rows.");
    return;
  }

  let newRows = [];

  if (isSubtotalRow) {
    let lastSubtotalIndex = rowData.map(row => row.isSubtotal).lastIndexOf(true);
    let startIdx = lastSubtotalIndex === -1 ? 0 : lastSubtotalIndex + 1;

    let subtotal = rowData.slice(startIdx).reduce((acc, row) => {
      if (!row.isSubtotal) { // Ignore other subtotal rows
        acc += parseNumber(row.totalAmount); // Correct summation
      }
      return acc;
    }, 0);

    newRows.push({
      id: rowData.length + 1,
      scopeOfWorks: "",
      quantity: "",
      unit: "",
      materialUC: "",
      laborUC: "",
      materialAmount: "",
      laborAmount: "",
      totalAmount: formatNumber(subtotal), // Format properly
      isSubtotal: true,
      isMainTitle: false,
    });
  } else if (isMainTitleRow) {
    const lastMainTitleCount = rowData.filter(row => row.isMainTitle).length;

    newRows.push({
      id: lastMainTitleCount + 1, // Increment Main Title ID
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
    newRows = Array.from({ length: count }, () => ({
      id: "",
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
    localStorage.setItem('rowData', JSON.stringify(updatedData)); // Save to local storage
    return updatedData;
  });

  setIsModalOpen(false);
};
export const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    const { colDef, data, newValue } = params;
    
    // Get the column that was updated (e.g., "materialAmount", "laborAmount")
    const updatedField = colDef.field;
  
    // Parse the new value from input, cleaning commas and handling decimals
    const parsedValue = parseNumber(newValue);
    data[updatedField] = parsedValue;
  
    // Update the rowData
    updatedRowData[params.rowIndex] = { ...data };
    
    // Recalculate totals after update
    const updatedRowDataWithTotal = updatedRowData.map((row) => {
      const materialAmount = parseNumber(row.materialAmount);
      const laborAmount = parseNumber(row.laborAmount);
      const totalAmount = materialAmount + laborAmount; // Sum both amounts
      return { ...row, totalAmount: formatNumber(totalAmount) }; // Update totalAmount with formatted value
    });
  
    setRowData(updatedRowDataWithTotal); // Set the updated row data in state
  
    // Optionally, save the updated row data to localStorage
    localStorage.setItem('rowData', JSON.stringify(updatedRowDataWithTotal));
  };
  