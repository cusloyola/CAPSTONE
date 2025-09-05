import { useRef, useState, useEffect } from "react";
import { FaEllipsisV, FaPencilAlt, FaTrashAlt, FaCopy } from "react-icons/fa";


const ActionDropdownUserManagement = ({ onEdit, onDelete, onCopy }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="text-gray-600 hover:text-black p-2"
            >
                <FaEllipsisV />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-50">
                    <button
                        onClick={() => {
                            onEdit();
                            setOpen(false);
                        }}
                        className="w-full px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                        <FaPencilAlt className="text-blue-500" /> Edit
                    </button>
                   
                    <button
                        onClick={() => {
                            onDelete();
                            setOpen(false);
                        }}
                        className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                    >
                        <FaTrashAlt /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActionDropdownUserManagement;
