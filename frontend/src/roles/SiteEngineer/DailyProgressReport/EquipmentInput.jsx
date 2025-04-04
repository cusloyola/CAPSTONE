import React, { useState, useEffect } from 'react';

const EquipmentInput = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [equipmentCounts, setEquipmentCounts] = useState({});
  const [newEquipment, setNewEquipment] = useState("");
  const [selectedEquipmentOption, setSelectedEquipmentOption] = useState("");

  // Fetch equipment from the backend
  const fetchEquipment = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/daily-site-report/equipment'); // Adjust the URL accordingly
      const data = await response.json();
      setEquipmentList(data.equipment || []); // Set the fetched equipment data
    } catch (err) {
      console.error('❌ Error fetching equipment:', err);
    }
  };

  useEffect(() => {
    fetchEquipment();  // Call the fetchEquipment function when the component mounts
  }, []);

  const toggleEquipment = (equipment) => {
    if (selectedEquipment.includes(equipment)) {
      setSelectedEquipment(selectedEquipment.filter(item => item !== equipment));
      setEquipmentCounts(prev => {
        const { [equipment]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setSelectedEquipment(prev => [...prev, equipment]);
      setEquipmentCounts(prev => ({
        ...prev,
        [equipment]: 0 // Initialize count for newly selected equipment
      }));
    }
  };

  const increment = (equipment) => {
    setEquipmentCounts(prev => ({
      ...prev,
      [equipment]: (prev[equipment] || 0) + 1
    }));
  };

  const decrement = (equipment) => {
    setEquipmentCounts(prev => ({
      ...prev,
      [equipment]: Math.max((prev[equipment] || 0) - 1, 0)
    }));
  };

  const handleDropdownChange = (e) => {
    setSelectedEquipmentOption(e.target.value);
    if (!selectedEquipment.includes(e.target.value) && e.target.value !== "") {
      setSelectedEquipment(prev => [...prev, e.target.value]);
      setEquipmentCounts(prev => ({
        ...prev,
        [e.target.value]: 0 // Initialize count for newly selected equipment
      }));
    }
  };

  const handleAddEquipment = () => {
    if (!newEquipment || selectedEquipment.includes(newEquipment)) return;

    setSelectedEquipment(prev => [...prev, newEquipment]);
    setEquipmentCounts(prev => ({
      ...prev,
      [newEquipment]: 0
    }));
    setNewEquipment(""); // Reset input field
  };

  return (
    <div>
    <h2 className="text-lg font-semibold mb-4">Assign Manpower</h2>
  
    <div className="flex flex-col">
      {/* Equipment input section */}
      <div className="flex gap-4 items-center mb-4">
        <select
          value={selectedEquipmentOption}
          onChange={handleDropdownChange}
          className="border p-2 rounded w-1/3"
        >
          <option value="">Select equipment</option>
          {equipmentList.map((equipment, index) => (
            <option key={index} value={equipment}>
              {equipment}
            </option>
          ))}
        </select>
  
        <input
          type="text"
          value={newEquipment}
          onChange={(e) => setNewEquipment(e.target.value)}
          placeholder="Enter other equipment"
          className="border p-2 rounded-md w-1/3"
        />
  
        <button
          onClick={handleAddEquipment}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
  
      {/* Display added equipment with increment and decrement */}
      {selectedEquipment.map((equipment) => (
        <div key={equipment} className="flex items-center mb-3">
          <span className="text-lg w-1/2">{equipment}</span> {/* Allow this to grow and align */}
          <div className="flex items-center gap-2 w-1/2"> {/* Ensure buttons are aligned on the right */}
            <button
              onClick={() => decrement(equipment)}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              -
            </button>
            <span>{equipmentCounts[equipment]}</span>
            <button
              onClick={() => increment(equipment)}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
  

  );
};

export default EquipmentInput;
