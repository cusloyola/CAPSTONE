import React from 'react';

const SelectedMaterialsList = ({ selectedMaterials, handleQuantityChange }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Selected Materials</h3>
      {selectedMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedMaterials.map((material) => (
            <div key={material.resource_id} className="border p-4 rounded-lg shadow">
              <h4 className="font-semibold">{material.item_name}</h4>
              <p className="text-gray-600">Available: {material.stock_quantity}</p>
              <label className="block mt-2 font-medium">Request Quantity:</label>
              <input
                type="number"
                min="1"
                max={material.stock_quantity}
                value={material.request_quantity}
                onChange={(e) => handleQuantityChange(material.resource_id, parseInt(e.target.value, 10) || '')}
                className={`w-full p-2 border rounded mt-1 ${material.error ? 'border-red-500' : ''}`}
              />
              {material.error && (
                <p className="text-red-500 text-sm mt-1">{material.error}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No materials selected.</p>
      )}
    </div>
  );
};

export default SelectedMaterialsList;