import { useState } from "react";
import { formatNumber, parseNumber, computeTotalAmount } from "../utils/calculationsUtils";

export const useBOMTable = () => {
  const [rowCount, setRowCount] = useState(1);
  const [isSubtotalRow, setIsSubtotalRow] = useState(false);
  const [isMainTitleRow, setIsMainTitleRow] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([
    { field: "id", headerName: "No", width: 80, editable: true },
    { field: "scopeOfWorks", headerName: "Scope of Works", width: 350, editable: true },
    { field: "quantity", headerName: "Quantity", width: 120, editable: true, cellRenderer: params => params.value === 0 ? "" : params.value },
    { field: "unit", headerName: "Unit", width: 100, editable: true },
    {
      headerName: "Material Cost",
      children: [
        { field: "materialUC", headerName: "U/C", width: 120, editable: true, 
          cellRenderer: params => params.data?.isSubtotal ? "" : formatNumber(params.value)
        },
        { field: "materialAmount", headerName: "Amount", width: 120, editable: false, 
          cellRenderer: params => params.data?.isSubtotal ? "" : formatNumber(params.value)
        }
      ]
    },
    {
      headerName: "Labor Cost",
      children: [
        { field: "laborUC", headerName: "U/C", width: 120, editable: true, 
          cellRenderer: params => params.data?.isSubtotal ? "" : formatNumber(params.value)
        },
        { field: "laborAmount", headerName: "Amount", width: 120, editable: false, 
          cellRenderer: params => params.data?.isSubtotal ? <span style={{ fontWeight: 'bold' }}>Subtotal</span> : formatNumber(params.value)
        }
      ]
    },
    {
      headerName: "Total Amount",
      field: "totalAmount",
      valueGetter: (params) => {
        if (params.data?.isSubtotal) return formatNumber(params.data.totalAmount);
        return formatNumber(computeTotalAmount(params.data));
      },
      cellStyle: params => params.data?.isSubtotal ? { textAlign: 'left', fontWeight: 'bold' } : {}
    }
  ]);

  const addRow = () => {
    let newRows = [];
    if (isSubtotalRow) {
      let subtotal = rowData.reduce((acc, row) => !row.isSubtotal ? acc + parseNumber(row.totalAmount) : acc, 0);
      newRows.push({
        id: "",
        scopeOfWorks: "Subtotal",
        totalAmount: subtotal,
        isSubtotal: true,
        isMainTitle: false,
      });
    } else if (isMainTitleRow) {
      const lastMainTitleCount = rowData.filter(row => row.isMainTitle).length;
      newRows.push({
        id: lastMainTitleCount + 1,
        scopeOfWorks: "Main Title",
        isMainTitle: true,
        isSubtotal: false
      });
    } else {
      newRows = Array.from({ length: rowCount }, () => ({
        scopeOfWorks: "",
        isMainTitle: false,
        isSubtotal: false
      }));
    }
    setRowData(prev => [...prev, ...newRows]);
  };

  const onCellValueChanged = (params) => {
    setRowData(prev => prev.map(row => 
      row.id === params.data.id 
        ? { ...params.data, materialAmount: parseNumber(params.data.quantity) * parseNumber(params.data.materialUC), laborAmount: parseNumber(params.data.quantity) * parseNumber(params.data.laborUC), totalAmount: computeTotalAmount(params.data) }
        : row
    ));
  };

  const addColumn = (columnName, subheaderCount) => {
    let newColumns = [...columnDefs];
    const totalIndex = newColumns.findIndex(col => col.field === "totalAmount");
    const newColumn =
      subheaderCount === 2
        ? {
            headerName: columnName,
            children: [
              { field: `${columnName.toLowerCase()}UC`, headerName: "U/C", width: 120, editable: true },
              { field: `${columnName.toLowerCase()}Amount`, headerName: "Amount", width: 120, editable: false }
            ]
          }
        : {
            field: columnName.toLowerCase(),
            headerName: columnName,
            width: 150,
            editable: true
          };
    if (totalIndex !== -1) {
      newColumns.splice(totalIndex, 0, newColumn);
    } else {
      newColumns.push(newColumn);
    }
    setColumnDefs(newColumns);
  };

  return { rowData, columnDefs, addRow, onCellValueChanged, addColumn, setRowCount, setIsSubtotalRow, setIsMainTitleRow };
};
