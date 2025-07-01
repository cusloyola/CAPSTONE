import React, { useState, useRef, useEffect } from 'react';
import { FaPencilAlt, FaTrashAlt, FaEllipsisH } from 'react-icons/fa';

const RebarActionsDropdown = ({ nodeData, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded hover:bg-gray-100"
      >
        <FaEllipsisH className="text-gray-600" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 right-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center gap-2"
            onClick={() => {
              onEdit(nodeData);
              setOpen(false);
            }}
          >
            <FaPencilAlt className="text-blue-600" />
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            onClick={() => {
              onDelete(nodeData);
              setOpen(false);
            }}
          >
            <FaTrashAlt className="text-red-600" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default RebarActionsDropdown;
