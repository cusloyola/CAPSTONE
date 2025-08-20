import React from "react";
import { FaEllipsisV } from "react-icons/fa";


const AdminInspectionChecklistTable = () => {
    return(
          <div className="min-h-screen space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-10 mb-2 gap-4">

                <select
                    className="border px-3 py-1 rounded-lg text-md h-10 w-40"
                  
                >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Unviewed">Unviewed</option>
                </select>

            </div>


            {/* Filters & Export */}
            <div className="mt-10 mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <div className="text-sm text-gray-700 ">
                        Show
                        <select
                            className="mx-2 px-2 py-1 border rounded w-14"
                            
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        entries
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            placeholder="Search reports..."
                    
                            className="border px-3 py-1 rounded-lg text-md h-10"
                        />
                    </div>
                </div>

                {/* Table */}
                <table className="table-auto w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100 ">
                        <tr>
                            
                                <th
                                    className="border px-4 py-2 text-center"
                                >
                                    Hellow
                                </th>
                        
                            <th className="border px-4 py-2 text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                      
                            <tr
                              
                                className="hover:bg-gray-50"
                            >
                               
                                    <td
                                        className="border px-4 py-2"
                                    >
                                        
                                    </td>
                   
                                <td className="px-6 py-4 text-sm relative">
                                    <div
                                        className="relative inline-block text-left"
                                    >
                                        <button
                                            className="text-gray-600 hover:text-gray-900 focus:outline-none"
                                        >
                                            <FaEllipsisV />
                                        </button>

                                      
                                            <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg">
                                                <div className="py-1">
                                                    <button
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                    >
                                                        View
                                                    </button>

                                                 
                                                        <button
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Approve
                                                        </button>

                                               

                                                        <button
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            Revert to Draft
                                                        </button>
                                                  
                                                </div>
                                            </div>
                                      

                                    </div>
                                </td>
                            </tr>
                  
                    </tbody>
                </table>

{/*               
                <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-2 md:space-y-0 px-4 pb-4">
                    <div className="text-sm text-gray-600">
                        Showing to{" "}
                       of entries
                    </div>

                    <div className="space-x-2">
                        <button
                            
                            className={`px-3 py-1 border rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1 border rounded ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
                        >
                            Next
                        </button>

                    </div>
                </div> */}
            </div>


        

        </div>
    );
};


export default AdminInspectionChecklistTable;