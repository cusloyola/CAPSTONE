import React, { useState, useEffect, useRef } from "react";

// API endpoints
const RESOURCE_API_URL = "http://localhost:5000/api/resource";
const BRANDS_API_URL = "http://localhost:5000/api/resource/brands";
const UNITS_API_URL = "http://localhost:5000/api/resource/units";

const AddResourceModal = ({ onClose, onResourceAdded }) => {
    const [materialName, setMaterialName] = useState("");
    const [unitId, setUnitId] = useState("");
    const [defaultUnitCost, setDefaultUnitCost] = useState("");
    const [brandId, setBrandId] = useState("");
    const [stocks, setStocks] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [brands, setBrands] = useState([]);
    const [units, setUnits] = useState([]);

    const modalRef = useRef(null);

    useEffect(() => {
        // Fetch brands and units for dropdowns
        const fetchDropdowns = async () => {
            try {
                const [brandsRes, unitsRes] = await Promise.all([
                    fetch(BRANDS_API_URL),
                    fetch(UNITS_API_URL)
                ]);
                const brandsData = await brandsRes.json();
                const unitsData = await unitsRes.json();
                setBrands(brandsData);
                setUnits(unitsData);
            } catch (err) {
                setError("Failed to load brands or units.");
            }
        };
        fetchDropdowns();
    }, []);

    const handleAddResource = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!materialName || !unitId || !defaultUnitCost || !brandId || stocks === "") {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(RESOURCE_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    material_name: materialName,
                    unitId,
                    default_unit_cost: defaultUnitCost,
                    brand_id: brandId,
                    stocks: parseInt(stocks),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to add resource");
            }

            // On success, call the parent's callback with the resource name
            if (onResourceAdded) {
                onResourceAdded(materialName);
            }

            // Close the current modal
            onClose();

        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[99999]">
            <div
                className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"
                onClick={onClose}
            ></div>

            <div
                ref={modalRef}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-xl z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 z-20 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
                    aria-label="Close modal"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>

                <h2 className="text-xl font-semibold mb-4">Add Resource</h2>

                {error && <div className="text-red-600 mb-2">{error}</div>}

                <form onSubmit={handleAddResource} className="space-y-4">
                    <div>
                        <label className="block font-medium">Material Name</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={materialName}
                            onChange={(e) => setMaterialName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Brand Name</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={brandId}
                            onChange={(e) => setBrandId(e.target.value)}
                            required
                        >
                            <option value="">Select Brand</option>
                            {brands.map((brand) => (
                                <option key={brand.brand_id} value={brand.brand_id}>
                                    {brand.brand_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium">Unit Name</label>
                        <select
                            className="w-full border p-2 rounded"
                            value={unitId}
                            onChange={(e) => setUnitId(e.target.value)}
                            required
                        >
                            <option value="">Select Unit</option>
                            {units.map((unit) => (
                                <option key={unit.unitId} value={unit.unitId}>
                                    {unit.unitCode}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium">Unit Cost</label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                            value={defaultUnitCost}
                            onChange={(e) => setDefaultUnitCost(e.target.value)}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Stocks</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-full border p-2 rounded"
                            value={stocks}
                            onChange={(e) => {
                                const val = e.target.value;
                                // Only allow digits, no + or -
                                if (/^\d*$/.test(val)) setStocks(val);
                            }}
                            min="0"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Resource"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddResourceModal;
