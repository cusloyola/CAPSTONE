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
        res.json(results);
    });
};

module.exports = { getAllInventory };
