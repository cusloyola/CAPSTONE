// BOMTable.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api";
import { MARKUP_PERCENTAGE, TABLE_STYLES } from './BOMTableConstants';
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import { provideGlobalGridOptions } from 'ag-grid-community';
import { recalcComputedRows } from '../../../utils/calculationsUtils';
import { getColumnDefs, onCellValueChanged, addRow } from '../../../utils/tableUtils';
import { handleGridKeyDown, handleDeleteAllRows, handleCellKeyDown } from "../../../utils/rowUtils";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { v4 as uuidv4 } from 'uuid';

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy" });

const BOMTable = ({ user }) => {
    const { bomId } = useParams();
    const gridApiRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [columnDefs] = useState(getColumnDefs());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const tableStyles = TABLE_STYLES;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [rowCount, setRowCount] = useState(1);
    const [isSubtotalRow, setIsSubtotalRow] = useState(false);
    const [isMainTitleRow, setIsMainTitleRow] = useState(false);
    const [columnName, setColumnName] = useState("");
    const [subheaderCount, setSubheaderCount] = useState(1);
    const [computedRowType, setComputedRowType] = useState("Standard"); // Default to Standard
    const [undoStack, setUndoStack] = useState([]);
    const [markupPercentage, setMarkupPercentage] = useState(MARKUP_PERCENTAGE);

    const fetchBOMData = async () => {
        setLoading(true);
        setError(null);
    
        try {
            console.log(`Fetching BOM data for BOM ID: ${bomId}`);
            const response = await fetch(`http://localhost:5000/api/bom/${bomId}`);
            console.log("Response Status:", response.status);
    
            if (!response.ok) {
                throw new Error(`Failed to fetch BOM data: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Full BOM Data Response:", data);
    
            if (data.bomDetails && Array.isArray(data.bomDetails)) {
                if (data.bomDetails.length > 0) {
                    const transformedData = data.bomDetails
                        .map((detail) => ({
                            row_id: String(detail.row_id || null),
                            no: detail.no || 0,
                            scopeOfWorks: detail.scope_of_works || '',
                            quantity: detail.quantity || 0,
                            unit: detail.unit || '',
                            materialUC: detail.mc_uc || 0,
                            laborUC: detail.lc_uc || 0,
                            materialAmount: parseFloat(detail.mc_amount) || 0,
                            laborAmount: detail.row_type === 'subtotal' ? 'Subtotal' : (parseFloat(detail.lc_amount) || 0),
                            totalAmount: parseFloat(detail.total_cost) || 0,
                            computedType: detail.row_type || 'Standard',
                        }))
                        .filter(row => (row.computedType !== 'subtotal' && (row.scopeOfWorks && row.scopeOfWorks.trim() !== '') || row.quantity > 0 || row.materialUC !== 0 || row.laborUC !== 0 || row.materialAmount !== 0 || row.laborAmount !== 0 || row.totalAmount !== 0) || (row.computedType === 'subtotal' && (row.laborAmount !== 0 || row.totalAmount !== 0)));                        const uniqueData = [...new Map(transformedData.map(row => [row.row_id, row])).values()];
    
                    //Recalculate markup, total, and grand total.
                    const recalculatedData = recalculateComputedRows(uniqueData, markupPercentage);
    
                    setRowData(recalculatedData);
                    console.log("rowData after fetch:", recalculatedData);
                    console.log("✅ Updated rowData (unique only):", recalculatedData);
                } else {
                    setRowData([]);
                    console.log("⚠️ bomDetails is empty. Initializing with empty rowData.");
                }
            } else {
                setRowData([]);
                console.log("⚠️ bomDetails is empty or undefined. Initializing with empty rowData.");
                alert("There is no data for this BOM ID");
            }
        } catch (error) {
            console.error("Error fetching BOM data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const recalculateComputedRows = (data, markup) => {
        let subtotal = 0;
        let total = 0;
        let markupAmount = 0;
        let grandTotal = 0;
    
        const recalculatedData = data.map((row, index, arr) => {
            if (row.computedType === 'subtotal') {
                subtotal = 0;
                for (let i = index - 1; i >= 0; i--) {
                    if (arr[i].computedType === 'subtotal' || arr[i].computedType === 'total' || arr[i].computedType === 'markup' || arr[i].computedType === 'grandTotal') {
                        break;
                    }
                    if (arr[i].computedType !== 'subtotal') {
                        subtotal += arr[i].materialAmount + arr[i].laborAmount;
                    }
                }
                total += subtotal; // Calculate total as we go
                return {
                    ...row,
                    totalAmount: subtotal,
                    subtotal_cost: subtotal,
                    laborAmount: 'Subtotal',
                    quantity: '', // Set quantity to an empty string
                };
            } else if (row.computedType === 'total') {
                return {
                    ...row,
                    totalAmount: total,
                    laborAmount: 'Total Cost',
                    quantity: '', // Set quantity to an empty string
                };
            } else if (row.computedType === 'markup') {
                markupAmount = total * (markup / 100);
                grandTotal = total + markupAmount;
    
                console.log(`Markup computed: ${markupAmount}, Grand Total: ${grandTotal}`);
    
                return {
                    ...row,
                    totalAmount: markupAmount,
                    laborAmount: 'Markup',
                    quantity: '', // Set quantity to an empty string
                };
            } else if (row.computedType === 'grandTotal') {
                return {
                    ...row,
                    totalAmount: grandTotal,
                    laborAmount: 'Grand Total',
                    quantity: '', // Set quantity to an empty string
                };
            }
            return row;
        });
        return recalculatedData;
    };

    const saveData = async () => {
        if (isSaving) return;
        setIsSaving(true);
    
        const storedUserId = localStorage.getItem('user_id');
        const userId = user?.user_id || storedUserId;
    
        if (!userId) {
            console.warn("⚠️ No user_id found.");
            setIsSaving(false);
            return;
        }
    
        try {
            console.log("🚀 Saving rowData:", rowData);
    
            const totalCostSum = rowData.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
    
            const payload = {
                bom_id: bomId,
                user_id: userId,
                date: selectedDate.toISOString().split('T')[0],
                rowData: rowData
            .filter(row => row.computedType === 'subtotal' || (row.computedType !== 'subtotal' && (
                row.quantity !== 0 ||
                row.unit !== "" ||
                row.materialUC !== 0 ||
                row.laborUC !== 0 ||
                row.materialAmount !== 0 ||
                row.laborAmount !== 0 ||
                row.totalAmount !== 0 ||
                row.scopeOfWorks !== ""
            )) || (row.computedType === 'subtotal' && (row.laborAmount !== 0 || row.totalAmount !== 0)))
            .map(row => ({
                row_id: Number(row.row_id),
                no: row.no,
                scope_of_works: row.scopeOfWorks,
                quantity: Number(row.quantity),
                unit: row.unit,
                mc_uc: Number(row.materialUC),
                lc_uc: Number(row.laborUC),
                mc_amount: Number(row.materialAmount),
                lc_amount: Number(row.laborAmount),
                total_cost: Number(row.totalAmount),
                row_type: row.computedType,
            })),
            };
    
            console.log("Sending payload to backend:", payload);
    
            const response = await api.post("/bom/save", payload, {
                headers: { "Content-Type": "application/json" },
            });
    
            console.log("✅ BOM data saved successfully:", response.data);
            fetchBOMData();
        } catch (error) {
            console.error("❌ Error saving BOM data:", error.response?.data || error.message);
        } finally {
            setIsSaving(false);
        }
    };

    
    const handleAddRow = async (isSubtotalRowFlag, isMainTitleRowFlag, rowCount = 1) => {
        let updatedRowData = [...rowData];

        if (isSubtotalRowFlag) {
            let subtotal = 0;
            updatedRowData.forEach(row => {
                if (row.computedType !== 'subtotal' && row.computedType !== 'total' && row.computedType !== 'markup' && row.computedType !== 'grandTotal') {
                    subtotal += row.materialAmount + row.laborAmount;
                }
            });

            let totalCost = 0;
            if (computedRowType === 'total') {
                updatedRowData.forEach(row => {
                    if (row.computedType === 'subtotal') {
                        totalCost += row.totalAmount;
                    }
                });
            }

            let markupAmount = 0;
            if (computedRowType === 'markup') {
                totalCost = updatedRowData.find(row => row.computedType === 'total')?.totalAmount || 0;
                markupAmount = totalCost * (markupPercentage / 100);
            }

            let grandTotal = 0;
            if (computedRowType === 'grandTotal') {
                totalCost = updatedRowData.find(row => row.computedType === 'total')?.totalAmount || 0;
                markupAmount = updatedRowData.find(row => row.computedType === 'markup')?.laborAmount || 0;
                grandTotal = totalCost + markupAmount;
            }

            const maxRowId = updatedRowData.reduce((max, row) => parseInt(row.row_id, 10) > max ? parseInt(row.row_id, 10) : max, 0);
            const newRowId = (maxRowId + 1).toString();

            const newRow = {
                row_id: newRowId,
                scopeOfWorks: computedRowType === 'subtotal' ? '' : computedRowType === 'total' ? '' : computedRowType === 'markup' ? 'Markup' : computedRowType === 'grandTotal' ? 'Grand Total' : 'Subtotal',
                materialUC: 0,
                laborUC: 0,
                materialAmount: 0,
                laborAmount: computedRowType === 'subtotal' ? subtotal : computedRowType === 'total' ? totalCost : computedRowType === 'markup' ? markupAmount : computedRowType === 'grandTotal' ? grandTotal : 0,
                totalAmount: computedRowType === 'subtotal' ? subtotal : computedRowType === 'total' ? totalCost : computedRowType === 'markup' ? markupAmount : computedRowType === 'grandTotal' ? grandTotal : 0,
                computedType: computedRowType,
                isSubtotal: true,
                subtotal_cost: computedRowType === 'subtotal' ? subtotal : 0,
            };

            updatedRowData.push(newRow);
        } else {
            for (let i = 0; i < rowCount; i++) {
                const maxRowId = updatedRowData.reduce((max, row) => parseInt(row.row_id, 10) > max ? parseInt(row.row_id, 10) : max, 0);
                const newRowId = (maxRowId + 1).toString();
                updatedRowData.push({
                    row_id: newRowId,
                    scopeOfWorks: '',
                    materialUC: 0,
                    laborUC: 0,
                    materialAmount: 0,
                    laborAmount: 0,
                    totalAmount: 0,
                    computedType: 'Standard',
                    isSubtotal: false,
                });
            }
        }

        setRowData(recalcComputedRows(updatedRowData, markupPercentage));
        setIsModalOpen(false);
        setComputedRowType("Standard");
    };

    useEffect(() => {
        if (bomId) {
            fetchBOMData();
        }
    }, [bomId]);

    const onGridReady = (params) => {
        gridApiRef.current = params.api;
    };

    const onRowDragEnd = (event) => {
        setRowData(prevRowData => {
            let newRowData = [];
            event.api.forEachNodeAfterFilterAndSort((node) => {
                newRowData.push({ ...node.data });
            });

            const updatedData = recalcComputedRows(newRowData, markupPercentage);
            return updatedData;
        });
    };

    const handleCellValueChange = (params) => {
        setRowData(prevRowData => {
            const updatedRowData = onCellValueChanged(params, prevRowData);
            console.log("handleCellValueChange updated rowData:", updatedRowData);
            saveData(updatedRowData);
            return updatedRowData;
        });
    };

    const onCellValueChanged = (params, prevRowData) => {
        const { rowIndex, colDef, value } = params;
        const field = colDef.field;

        const updatedData = prevRowData.map((row, index) => {
            if (index === rowIndex) {
                const updatedRow = {
                    ...row,
                    [field]: value,
                };
                const materialAmount = updatedRow.quantity * updatedRow.materialUC;
                const laborAmount = updatedRow.quantity * updatedRow.laborUC;
                const totalAmount = materialAmount + laborAmount;

                return {
                    ...updatedRow,
                    materialAmount: materialAmount,
                    laborAmount: laborAmount,
                    totalAmount: totalAmount,
                }
            }
            return row;
        });
        return updatedData;
    };

    const recalcComputedRows = (data, markup) => {
        return data.map((row, index, arr) => {
            if (row.computedType === 'subtotal') {
                let subtotal = 0;
                for (let i = index - 1; i >= 0; i--) {
                    if (arr[i].computedType === 'subtotal' || arr[i].computedType === 'total' || arr[i].computedType === 'markup' || arr[i].computedType === 'grandTotal') {
                        break;
                    }
                    if (arr[i].computedType !== 'subtotal') {
                        subtotal += arr[i].materialAmount + arr[i].laborAmount;
                    }
                }
                return {
                    ...row,
                    totalAmount: subtotal,
                    subtotal_cost: subtotal,
                };
            } else if (row.computedType === 'total') {
                let totalCost = arr.reduce((sum, item) => {
                    return item.computedType === 'subtotal' ? sum + item.totalAmount : sum;
                }, 0);
                return {
                    ...row,
                    laborAmount: totalCost,
                    totalAmount: totalCost,
                };
            }
            return row;
        });
    };

    return (
        <div className="p-4">
            <style>{tableStyles}</style>
            <div className="flex space-x-4 mb-4">
                <button onClick={() => { setModalType("row"); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">➕ Add Row</button>
                <button onClick={() => { setModalType("column"); setIsModalOpen(true); }} className="bg-green-500 text-white px-4 py-2 rounded">➕ Add Column</button>
                <button onClick={() => saveData()} className="bg-green-500 text-white p-2 rounded">Save Data</button>
                <button onClick={() => { setUndoStack((prevStack) => { if (prevStack.length === 0) return prevStack; const lastState = prevStack[prevStack.length - 1]; setRowData(lastState); return prevStack.slice(0, prevStack.length - 1); }); }} className="bg-yellow-500 text-white px-4 py-2 rounded ">Undo (Ctrl+Z)</button>
                <button onClick={() => handleDeleteAllRows(setRowData, setUndoStack, rowData)()} className="bg-red-500 text-white px-4 py-2 rounded ">Delete All Rows</button>
            </div>
            <div className="border border-gray-300" tabIndex="0" onKeyDown={(event) => handleGridKeyDown(event, gridApiRef.current, rowData, setRowData, setUndoStack, undoStack)}>
                <div className="ag-theme-alpine ag-theme-legacy excel-grid" style={{ height: 1800, width: "100%" }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={{ resizable: true, sortable: true, filter: true, editable: true, singleClickEdit: true, }}
                        rowSelection="single"
                        suppressRowClickSelection={true}
                        enableClickSelection={false}
                        onRowDoubleClicked={(params) => params.node.setSelected(true)}
                        onGridReady={onGridReady}
                        onCellKeyDown={handleCellKeyDown}
                        suppressBrowserContextMenu={true}
                        rowDragManaged={true}
                        animateRows={true}
                        onCellValueChanged={handleCellValueChange}
                    />
                </div>
            </div>
            <div className="mt-4">
                <label>Markup Percentage: <input type="number" value={markupPercentage} onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)} className="border p-1" /></label>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-lg font-semibold mb-4">{modalType === "row" ? "Add a New Row" : "Add a New Column"}</h2>
                        {modalType === "row" && (
                            <>
                                <label className="block mb-2"><input type="radio" name="rowType" value="regular" checked={!isSubtotalRow && !isMainTitleRow} onChange={() => { setIsSubtotalRow(false); setIsMainTitleRow(false); setComputedRowType("Standard"); }} className="mr-2" />Regular Row</label>
                                <label className="block mb-2"><input type="radio" name="rowType" value="mainTitle" checked={isMainTitleRow} onChange={() => { setIsMainTitleRow(true); setIsSubtotalRow(false); setComputedRowType("Standard"); }} className="mr-2" />Main Title (Fixed No)</label>
                                <label className="block mb-2"><input type="radio" name="rowType" value="subtotal" checked={isSubtotalRow && computedRowType === "subtotal"} onChange={() => { setIsSubtotalRow(true); setIsMainTitleRow(false); setComputedRowType("subtotal"); }} className="mr-2" />Subtotal Row</label>
                                <label className="block mb-2"><input type="radio" name="rowType" value="total" checked={isSubtotalRow && computedRowType === "total"} onChange={() => { setIsSubtotalRow(true); setIsMainTitleRow(false); setComputedRowType("total"); }} className="mr-2" />Total (Sum of All Subtotals)</label>
                                <label className="block mb-2"><input type="radio" name="rowType" value="markup" checked={isSubtotalRow && computedRowType === "markup"} onChange={() => { setIsSubtotalRow(true); setIsMainTitleRow(false); setComputedRowType("markup"); }} className="mr-2" />Markup (Based on Total)</label>
                                {isSubtotalRow && computedRowType === "markup" && (<label className="block mb-2">Markup Percentage: <input type="number" value={markupPercentage} onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)} className="border p-2 ml-2" /></label>)}
                                <label className="block mb-2"><input type="radio" name="rowType" value="grandTotal" checked={isSubtotalRow && computedRowType === "grandTotal"} onChange={() => { setIsSubtotalRow(true); setIsMainTitleRow(false); setComputedRowType("grandTotal"); }} className="mr-2" />Grand Total (Total + Markup)</label>
                                <label className="block mb-4">Number of Rows: <input type="number" value={isSubtotalRow || isMainTitleRow ? 1 : rowCount} onChange={(e) => setRowCount(parseInt(e.target.value) || 1)} className="w-full p-2 border rounded mt-1" disabled={isSubtotalRow || isMainTitleRow} /></label>
                            </>
                        )}
                        {modalType === "column" && (
                            <>
                                <label className="block mb-2">Column Name: <input type="text" value={columnName} onChange={(e) => setColumnName(e.target.value)} className="w-full p-2 border rounded mt-1" /></label>
                                <label className="block mb-4">Subheaders: <select value={subheaderCount} onChange={(e) => setSubheaderCount(parseInt(e.target.value))} className="w-full p-2 border rounded mt-1"><option value={1}>1 Subheader</option><option value={2}>2 Subheaders</option></select></label>
                            </>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                            <button onClick={() => handleAddRow(isSubtotalRow, isMainTitleRow, rowCount)} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={modalType === "column" && !columnName.trim()}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BOMTable;