import React, { useState, useEffect } from "react";
import axios from "axios";

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [newItem, setNewItem] = useState({
    item_name: "",
    description: "",
    category_id: "",
    unit: "",
    stock_quantity: "",
    reorder_level: "",
    location: "",
  });

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedItem) {
      try {
        await axios.delete(`http://localhost:5000/api/inventory/${selectedItem.id}`);
        fetchInventory();
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
      } catch (err) {
        console.error("Error deleting item:", err);
        setError("Failed to delete item. Try again later.");
      }
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Fetch inventory data
  const fetchInventory = async () => {
    setLoading(true);
    setError("");
    console.log("Fetching inventory...");

    try {
      const response = await axios.get("http://localhost:5000/api/inventory");
      console.log("Fetched Inventory:", response.data);
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError("Failed to fetch inventory. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    console.log("Input changed:", name, value); // Log input changes
  };

  // Handle form submission to add a new item
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", newItem);

    try {
      const response = await axios.post("http://localhost:5000/api/inventory", newItem);
      console.log("Item added:", response.data);
      fetchInventory(); // Re-fetch inventory after adding
      setShowModal(false); // Close modal
    } catch (error) {
      console.error("Error details:", error);
      setError("Failed to add item. Try again later.");
    }
  };

  return (
    <div>
      <h2>Inventory Management</h2>

      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      <button
        onClick={() => setShowModal(true)}
        style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
      >
        + Add Item
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "5px",
              width: "400px",
            }}
          >
            <h3>Add New Item</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Item Name</label>
                <input
                  type="text"
                  name="item_name"
                  value={newItem.item_name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  name="description"
                  value={newItem.description}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
              </div>
              <div>
                <label>Category ID</label>
                <input
                  type="number"
                  name="category_id"
                  value={newItem.category_id}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
              </div>
              <div>
                <label>Unit</label>
                <input
                  type="text"
                  name="unit"
                  value={newItem.unit}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
              </div>
              <div>
                <label>Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={newItem.stock_quantity}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
              </div>
              <div>
                <label>Reorder Level</label>
                <input
                  type="number"
                  name="reorder_level"
                  value={newItem.reorder_level}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
              </div>
              <div>
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={newItem.location}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
              </div>
              <div>
                <button type="submit" style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
                  Add Item
                </button>
              </div>
            </form>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: "5px 10px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
              <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Warehouse Location</th>
              <th style={{ padding: "10px", borderBottom: "2px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>{item.item_name}</td>
                <td style={{ padding: "10px" }}>{item.stock_quantity}</td>
                <td style={{ padding: "10px" }}>{item.reorder_level}</td>
                <td style={{ padding: "10px" }}>{item.location}</td>
                <td style={{ padding: "10px" }}>
                  <button
                  onClick={() => handleView(item)}
                  style={{
                    padding: "6px 12px",
                    marginRight: "5px",
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  style={{
                    padding: "6px 12px",
                    marginRight: "5px",
                    backgroundColor: "#f1c40f",
                    color: "black",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(item)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>📭 No inventory items found.</p>
    )}

    {isDeleteModalOpen && (
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "5px",
            width: "300px",
            textAlign: "center",
          }}
        >
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete this item?</p>
          <div>
            <button
              onClick={confirmDelete}
              style={{
                padding: "10px 15px",
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Confirm Delete
            </button>
            <button
              onClick={closeDeleteModal}
              style={{
                padding: "10px 15px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

function handleView(item) {
  console.log("view item", item);
}

function handleEdit(item) {
  console.log("edit item", item)
}
};

export default InventoryManagement;