import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';



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
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewedItem, setViewedItem] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredInventory, setFilteredInventory] = useState([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editItem, setEditItem] = useState({
        item_name: "",
        description: "",
        category_id: "",
        unit: "",
        stock_quantity: "",
        reorder_level: "",
        location: "",
    });

    
    const handleViewItemInfo = async (item) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/inventory/${item.item_id}`
            );
            setViewedItem(response.data);
            setShowViewModal(true);
        } catch (error) {
            console.error("Error fetching item details:", error);
            setError("Failed to fetch item details.");
        }
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewedItem(null);
    };

    const deleteItem = async (itemId) => {
        try {
            await axios.delete(`http://localhost:5000/api/inventory/${itemId}`);
            console.log("Item deleted successfully.");
            await fetchInventory();
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    const handleDeleteClick = (item) => {
        console.log("handleDeleteClick: item:", item);
        console.log("handleDeleteClick: inventory:", inventory);
        if (inventory.some((inventoryItem) => inventoryItem.item_id === item.item_id)) {
            console.log("handleDeleteClick: Item found in inventory.");
            setSelectedItem(item);
            setIsDeleteModalOpen(true);
        } else {
            console.log("handleDeleteClick: Item NOT found in inventory.");
            setError("Item not found. Please refresh the inventory list.");
        }
    };

    const confirmDelete = async () => {
        console.log("confirmDelete: selectedItem:", selectedItem);
        if (selectedItem && selectedItem.item_id) {
            console.log("confirmDelete: Deleting item with ID:", selectedItem.item_id);
            try {
                await deleteItem(selectedItem.item_id);
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
            } catch (err) {
                console.error("Error deleting item:", err);
                setError("Failed to delete item. Try again later.");
            }
        } else {
            console.log("confirmDelete: Invalid item or item ID for deletion.");
            setError("Invalid item for deletion.");
            setIsDeleteModalOpen(false);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    useEffect(() => {
        setFilteredInventory(
            inventory.filter((item) =>
                item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [inventory, searchTerm]);

    const fetchInventory = async () => {
        setLoading(true);
        setError("");
        console.log("Fetching inventory...");

        try {
            const response = await axios.get("http://localhost:5000/api/inventory");
            console.log("Fetched Inventory:", response.data);
            setInventory(response.data);
            console.log("Inventory state after setInventory:", response.data);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setError("Failed to fetch inventory. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewItem((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        console.log("Input changed:", name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting form with data:", newItem);

        try {
            const response = await axios.post("http://localhost:5000/api/inventory", newItem);
            console.log("Item added:", response.data);
            fetchInventory();
            setShowModal(false);
            setNewItem({
                item_name: "",
                description: "",
                category_id: "",
                unit: "",
                stock_quantity: "",
                reorder_level: "",
                location: "",
            });
            setSuccessMessage("Item added successfully!");
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error details:", error);
            setError("Failed to add item. Try again later.");
        }
    };

    const handleEdit = async (item) => {
        try {
            console.log("handleEdit: Fetching item details for edit:", item.item_id);
            const response = await axios.get(
                `http://localhost:5000/api/inventory/${item.item_id}`
            );
            console.log("handleEdit: Item details fetched:", response.data);
            setEditItem(response.data);
            setIsEditModalOpen(true);
        } catch (error) {
            console.error("handleEdit: Error fetching item details for edit:", error);
            setError("Failed to fetch item details for edit.");
        }
    };
    
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        console.log("handleEditChange: Input changed -", name, value);
        setEditItem((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };
    
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        console.log("handleEditSubmit: Attempting to update item:", editItem.item_id, editItem);
        try {
            const response = await axios.put(`http://localhost:5000/api/inventory/${editItem.item_id}`, editItem);
            console.log("handleEditSubmit: Item updated successfully:", response.data);
            fetchInventory();
            setIsEditModalOpen(false);
            setSuccessMessage("Item updated successfully!");
            setShowSuccessModal(true);
        } catch (error) {
            console.error("handleEditSubmit: Error updating item:", error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("handleEditSubmit: Response data:", error.response.data);
                console.error("handleEditSubmit: Response status:", error.response.status);
                console.error("handleEditSubmit: Response headers:", error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.error("handleEditSubmit: Request made, no response received:", error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("handleEditSubmit: Error setting up request:", error.message);
            }
    
            setError("Failed to update item.");
        }
    };


    
    return (
        <div>
         <h1>
  <span style={{ marginLeft:"25px", fontSize: '1.75em' }}><strong>Inventory Management</strong></span>
</h1>

            <div className="low-stock-wrapper" style={{ marginBottom: '10px', maxHeight: '300px' }}>
  {/* <LowStockInventory /> */}
</div>

            {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

            <button
                onClick={() => setShowModal(true)}
                style={{ padding: "10px", marginLeft: "20px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
            >
                + Add Item
            </button>

            <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px", margin: "10px 0", marginLeft: "10px", width: "750px", borderRadius: "10px" }}
            />

          
            
            <select
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    padding: "8px",
    margin: "10px 0",
    marginLeft: "10px",
    width: "590px", // Adjust width as needed
    borderRadius: "10px",
  }}
>
  <option value="">All Categories</option>
  <option value="Aluminum ">Steel & Metal Materials</option>
  <option value="Clothing">Concrete</option>

  {/* Add more categories as needed */}
</select>

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
                            Close</button>
                    </div>
                </div>
            )}
{/* <strong> Inventory List</strong> */}
<h3 style={{ marginTop: '10px' ,marginLeft: '30px', fontSize: '1.5em' }}>   </h3>            {loading ? (
                <p>⏳ Loading inventory...</p>
            ) : filteredInventory.length > 0 ? (
            //     <div
            //     className="bg-white rounded-2xl shadow-md p-6 "
            //     style={{ width: '1450px', height: '600px', marginLeft: '25px', marginTop:"20px" }} // Adjust pixel values as needed
            //   >
            <table style={{ marginTop: "20px", width: "100%", height: "600px", borderCollapse: "collapse", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", display: "block", overflowY: "auto" }}>
            <thead>
              <tr style={{ backgroundColor: "#e0e0e0", textAlign: "left" }}>
                <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "auto" }}>Item Name</th>
                <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "auto" }}>Stock Quantity</th>
                <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "auto" }}>Reorder Level</th>
                <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "auto" }}>Warehouse Location</th>
                <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
              <tr key={item.item_id} style={{ borderBottom: "1px solid #eee", backgroundColor: "white" }}>
  <td style={{ padding: "12px 15px", color: "black", width: "25%", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.item_name}</td>
  <td style={{ padding: "12px 15px", color: "black", width: "15%", textAlign: 'nowrap' }}>{item.stock_quantity}</td>
  <td style={{ padding: "12px 15px", color: "black", width: "15%", textAlign: 'nowrap' }}>{item.reorder_level}</td>
  <td style={{ padding: "12px 15px", color: "black", width: "27.5%", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.location}</td>
  <td style={{ padding: "12px 15px", width: "17.5%" }}>
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
    <button
  onClick={() => handleViewItemInfo(item)}
  style={{
    width: "75px",
    padding: "8px 12px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    flex: '1',
    marginRight: '5px',
    display: 'flex', // Add flex display
    alignItems: 'center', // Vertically align icon and text
    justifyContent: 'center', // Center icon and text
  }}
>
  <FaEye className="mr-2" /> View
</button>
<button
  onClick={() => handleEdit(item)}
  style={{
    width: "75px",
    padding: "8px 12px",
    backgroundColor: "#f1c40f",
    color: "black",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    flex: '1',
    marginRight: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <FaPencilAlt className="mr-2" /> Edit
</button>
<button
  onClick={() => handleDeleteClick(item)}
  style={{
    width: "90px", // Increased width
    padding: "8px 12px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    flex: '1',
    marginRight: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <FaTrashAlt className="mr-2" /> Delete
</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            //   </div>
            ) : (
                <p style={{
                    textAlign: 'center',
                    fontSize: '1.2em',
                    fontWeight: 'bold',
                    color: 'red',
                    padding: '20px',
                    margin: '20px auto',
                    width: '80%',
                    maxWidth: '600px',
                }}>
                    📭 No matching inventory items found!
                </p>
            )}

            {showViewModal && viewedItem && (
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
                            borderRadius: "8px",
                            width: "400px",
                            textAlign: "left",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <h3 style={{ marginBottom: "15px", textAlign: "center" }}>Item Details</h3>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Item Name:</strong> {viewedItem.item_name}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Description:</strong> {viewedItem.description}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Category ID:</strong> {viewedItem.category_id}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Unit:</strong> {viewedItem.unit}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Stock Quantity:</strong> {viewedItem.stock_quantity}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Reorder Level:</strong> {viewedItem.reorder_level}
                        </p>
                        <p style={{ marginBottom: "15px" }}>
                            <strong>Location:</strong> {viewedItem.location}
                        </p>
                        <div style={{ textAlign: "center" }}>
                            <button
                                onClick={closeViewModal}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                }}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
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

                {showSuccessModal && (
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
                            <h3>Success!</h3>
                            <p>{successMessage}</p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                style={{ padding: "10px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {isEditModalOpen && (
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
                            <h3>Edit Item</h3>
                            <form onSubmit={handleEditSubmit}>
                                <div>
                                    <label>Item Name</label>
                                    <input
                                        type="text"
                                        name="item_name"
                                        value={editItem.item_name}
                                        onChange={handleEditChange}
                                        required
                                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                    />
                                </div>
                                <div>
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={editItem.description}
                                        onChange={handleEditChange}
                                        required
                                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                    />
                                </div>
                                <div>
                                    <label>Category ID</label>
                                    <input
                                        type="number"
                                        name="category_id"
                                        value={editItem.category_id}
                                        onChange={handleEditChange}
                                        required
                                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                    />
                                </div>
                                <div>
                                    <label>Unit</label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={editItem.unit}
                                        onChange={handleEditChange}
                                        required
                                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                    />
                                </div>
                                <div>
                                    <label>Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={editItem.stock_quantity}
                                        onChange={handleEditChange}
                                        required
                                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                    />
                                </div>
                                <div>
                                    <label>Reorder Level</label>
                                    <input
                                        type="number"
                                        name="reorder_level"
                                        value={editItem.reorder_level}
                                        onChange={handleEditChange}
                                        required
                                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                    />
                                </div>
                                <div>
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={editItem.location}
                                        onChange={handleEditChange}
                                        required
                                        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                    />
                                </div>
                                <div>
                                    <button type="submit" style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                style={{
                                    padding: "5px 10px",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    marginTop: "10px",
                                }}
                            >
                                Close</button>
                        </div>
                    </div>
                )}

            </div>
        );
    }
    export default InventoryManagement;