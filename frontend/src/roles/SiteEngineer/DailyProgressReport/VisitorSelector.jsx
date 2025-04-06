import React from 'react';

const VisitorSelector = ({ visitors, onChange }) => {
  return (
    <div>
      <input
        type="text"
        value={visitors}
        onChange={onChange}
        placeholder="Enter Visitor Name"
        className="mt-2 w-full border p-2 rounded"
      />
    </div>
  );
};

export default VisitorSelector;
