import React, { useRef, useEffect } from 'react';
import { FaEllipsisV } from "react-icons/fa";

const RequestActionMenu = ({ request, openMenuId, setOpenMenuId, handleAction }) => {
    const menuRef = useRef(null);
    const isOpen = openMenuId === request.request_id;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, setOpenMenuId]);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button onClick={() => setOpenMenuId(isOpen ? null : request.request_id)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
                <FaEllipsisV />
            </button>
            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg">
                    <div className="py-1">
                        <button onClick={() => handleAction(request, "view")} className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100">
                            View
                        </button>
                        {request.status === "pending" && (
                            <>
                                <button onClick={() => handleAction(request, "approve")} className="block w-full px-4 py-2 text-sm text-left text-green-700 hover:bg-gray-100">
                                    Approve
                                </button>
                                <button onClick={() => handleAction(request, "reject")} className="block w-full px-4 py-2 text-sm text-left text-red-700 hover:bg-gray-100">
                                    Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestActionMenu;   