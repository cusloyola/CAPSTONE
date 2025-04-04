import React, { useState, useEffect } from 'react';

const ManpowerInput = () => {
  const [roles, setRoles] = useState([]);
  const [assignedRoles, setAssignedRoles] = useState([]);
  const [roleCounts, setRoleCounts] = useState({});
  const [selectedRole, setSelectedRole] = useState('');

  // Fetch roles from backend
  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/daily-site-report/roles');
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (err) {
      console.error('❌ Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const increment = (role) => {
    setRoleCounts(prev => ({
      ...prev,
      [role]: (prev[role] || 0) + 1
    }));
  };

  const decrement = (role) => {
    setRoleCounts(prev => ({
      ...prev,
      [role]: Math.max((prev[role] || 0) - 1, 0)
    }));
  };

  const handleAddRole = () => {
    if (!selectedRole || assignedRoles.includes(selectedRole)) return;

    if (assignedRoles.length >= 10) {
      alert('You can only add up to 5 roles.');
      return;
    }

    setAssignedRoles(prev => [...prev, selectedRole]);
    setRoleCounts(prev => ({
      ...prev,
      [selectedRole]: 0
    }));
    setSelectedRole('');
  };

  // Filter roles not yet added
  const availableToAdd = roles.filter(role => !assignedRoles.includes(role));

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Assign Manpower</h2>
  {/* Role dropdown */}
  <div className="flex gap-2 items-center mb-8">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select a role</option>
          {availableToAdd.map((role, index) => (
            <option key={index} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleAddRole}
        >
          Add
        </button>
      </div>

      {/* Display added roles */}
      <div className="space-y-4 mb-6">
        {assignedRoles.map((role, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="w-32 font-medium">{role}</span>
            <button
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => decrement(role)}
            >-</button>
            <span>{roleCounts[role]}</span>
            <button
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => increment(role)}
            >+</button>
          </div>
        ))}
      </div>

    
    </div>
  );
};

export default ManpowerInput;
