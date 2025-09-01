// inventoryInformationController.js

const db = require("../config/db"); // Import your database connection module

const getInventoryInformation = (req, res) => {
  try {
    // Replace with your actual logic to fetch inventory information
    const inventoryData = {
      // totalItems: 1500,
      company: "Global Logistics Inc.",
      // totalCategories: 10,
      contactPerson: "Mr. Robert Reyes",
      // itemsOutOfStock: 50,
      email: "robert.reyes@globallogistics.com",
      // totalNumberOfStocks: 3000,
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

const getTotalItemsCount = (req, res) => {
  console.log("getTotalItemsCount called!");

  const query = "SELECT COUNT(item_id) AS totalItems FROM inventory_items WHERE isDeleted = 0";

  console.log("Executing Query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database Error counting items:", err);
      return res.status(500).json({
        error: "Database error while counting items",
        details: err.message,
      });
    }

    console.log("Query Results:", results);

    if (!results || results.length === 0) {
      console.log("No items found.");
      return res.status(404).json({ message: "No items found." });
    }

    // Extract the totalItems count from the results
    const totalItems = results[0].totalItems;

    console.log("📌 Sending Total Items Count:", totalItems);
    return res.json({ totalItems }); // Return the count as a JSON object
  });
};


const getTotalStockQuantity = (req, res) => {
  console.log("getTotalStockQuantity called!");

  const query = "SELECT SUM(stock_quantity) AS totalStock FROM inventory_items WHERE isDeleted = 0";

  console.log("Executing Query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database Error summing stock quantity:", err);
      return res.status(500).json({
        error: "Database error while summing stock quantity",
        details: err.message,
      });
    }

    console.log("Query Results:", results);

    if (!results || results.length === 0 || results[0].totalStock === null) {
      console.log("No stock quantity found or no items found.");
      return res.status(404).json({ message: "No stock quantity found or no items found." });
    }

    // Extract the total stock quantity from the results
    const totalStock = results[0].totalStock;

    console.log("📌 Sending Total Stock Quantity:", totalStock);
    return res.json({ totalStock }); // Return the sum as a JSON object
  });
};

const getOutOfStockCount = (req, res) => {
  console.log("getOutOfStockCount called!");

  const query = "SELECT COUNT(item_id) AS outOfStockCount FROM inventory_items WHERE stock_quantity = 0 AND isDeleted = 0";

  console.log("Executing Query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database Error counting out-of-stock items:", err);
      return res.status(500).json({
        error: "Database error while counting out-of-stock items",
        details: err.message,
      });
    }

    console.log("Query Results:", results);

    if (!results || results.length === 0) {
      console.log("No out-of-stock items found.");
      return res.status(404).json({ message: "No out-of-stock items found." });
    }

    // Extract the outOfStockCount from the results
    const outOfStockCount = results[0].outOfStockCount;

    console.log("📌 Sending Out-of-Stock Count:", outOfStockCount);
    return res.json({ outOfStockCount }); // Return the count as a JSON object
  });
};


const getTotalCategoriesCount = (req, res) => {
  console.log("getTotalCategoriesCount called!");

  const query = "SELECT COUNT(category_id) AS totalCategories FROM inventory_categories";

  console.log("Executing Query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database Error counting categories:", err);
      return res.status(500).json({
        error: "Database error while counting categories",
        details: err.message,
      });
    }

    console.log("Query Results:", results);

    if (!results || results.length === 0) {
      console.log("No categories found.");
      return res.status(404).json({ message: "No categories found." });
    }

    // Extract the totalCategories count from the results
    const totalCategories = results[0].totalCategories;

    console.log("📌 Sending Total Categories Count:", totalCategories);
    return res.json({ totalCategories }); // Return the count as a JSON object
  });
};

const getFastMovingItems = (req, res) => {
  console.log("getFastMovingItems called!");

  const query = `
    SELECT
      rmi.resource_id,
      ii.item_name,
      SUM(rmi.request_quantity) AS total_requested_quantity
    FROM requested_material_items rmi
    JOIN requested_materials rm ON rmi.request_id = rm.request_id
    JOIN inventory_items ii ON rmi.resource_id = ii.item_id
    WHERE rm.is_approved = 1
    GROUP BY rmi.resource_id, ii.item_name
    ORDER BY total_requested_quantity DESC
    LIMIT 5;
  `;

  console.log("Executing Query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database Error fetching top 5 fast-moving items:", err);
      return res.status(500).json({
        error: "Database error while fetching top 5 fast-moving items",
        details: err.message,
      });
    }

    console.log("Query Results:", results);

    if (!results || results.length === 0) {
      console.log("No approved material requests found, so no fast-moving items could be determined.");
      return res.status(404).json({ message: "No fast-moving items found based on approved requests." });
    }

    console.log("📌 Sending Top 5 Fast-Moving Items Data:", results);
    return res.json(results);
  });
};

const getSlowMovingItems = (req, res) => {
  console.log("getSlowMovingItems called!");

  const query = `
    SELECT
     rmi.resource_id,
      ii.item_name,
      SUM(rmi.request_quantity) AS total_requested_quantity
    FROM requested_material_items rmi
    JOIN requested_materials rm ON rmi.request_id = rm.request_id
    JOIN inventory_items ii ON rmi.resource_id = ii.item_id
    WHERE rm.is_approved = 1
    GROUP BY rmi.resource_id, ii.item_name
    ORDER BY total_requested_quantity ASC
    LIMIT 5;
  `;

  console.log("Executing Query:", query);

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database Error fetching slow-moving items:", err);
      return res.status(500).json({
        error: "Database error while fetching slow-moving items",
        details: err.message,
      });
    }

    console.log("Query Results:", results);

    if (!results || results.length === 0) {
      console.log("No approved material requests found, so no slow-moving items could be determined.");
      return res.status(404).json({ message: "No slow-moving items found based on approved requests." });
    }

    console.log("📌 Sending Slow-Moving Items Data:", results);
    return res.json(results);
  });
};

module.exports = { getInventoryInformation, getLowestStockItems, getTotalItemsCount, getTotalStockQuantity, getOutOfStockCount, getTotalCategoriesCount, getFastMovingItems, getSlowMovingItems  };