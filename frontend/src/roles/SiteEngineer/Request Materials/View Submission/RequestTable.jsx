import React from "react";
import { FaEllipsisV } from "react-icons/fa";

const RequestTable = ({
    columns,
    currentRequests,
    selectedRequests,
    selectAll,
    handleSelectAll,
    handleCheckboxChange,
    handleViewDetails, // Add the specific view handler
    handleEditRequest, // Add the specific edit handler
    openMenuId,
    setOpenMenuId,
    menuRefs
}) => {
    return (
        <div className="w-full">
            <div>
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentRequests.length > 0 ? (
                            currentRequests.map((request) => (
                                <tr key={request.request_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRequests.includes(request.request_id)}
                                            onChange={() => handleCheckboxChange(request.request_id)}
                                        />
                                    </td>
                                    {columns.map((col, i) => (
                                        <td
                                            key={i}
                                            className="px-6 py-4 text-sm text-gray-700 whitespace-pre-wrap"
                                        >
                                            {col.customRender
                                                ? col.customRender(request)
                                                : col.format
                                                    ? col.format(request[col.key])
                                                    : request[col.key]}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-sm relative">
                                        <div
                                            className="relative inline-block text-left"
                                            ref={(el) => (menuRefs.current[request.request_id] = el)}
                                        >
                                            <button
                                                onClick={() =>
                                                    setOpenMenuId(
                                                        openMenuId === request.request_id
                                                            ? null
                                                            : request.request_id
                                                    )
                                                }
                                                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                                            >
                                                <FaEllipsisV />
                                            </button>
                                            {openMenuId === request.request_id && (
                                                <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => {
                                                                handleViewDetails(request);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        >
                                                            View
                                                        </button>
                                                        {["pending"].includes(
                                                            request.status?.toLowerCase()
                                                        ) && (
                                                            <button
                                                                onClick={() => {
                                                                    handleEditRequest(request);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + 2}
                                    className="text-center py-8 text-gray-500"
                                >
                                    No requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RequestTable;