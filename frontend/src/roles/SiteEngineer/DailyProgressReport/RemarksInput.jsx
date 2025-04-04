import React from 'react';

const RemarksInput = ({ remarks, onChange }) => {
  return (
    <div>
      <label className="mt-4 block font-medium">Remark</label>
      <textarea
        value={remarks}
        onChange={onChange}
        placeholder="Enter remark here"
        className="w-full border p-2 rounded"
      />
    </div>
  );
};

export default RemarksInput;
