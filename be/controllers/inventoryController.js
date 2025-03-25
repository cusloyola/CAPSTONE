const db = require("../config/db");

const getAllInventory = (req, res) => {
    db.query("SELECT * FROM inventory_items", (err, results) => {
        if (err) {
            console.error("❌ Error fetching inventory:", err);
            return res.status(500).json({ error: "Server error while fetching inventory" });
        }
        if (!results || results.length === 0) {
            console.warn("⚠️ No inventory items found.");
            return res.status(404).json({ message: "No inventory items found." });
        }
        console.log("📌 Sending Inventory Data:", results);
        return res.json(results);
    });
};

const addInventoryItem = (req, res) => {
    const { item_name, description, category_id, unit, stock_quantity, reorder_level, location } = req.body;
    if (!item_name || !description || !category_id || !unit || !stock_quantity || !reorder_level || !location) {
        return res.status(400).json({ error: "All fields are required." });
    }
    const query = "INSERT INTO inventory_items (item_name, description, category_id, unit, stock_quantity, reorder_level, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
    db.query(query, [item_name, description, category_id, unit, stock_quantity, reorder_level, location], (err, result) => {
        if (err) {
            console.error("❌ Error adding inventory item:", err);
            return res.status(500).json({ error: "Failed to add inventory item." });
        }
        console.log("📌 Item added:", result);
        return res.status(201).json({ message: "Inventory item added successfully", itemId: result.insertId });
    });
};

module.exports = { getAllInventory, addInventoryItem };