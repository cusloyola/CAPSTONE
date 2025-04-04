import React from 'react';

const ActivitiesInput = ({ activities, onChange }) => {
  return (
    <div>
      <label className="block font-medium mt-2">Activities</label>
      <textarea
        value={activities}
        onChange={onChange}
        className="w-full border p-2 rounded h-24"
        placeholder="Enter today's activities"
      ></textarea>
    </div>
  );
};

export default ActivitiesInput;
