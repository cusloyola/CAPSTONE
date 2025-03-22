import { formatNumber, parseNumber } from '../../../utils/calculationsUtils';

export const getColumnDefs = (rowData) => [
  {
    field: "id",
    headerName: "No",
    width: 80,
    editable: false,
    valueGetter: (params) => {
      const gridApi = params.api;
      if (!gridApi) return ""; 

      const rowData = [];
      gridApi.forEachNode(node => rowData.push(node.data));

      if (params.data?.isSubtotal) return "";
      
      const mainTitleCount = rowData
        .slice(0, params.node.rowIndex)
        .filter(row => row.isMainTitle)
        .length;

      return params.data?.isMainTitle ? mainTitleCount + 1 : "";
    }
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
    cellRenderer: (params) => (params.value ? params.value : "")
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
          return formatNumber(params.value || "");
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
        return formatNumber(params.data.totalAmount || "");
      }

      const quantity = parseNumber(params.data.quantity) || 0;
      const materialUC = parseNumber(params.data.materialUC) || 0;
      const laborAmount = parseNumber(params.data.laborAmount) || 0;

      let totalAmount = materialUC * quantity + laborAmount;

      return totalAmount ? formatNumber(totalAmount) : "";
    },
    cellStyle: (params) => (params.data?.isSubtotal ? { textAlign: 'left', fontWeight: 'bold' } : {}),
    cellRendererParams: {
      colSpan: (params) => (params.data?.isSubtotal ? 2 : 1)
    }
  }
];
