// inventoryInformationController.js

const db = require("../config/db"); // Import your database connection module

const getInventoryInformation = (req, res) => {
  try {
    // Replace with your actual logic to fetch inventory information
    const inventoryData = {
      totalItems: 1500,
      company: "Global Logistics Inc.",
      totalCategories: 10,
      contactPerson: "Mr. Robert Reyes",
      itemsOutOfStock: 50,
      email: "robert.reyes@globallogistics.com",
      totalNumberOfStocks: 3000,
      warehouseLocation: "Valenzuela City, Philippines",
    };

    console.log("Inventory information fetched successfully.");
    return res.json(inventoryData);
  } catch (error) {
    console.error("Error fetching inventory information:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const getLowestStockItems = (req, res) => {
  console.log("getLowestStockItems called!");

  const query = "SELECT item_id, item_name, stock_quantity FROM inventory_items WHERE isDeleted = 0 ORDER BY stock_quantity ASC";

  console.log("Executing Query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database Error fetching lowest stock items:", err);
      return res.status(500).json({
        error: "Database error while fetching lowest stock items",
        details: err.message,
      });
    }

    console.log("Query Results:", results);

    if (!results || results.length === 0) {
      console.log("No inventory items found.");
      return res.status(404).json({ message: "No inventory items found." });
    }

    // Find the minimum stock quantity
    const minStock = results[0].stock_quantity;

    // Filter items with the minimum stock quantity
    const lowestStockItems = results.filter((item) => item.stock_quantity === minStock);

    console.log("📌 Sending Lowest Stock Items Data:", lowestStockItems);
    return res.json(lowestStockItems);
  });
};
module.exports = { getInventoryInformation, getLowestStockItems };