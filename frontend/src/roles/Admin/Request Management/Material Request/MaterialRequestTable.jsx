import React from 'react';
import RequestActionMenu from './RequestActionMenu';

const MaterialRequestTable = ({
    currentRequests,
    columns,
    selectedRequests,
    handleSelectAll,
    handleCheckboxChange,
    handleAction,
    openMenuId,
    setOpenMenuId
}) => {
    return (
        <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                            <input
                                type="checkbox"
                                checked={selectedRequests.length === currentRequests.length && currentRequests.length > 0}
                                onChange={handleSelectAll}
                            />
                        </th>
                        {columns.map((col, i) => (
                            <th key={i} className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                                {col.label}
                            </th>
                        ))}
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Actions</th>
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
                                    <td key={i} className="px-6 py-4 text-sm text-gray-700 whitespace-pre-wrap">
                                        {col.customRender ? col.customRender(request) : col.format ? col.format(request[col.key]) : request[col.key]}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-sm relative">
                                    <RequestActionMenu
                                        request={request}
                                        openMenuId={openMenuId}
                                        setOpenMenuId={setOpenMenuId}
                                        handleAction={handleAction}
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + 2} className="text-center py-8 text-gray-500">
                                No requests found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MaterialRequestTable;