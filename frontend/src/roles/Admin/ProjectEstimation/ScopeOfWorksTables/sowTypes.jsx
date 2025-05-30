import React, { useState, useEffect } from "react";

const SowTypes = () => {

    return (
        <div className="p-4 space-y-6 bg-white shadow rounded">
            <div className="bg-[#d86686] text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">    Manage Work Types</h1>
                <div className="flex items-center space-x-2">
                    <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100">
                        Add New Item
                    </button>
                </div>

            </div>


            <div className="flex justify-between items-center">
                <div>
                    <label className="text-sm">
                        Show
                        <select
                            className="mx-2 border p-1 rounded"

                        >
                            <option value={1}>1</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        entries
                    </label>
                </div>
                <div className="flex items-center gap-2"> <label className="block font-medium text-gray-700">
                    Search:
                </label>
                    <input
                        id="searchInput"
                        type="text"
                        className="border p-2 rounded w-64"
                    />
                </div>
            </div>

            <table className="table-auto w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2 text-left">Type Name</th>
                        <th className="border px-4 py-2 text-left">Type Description</th>
                        <th className="border px-4 py-2 text-left">Sequence Order</th>
                        <th className="border px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2">
                        <div className="flex gap-x-2">
                            <button className="bg-yellow-500 text-white px-6 h-10 rounded hover:bg-yellow-700">Edit</button>
                            <button className="bg-red-600 text-white px-6 h-10 rounded hover:bg-red-700">Delete</button>
                        </div>
                    </td>
                </tbody>
            </table>


            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                <p>
                    Showing to  of entries
                </p>

                <div className="flex gap-2 mt-2 sm:mt-0">
                    <button

                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>



        </div>

    );
};

export default SowTypes;