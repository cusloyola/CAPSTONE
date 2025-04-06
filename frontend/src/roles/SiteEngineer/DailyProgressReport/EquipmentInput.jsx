import React, { useState, useEffect } from 'react';

const EquipmentInput = ({ selectedEquipment, onEquipmentChange, equipmentCounts, onEquipmentCountsChange }) => {
    const [equipmentList, setEquipmentList] = useState([]); // List of available equipment
    const [localSelectedEquipment, setLocalSelectedEquipment] = useState(selectedEquipment); // Local state for selected equipment
    const [localEquipmentCounts, setLocalEquipmentCounts] = useState(equipmentCounts); // Local state for counts
    const [newEquipment, setNewEquipment] = useState(""); // For custom input of new equipment
    const [selectedEquipmentOption, setSelectedEquipmentOption] = useState(""); // Tracks dropdown selection

    // Fetch equipment from the backend
    const fetchEquipment = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/daily-site-report/equipment');
            const data = await response.json();
            setEquipmentList(data.equipment || []);
        } catch (err) {
            console.error('❌ Error fetching equipment:', err);
        }
    };

    useEffect(() => {
        fetchEquipment();  // Call the fetchEquipment function when the component mounts
    }, []);

    // Update local state when props change (important for controlled component behavior)
    useEffect(() => {
        setLocalSelectedEquipment(selectedEquipment);
        setLocalEquipmentCounts(equipmentCounts);
    }, [selectedEquipment, equipmentCounts]);

    // Notify parent component of changes to selected equipment
    useEffect(() => {
        onEquipmentChange(localSelectedEquipment);
    }, [localSelectedEquipment, onEquipmentChange]);

    // Notify parent component of changes to equipment counts
    useEffect(() => {
        onEquipmentCountsChange(localEquipmentCounts);
    }, [localEquipmentCounts, onEquipmentCountsChange]);

    const toggleEquipment = (equipment) => {
        console.log("Toggling equipment:", equipment);  // Log the equipment being toggled
        const isCurrentlySelected = localSelectedEquipment.includes(equipment);
        let updatedSelectedEquipment;

        if (isCurrentlySelected) {
            console.log("Removing equipment:", equipment);
            updatedSelectedEquipment = localSelectedEquipment.filter(item => item !== equipment);
            const { [equipment]: _, ...restCounts } = localEquipmentCounts;
            setLocalEquipmentCounts(restCounts);
        } else {
            console.log("Adding equipment:", equipment);
            updatedSelectedEquipment = [...localSelectedEquipment, equipment];
            setLocalEquipmentCounts({ ...localEquipmentCounts, [equipment]: 0 });
        }
        setLocalSelectedEquipment(updatedSelectedEquipment);
    };

    const increment = (equipment) => {
        console.log("Incrementing count for:", equipment);  // Log increment action
        setLocalEquipmentCounts(prev => ({
            ...prev,
            [equipment]: (prev[equipment] || 0) + 1
        }));
    };

    const decrement = (equipment) => {
        console.log("Decrementing count for:", equipment);  // Log decrement action
        setLocalEquipmentCounts(prev => ({
            ...prev,
            [equipment]: Math.max((prev[equipment] || 0) - 1, 0)
        }));
    };

    const handleDropdownChange = (e) => {
        setSelectedEquipmentOption(e.target.value);
        if (e.target.value && !localSelectedEquipment.includes(e.target.value)) {
            setLocalSelectedEquipment(prev => [...prev, e.target.value]);
            setLocalEquipmentCounts(prev => ({ ...prev, [e.target.value]: 0 }));
        }
    };

    const handleAddEquipment = () => {
        console.log("Adding new equipment:", newEquipment);  // Log new equipment being added
        if (!newEquipment || localSelectedEquipment.includes(newEquipment)) return;

        setLocalSelectedEquipment((prev) => [...prev, newEquipment]);
        setLocalEquipmentCounts((prev) => ({
            ...prev,
            [newEquipment]: 0
        }));
        setNewEquipment(""); // Reset input field
    };

    // Log the selected equipment and counts at each render
    useEffect(() => {
        console.log("Selected Equipment in EquipmentInput:", localSelectedEquipment);
        console.log("Equipment Counts in EquipmentInput:", localEquipmentCounts);
    }, [localSelectedEquipment, localEquipmentCounts]);

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">Assign Equipment</h2>

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
                        type="button" // Prevents form submission
                        onClick={handleAddEquipment}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>

                {/* Display added equipment with increment and decrement */}
                {localSelectedEquipment.length > 0 && localSelectedEquipment.map((equipment) => (
                    <div key={equipment} className="flex items-center mb-3">
                        <span className="text-lg w-1/2">{equipment}</span>
                        <div className="flex items-center gap-2 w-1/2">
                            {/* Decrement Button */}
                            <button
                                type="button"  // Prevents form submission
                                onClick={() => decrement(equipment)}
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                -
                            </button>

                            <span>{localEquipmentCounts[equipment] || 0}</span>

                            {/* Increment Button */}
                            <button
                                type="button"  // Prevents form submission
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