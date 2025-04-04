import React from 'react';

const VisitorSelector = ({ visitors, onChange }) => {
  return (
    <div>
      <select
        value={visitors}
        onChange={onChange}
        className="mt-2 w-full border p-2 rounded "
      >
        <option value="">Select Visitor</option>
        <option value="Engr. Herrera">Engr. Herrera</option>
        <option value="Engr. Lopez">Engr. Lopez</option>
        <option value="Engr. Loyola">Engr. Loyola</option>
      </select>
    </div>
  );
};

export default VisitorSelector;
