import React from 'react';

const BOMTableModal = ({ show, handleClose, handleSave, modalType, rowCount, setRowCount, isSubtotalRow, setIsSubtotalRow, isMainTitleRow, setIsMainTitleRow, columnName, setColumnName, subheaderCount, setSubheaderCount }) => {
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 ${show ? 'block' : 'hidden'}`}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-lg font-semibold mb-4">
                    {modalType === "row" ? "Add a New Row" : "Add a New Column"}
                </h2>

                {/* ✅ Add Row Form */}
                {modalType === "row" && (
                    <>
                        <label className="block mb-2">
                            <input
                                type="radio"
                                name="rowType"
                                value="regular"
                                checked={!isSubtotalRow && !isMainTitleRow}
                                onChange={() => {
                                    setIsSubtotalRow(false);
                                    setIsMainTitleRow(false);
                                }}
                                className="mr-2"
                            />
                            Regular Row
                        </label>

                        <label className="block mb-2">
                            <input
                                type="radio"
                                name="rowType"
                                value="mainTitle"
                                checked={isMainTitleRow}
                                onChange={() => {
                                    setIsMainTitleRow(true);
                                    setIsSubtotalRow(false);
                                }}
                                className="mr-2"
                            />
                            Main Title (Fixed No)
                        </label>

                        <label className="block mb-2">
                            <input
                                type="radio"
                                name="rowType"
                                value="subtotal"
                                checked={isSubtotalRow}
                                onChange={() => {
                                    setIsSubtotalRow(true);
                                    setIsMainTitleRow(false);
                                }}
                                className="mr-2"
                            />
                            Subtotal Row
                        </label>

                        <label className="block mb-4">
                            Number of Rows:
                            <input
                                type="number"
                                value={isSubtotalRow || isMainTitleRow ? 1 : rowCount}
                                onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                                className="w-full p-2 border rounded mt-1"
                                disabled={isSubtotalRow || isMainTitleRow} // Disable if subtotal or main title
                            />
                        </label>
                    </>
                )}

                {/* ✅ Add Column Form */}
                {modalType === "column" && (
                    <>
                        <label className="block mb-2">
                            Column Name:
                            <input
                                type="text"
                                value={columnName}
                                onChange={(e) => setColumnName(e.target.value)}
                                className="w-full p-2 border rounded mt-1"
                            />
                        </label>

                        <label className="block mb-4">
                            Subheaders:
                            <select
                                value={subheaderCount}
                                onChange={(e) => setSubheaderCount(parseInt(e.target.value))}
                                className="w-full p-2 border rounded mt-1"
                            >
                                <option value={1}>1 Subheader</option>
                                <option value={2}>2 Subheaders</option>
                            </select>
                        </label>
                    </>
                )}

                {/* ✅ Buttons */}
                <div className="flex justify-end space-x-2">
                    <button onClick={handleClose} className="bg-gray-500 text-white px-4 py-2 rounded">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        disabled={modalType === "column" && !columnName.trim()} // Prevent empty column names
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BOMTableModal;
