// tableUtils.jsx
import { formatNumber, parseNumber, computeTotalAmount } from '../utils/calculationsUtils';
import { loadRowData, saveRowData } from "../utils/storageUtils";

// addRow: Accepts all needed variables as parameters
export const addRow = (
  rowData,          // Passed from your component state
  isSubtotalRow,
  isMainTitleRow,
  rowCount,
  setRowData,
  setIsModalOpen
) => {
  console.log(">>> addRow called with parameters:");
  console.log("rowData:", rowData);
  console.log("isSubtotalRow:", isSubtotalRow);
  console.log("isMainTitleRow:", isMainTitleRow);
  console.log("rowCount:", rowCount);

  if (!Array.isArray(rowData)) {
    console.error("rowData is not an array:", rowData);
    return;
  }

  const count = isSubtotalRow ? 1 : rowCount;
  console.log("Computed count:", count);
  if (!isSubtotalRow && !isMainTitleRow && (isNaN(count) || count <= 0)) {
    console.warn("Invalid row count entered:", count);
    alert("Please enter a valid number of rows.");
    return;
  }

  let newRows = [];

  if (isSubtotalRow) {
    console.log(">>> Creating subtotal row");
    let lastSubtotalIndex = rowData.map(row => row.isSubtotal).lastIndexOf(true);
    console.log("Last subtotal index:", lastSubtotalIndex);

    let startIdx = lastSubtotalIndex === -1 ? 0 : lastSubtotalIndex + 1;
    console.log("Start index for subtotal calculation:", startIdx);

    let sumRows = rowData.slice(startIdx);
    console.log("Rows to be summed for subtotal:", sumRows);

    let subtotal = sumRows.reduce((acc, row) => {
      if (!row.isSubtotal && row.totalAmount) {
        const parsedAmount = parseFloat(row.totalAmount) || 0;
        console.log("Adding row totalAmount:", row.totalAmount, "parsed as", parsedAmount);
        return acc + parsedAmount;
      }
      return acc;
    }, 0);
    console.log("Computed subtotal:", subtotal);

    newRows.push({
      id: rowData.length + 1,
      scopeOfWorks: "",
      quantity: "",
      unit: "",
      materialUC: "",
      laborUC: "",
      materialAmount: "",
      laborAmount: "",
      totalAmount: subtotal,
      isSubtotal: true,
      isMainTitle: false,
    });
    console.log("New subtotal row created:", newRows[0]);
  } else if (isMainTitleRow) {
    console.log(">>> Creating main title row");
    const lastMainTitleCount = rowData.filter(row => row.isMainTitle).length;
    console.log("Last main title count:", lastMainTitleCount);
    newRows.push({
      id: lastMainTitleCount + 1,
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
    console.log("New main title row created:", newRows[0]);
  } else {
    console.log(">>> Creating", count, "regular row(s)");
    newRows = Array.from({ length: count }, () => ({
      id: "", // Regular rows get a blank ID
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
    console.log("New regular row(s) created:", newRows);
  }

  console.log(">>> Updating state with new rows");
  setRowData(prevRowData => {
    console.log("Previous rowData:", prevRowData);
    const updatedData = [...prevRowData, ...newRows];
    console.log("Updated rowData:", updatedData);
    saveRowData(updatedData);
    console.log("Row data saved to localStorage");
    return updatedData;
  });

  setIsModalOpen(false);
  console.log("Modal closed. addRow execution complete.");
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
    valueGetter: (params) => {
      const gridApi = params.api;
      if (!gridApi) return ""; // Safety check




      const rowData = [];
      gridApi.forEachNode(node => rowData.push(node.data)); // Get all rows




      if (params.data?.isSubtotal) {
        return ""; // Subtotal rows have no number
      }




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



