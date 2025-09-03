import React, { useState, useEffect } from "react";

const EditRequestModal = ({ show, onClose, onSave, request }) => {
  const [editedRequest, setEditedRequest] = useState(null);

  useEffect(() => {
    if (request) {
      setEditedRequest({
        ...request,
        items: [...request.items],
      });
    }
  }, [request]);

  if (!show || !editedRequest) return null;

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setEditedRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemQuantityChange = (item_request_id, newQuantity) => {
    setEditedRequest((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.item_request_id === item_request_id
          ? { ...item, request_quantity: newQuantity }
          : item
      ),
    }));
  };

  const handleSave = () => {
    onSave(editedRequest);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">
            Edit Request {editedRequest.request_id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-6 text-sm text-gray-800">
          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-md font-bold text-gray-800">Project Name</p>
              <input
                type="text"
                value={editedRequest.project_name}
                readOnly
                className="mt-1 block w-full border rounded-md px-2 py-1 bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <p className="text-md font-bold text-gray-800">Urgency</p>
              <select
                name="urgency"
                value={editedRequest.urgency}
                onChange={handleFieldChange}
                className="mt-1 block w-full border rounded-md px-2 py-1"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-md font-bold text-gray-800 mb-1">Additional Notes</p>
            <textarea
              name="notes"
              value={editedRequest.notes}
              onChange={handleFieldChange}
              className="w-full border rounded-md px-2 py-1"
              rows={3}
            />
          </div>

          <hr className="my-4" />

          {/* Requested Items */}
          <div>
            <p className="text-md font-bold text-gray-800 mb-2">
              Requested Items
            </p>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <table className="min-w-full text-sm">
  <thead>
    <tr>
      <th className="text-left font-semibold pb-2">Material</th>
      <th className="text-left font-semibold pb-2">Brand</th>
      <th className="text-left font-semibold pb-2">Quantity</th>
      <th className="text-left font-semibold pb-2">Unit</th>
      <th className="text-left font-semibold pb-2">Unit Cost</th>
      <th className="text-left font-semibold pb-2">Total Cost</th>
    </tr>
  </thead>
  <tbody>
    {editedRequest.items.map((item) => (
      <tr key={item.item_request_id}>
        <td className="py-1">{item.material_name}</td>
        <td className="py-1">{item.brand_name}</td>
        <td className="py-1">
          <input
            type="number"
            value={item.request_quantity}
            onChange={(e) =>
              handleItemQuantityChange(
                item.item_request_id,
                parseInt(e.target.value)
              )
            }
            min="1"
            className="w-20 border rounded px-2 py-1"
          />
        </td>
        <td className="py-1">{item.unitName}</td>
        <td className="py-1">₱{item.default_unit_cost?.toLocaleString() || 0}</td>
        <td className="py-1">₱{((item.request_quantity || 0) * (item.default_unit_cost || 0)).toLocaleString()}</td>
      </tr>
    ))}
  </tbody>
  <tfoot className="font-bold">
    <tr>
      <td colSpan="2" className="text-right">Total:</td>
      <td className="text-right">
        {editedRequest.items.reduce((sum, i) => sum + (i.request_quantity || 0), 0)}
      </td>
      <td></td>
      <td></td>
      <td className="text-right">
        ₱{editedRequest.items.reduce((sum, i) => sum + ((i.request_quantity || 0) * (i.default_unit_cost || 0)), 0).toLocaleString()}
      </td>
    </tr>
  </tfoot>
</table>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRequestModal;
