import React from "react";

const TableHeader = ({ title, userRole, onAdd, addLabel = "+ Add" }) => {
  return (
    <div className="mb-6 border-b-2 border-blue-500 pb-2 flex justify-between items-center">
      <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
      {userRole === "site_engineer" && onAdd && (
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          {addLabel}
        </button>
      )}
    </div>
  );
};

export default TableHeader;
