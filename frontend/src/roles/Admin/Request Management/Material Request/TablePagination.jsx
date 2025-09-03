import React from 'react';

const TablePagination = ({
    currentPage,
    totalPages,
    indexOfFirst,
    indexOfLast,
    filteredRequests,
    entriesPerPage,
    handleEntriesChange,
    handlePrevious,
    handleNext
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0 px-4 pb-4">
            <div className="text-sm text-gray-600">
                Showing {filteredRequests.length === 0 ? "0" : `${indexOfFirst + 1} to ${Math.min(indexOfLast, filteredRequests.length)}`} of {filteredRequests.length} entries
            </div>
            <div className="space-x-2">
                <select value={entriesPerPage} onChange={handleEntriesChange} className="mx-2 w-14 px-2 py-1 border rounded">
                    {[5, 10, 25, 50].map((num) => (<option key={num} value={num}>{num}</option>))}
                </select>
                <button onClick={handlePrevious} disabled={currentPage === 1} className={`px-3 py-1 border rounded ${currentPage === 1 ? "bg-gray-200 text-gray-400" : "bg-white hover:bg-gray-100"}`}>
                    Previous
                </button>
                <button onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0} className={`px-3 py-1 border rounded ${currentPage === totalPages || totalPages === 0 ? "bg-gray-200 text-gray-400" : "bg-white hover:bg-gray-100"}`}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default TablePagination;