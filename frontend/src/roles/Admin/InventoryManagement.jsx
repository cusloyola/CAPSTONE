import React, { useState, useEffect } from "react";
import axios from "axios";

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  // Fetch inventory data
  const fetchInventory = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get("http://localhost:5000/api/inventory");
      console.log("Fetched Inventory:", response.data);  // <-- Debugging line
      setInventory(response.data);
    } catch (error) {
      setError("Failed to fetch inventory. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Inventory Management</h2>

      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      <h3>Inventory List</h3>
      {loading ? (
        <p>⏳ Loading inventory...</p>
      ) : inventory.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
              <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Item Name</th>
              <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Stock Quantity</th>
              <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Reorder Level</th>
              <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{item.item_name}</td>
                <td style={{ padding: "10px" }}>{item.stock_quantity}</td>
                <td style={{ padding: "10px" }}>{item.reorder_level}</td>
                <td style={{ padding: "10px" }}>
                  {item.created_at ? new Date(item.created_at).toLocaleString() : "Not available"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>📭 No inventory items found.</p>
      )}
    </div>
  );
};

export default InventoryManagement;
