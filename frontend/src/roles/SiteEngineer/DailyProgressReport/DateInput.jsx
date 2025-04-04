import React from 'react';

const DateInput = ({ date, onChange }) => {
  return (
    <div>
      <label className="block font-medium mt-2">Date</label>
      <input
        type="date"
        value={date}
        onChange={onChange}
        className="w-full border p-2 rounded"
      />
    </div>
  );
};

export default DateInput;
