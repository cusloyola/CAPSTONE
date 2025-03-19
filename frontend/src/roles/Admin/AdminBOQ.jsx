import { useState } from "react";

export default function AdminBOQ() {
  const [boqItems, setBoqItems] = useState([
    { id: 1, description: "Concrete", quantity: 10, unit: "m3", price: 100 },
    { id: 2, description: "Steel Rebars", quantity: 20, unit: "kg", price: 50 },
  ]);

  const addItem = () => {
    setBoqItems([...boqItems, { id: Date.now(), description: "", quantity: 0, unit: "", price: 0 }]);
  };

  const handleChange = (id, field, value) => {
    setBoqItems(
      boqItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Admin BOQ (Bill of Quantities)</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Description</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {boqItems.map((item) => (
            <tr key={item.id} className="border">
              <td className="border p-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleChange(item.id, "description", e.target.value)}
                  className="w-full p-1 border"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleChange(item.id, "quantity", e.target.value)}
                  className="w-full p-1 border"
                />
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => handleChange(item.id, "unit", e.target.value)}
                  className="w-full p-1 border"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleChange(item.id, "price", e.target.value)}
                  className="w-full p-1 border"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addItem} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Add Item
      </button>
    </div>
  );
}
