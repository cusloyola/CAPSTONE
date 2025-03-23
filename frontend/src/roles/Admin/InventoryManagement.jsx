import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const InventoryManagement = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockThreshold, setStockThreshold] = useState("");

  // Redirect unauthorized users
  useEffect(() => {
    if (!user || user.role.toLowerCase() !== "admin") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  // Fetch inventory data
  useEffect(() => {
    if (user?.token) {
      fetchInventory();
    }
  }, [user?.token]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      console.log("📌 API Response:", response.data);

      if (Array.isArray(response.data)) {
        setInventory(response.data);
      } else {
        console.warn("⚠️ Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("❌ Fetch Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || stockQuantity === "" || stockThreshold === "") {
      alert("All fields are required!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5005/api/inventory",
        {
          item_name: itemName,
          stock_quantity: Number(stockQuantity),
          stock_threshold: Number(stockThreshold),
        },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      console.log("✅ Success:", response.data);
      alert("Item added successfully!");

      // Clear form and refresh inventory list
      setItemName("");
      setStockQuantity("");
      setStockThreshold("");
      fetchInventory();
    } catch (error) {
      console.error("❌ Submission Error:", error);
      alert("Error adding item. Please check your server.");
    }
  };

  return (
    <div>
      <h2>Inventory Management</h2>

      {/* Inventory Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="number"
          placeholder="Stock Quantity"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value === "" ? "" : e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="number"
          placeholder="Stock Threshold"
          value={stockThreshold}
          onChange={(e) => setStockThreshold(e.target.value === "" ? "" : e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button type="submit" style={{ padding: "5px 10px", cursor: "pointer" }}>Add Item</button>
      </form>

      {/* Inventory Table */}
      <h3>Inventory List</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Item Name</th>
            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Stock Threshold</th>
            <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Last Restocked</th>
          </tr>
        </thead>
        <tbody>
          {inventory.length > 0 ? (
            inventory.map((item) => (
              <tr key={item.inventory_id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{item.item_name}</td>
                <td style={{ padding: "10px" }}>{item.stock_threshold}</td>
                <td style={{ padding: "10px" }}>
                  {item.last_restocked ? new Date(item.last_restocked).toLocaleString() : "Never"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} style={{ textAlign: "center", padding: "10px" }}>
                No inventory items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryManagement;
