import React, { useState, useEffect, useRef } from "react";

const AddPresentModal = ({ isOpen, onClose, items, billing_id, accomplishments }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [percentValue, setPercentValue] = useState("");
    const [weekNo, setWeekNo] = useState("");
    const [note, setNote] = useState("");
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);


    const user = JSON.parse(localStorage.getItem("user"));
    const user_id = user?.id;


    useEffect(() => {
        setFilteredItems(items); // default to all
    }, [items]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        const filtered = items.filter((item) =>
            item.item_title.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredItems(filtered);
        setSelectedItem(null);
        setDropdownOpen(true);
    };

    const handleSelect = (item) => {
        setSelectedItem(item);
        setSearchTerm(item.item_title);
        setDropdownOpen(false);
    };

    const handleClickOutside = (e) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(e.target) &&
            inputRef.current &&
            !inputRef.current.contains(e.target)
        ) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputFocus = () => {
        setFilteredItems(items); // show all on focus
        setDropdownOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedItem) return alert("Please select an item.");
        if (!billing_id) return alert("Missing billing_id.");

        const percent_previous =
            accomplishments?.[selectedItem?.sow_proposal_id]?.percent_previous || 0;

        const payload = {
            billing_id: Number(billing_id),
            sow_proposal_id: selectedItem.sow_proposal_id,
            percent_present: parseFloat(percentValue),
            percent_previous,
        };

        const logPayload = {
            billing_id: Number(billing_id),
            sow_proposal_id: Number(selectedItem?.sow_proposal_id),
            percent_present: parseFloat(percentValue),
            user_id: Number(user_id),
            week_no: weekNo ? parseInt(weekNo) : null,
            note: note || null,
        };

        console.log("🧾 Log payload", logPayload);
        console.log("📤 Sending to backend:", payload);

        try {
            await fetch("http://localhost:5000/api/progress-billing/accomp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            await fetch("http://localhost:5000/api/progress-billing/accomp/log", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // ✅ also fix typo: "header" → "headers"
                },
                body: JSON.stringify(logPayload),
            });

            alert("✅ Saved successfully.");
            onClose();
            setSearchTerm("");
            setFilteredItems(items);
            setSelectedItem(null);
            setPercentValue("");
        } catch (error) {
            console.error("❌ Error submitting data:", error);
            alert("Failed to submit data.");
        }
    };


    if (!isOpen) return null;

    // Get % previous (from accomp_to_date) and compute new total
    const percentPrevious = parseFloat(selectedItem?.accomp_to_date || 0);
    const percentPresent = parseFloat(percentValue || 0);
    const percentToDate = (percentPrevious + percentPresent).toFixed(2);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">% Present Entry</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Item
                    </label>
                    <div className="relative mb-4" ref={dropdownRef}>
                        <input
                            type="text"
                            ref={inputRef}
                            className="w-full border rounded px-3 py-1.5 text-sm h-[40px]"
                            placeholder="Type or select item"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                        />
                        {isDropdownOpen && (
                            <ul className="absolute z-10 bg-white border w-full max-h-[150px] overflow-y-auto rounded shadow text-sm">
                                {filteredItems.length === 0 ? (
                                    <li className="px-3 py-2 text-gray-500">No matches</li>
                                ) : (
                                    filteredItems.map((item) => (
                                        <li
                                            key={item.sow_proposal_id}
                                            onClick={() => handleSelect(item)}
                                            className="px-3 py-2 cursor-pointer hover:bg-[#e0f7f7]"
                                        >
                                            {item.item_title}
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        % Accomplishment
                    </label>
                    <input
                        type="number"
                        placeholder="Enter %"
                        value={percentValue}
                        onChange={(e) => setPercentValue(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-4 text-sm"
                        required
                    />

                    {selectedItem && (
                        <div className="text-sm text-gray-700 mb-4">
                            <p><strong>% Previous:</strong> {percentPrevious}%</p>
                            <p><strong>% To Date:</strong> {percentToDate}%</p>
                            {percentToDate > 100 && (
                                <p className="text-red-600">⚠️ Over 100%</p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-[#2fbcbc] text-white px-4 py-2 rounded hover:bg-[#26a0a0] w-full mt-2"
                    >
                        Save
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddPresentModal;
