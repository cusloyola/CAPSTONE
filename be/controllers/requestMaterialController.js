// requestMaterialController.js

const db = require("../config/db"); // Adjust the path as needed
const moment = require('moment');
const generateStructuredId = require("../generated/GenerateCodes/generatecode"); // adjust path

// Helper to promisify queries
function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

const getRequestMaterialItems = (req, res) => {
  db.query(
    "SELECT item_id, item_name, stock_quantity FROM inventory_items WHERE isDeleted = 0",
    (err, results) => {
      if (err) {
        console.error("❌ Error fetching request material items:", err);
        return res
          .status(500)
          .json({ error: "Server error while fetching request material items" });
      }
      if (!results || results.length === 0) {
        console.warn("⚠️ No request material items found.");
        return res
          .status(404)
          .json({ message: "No request material items found." });
      }
      console.log("📌 Sending Request Material Items Data:", results);
      return res.json(results);
    }
  );
};


const createRequestedMaterials = async (req, res) => {
  const { selectedProject, urgency, notes, selectedMaterials } = req.body;

  if (!selectedProject || !urgency || !selectedMaterials || selectedMaterials.length === 0) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Start transaction
    await queryAsync("START TRANSACTION");

    // Generate a single unique request_id for requested_materials
    const request_id = await generateStructuredId(
      "111",
      "requested_materials",
      "request_id"
    );

    // Insert into requested_materials table
    await queryAsync(
      "INSERT INTO requested_materials (request_id, project_id, urgency, notes) VALUES (?, ?, ?, ?)",
      [request_id, selectedProject, urgency, notes]
    );

    // Get a unique starting ID for the items
    const startId = await generateStructuredId(
      "110",
      "requested_material_items",
      "item_request_id"
    );
    let serialCounter = parseInt(startId.slice(-3));

    // Insert requested_material_items
    const values = [];
    for (const item of selectedMaterials) {
      // Create a new unique ID by incrementing the counter
      const year = new Date().getFullYear().toString().slice(-2);
      const item_request_id = `110${year}${String(serialCounter).padStart(3, "0")}`;
      serialCounter++;

      values.push([item_request_id, request_id, item.resource_id, item.request_quantity]);
    }

    if (values.length > 0) {
      await queryAsync(
        "INSERT INTO requested_material_items (item_request_id, request_id, resource_id, request_quantity) VALUES ?",
        [values]
      );
    }

    // Commit transaction
    await queryAsync("COMMIT");

    console.log("✅ Request created successfully.");
    return res.status(201).json({
      message: "Request created successfully.",
      request_id
    });
  } catch (err) {
    console.error("❌ Transaction failed:", err);
    await queryAsync("ROLLBACK");
    return res.status(500).json({
      error: "Failed to create request.",
      details: err.message
    });
  }
};

const getRequestedMaterialsHistory = (req, res) => {
  db.query(
    `SELECT 
      rm.request_id, 
      p.project_name, 
      rm.urgency, 
      rm.notes, 
      rm.is_approved, 
      rm.request_date,
      rm.approved_at, 
      rmi.resource_id, 
      ii.item_name, 
      rmi.request_quantity 
    FROM requested_materials rm
    JOIN requested_material_items rmi ON rm.request_id = rmi.request_id
    JOIN projects p ON rmi.project_id = p.project_id
    JOIN inventory_items ii ON rmi.resource_id = ii.item_id
    ORDER BY rm.request_id`,
    (err, results) => {
      if (err) {
        console.error("❌ Error fetching requested materials history:", err);
        return res.status(500).json({ error: "Server error while fetching history" });
      }

      if (!results || results.length === 0) {
        console.warn("⚠️ No requested materials history found.");
        return res.status(404).json({ message: "No requested materials history found." });
      }

      const formattedResults = results.reduce((acc, row) => {
        const existingRequest = acc.find(item => item.request_id === row.request_id);
        if (existingRequest) {
          existingRequest.items.push({
            item_id: row.item_id,
            item_name: row.item_name,
            request_quantity: row.request_quantity,
          });
        } else {
          acc.push({
            request_id: row.request_id,
            project_name: row.project_name,
            urgency: row.urgency,
            notes: row.notes,
            status:
              row.is_approved === 1
                ? 'approved'
                : row.is_approved === 2
                  ? 'rejected'
                  : 'pending',
            request_date: row.request_date,
            approved_at: row.approved_at,
            items: [{
              item_id: row.item_id,
              item_name: row.item_name,
              request_quantity: row.request_quantity,
            }],
          });
        }
        return acc;
      }, []);

      console.log("📌 Sending Requested Materials History Data:", formattedResults);
      return res.json(formattedResults);
    }
  );
};

const approveRequest = (req, res) => {
  const requestId = req.params.requestId;
  const approvedBy = 'Admin';
  const approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');

  db.beginTransaction((err) => {
    if (err) {
      console.error('Database transaction error:', err);
      return res.status(500).json({ error: 'Database transaction error.' });
    }

    db.query(
      'UPDATE requested_materials SET is_approved = 1, approved_by = ?, approved_at = ? WHERE request_id = ?',
      [approvedBy, approvedAt, requestId],
      (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return db.rollback(() => {
            return res.status(500).json({ error: 'Failed to approve request' });
          });
        }
        if (results.affectedRows === 0) {
          return db.rollback(() => {
            return res.status(404).json({ error: 'Request not found' });
          });
        }

        db.query(
          'SELECT item_id, request_quantity FROM requested_material_items WHERE request_id = ?',
          [requestId],
          (err, itemsResults) => {
            if (err) {
              console.error('Database error:', err);
              return db.rollback(() => {
                return res.status(500).json({ error: 'Failed to fetch items' });
              });
            }

            if (!itemsResults || itemsResults.length === 0) {
              return db.rollback(() => {
                return res.status(404).json({ error: 'No items found for request' });
              });
            }

            const updateStockQueries = itemsResults.map(item => {
              return new Promise((resolve, reject) => {
                db.query(
                  'UPDATE inventory_items SET stock_quantity = stock_quantity - ? WHERE item_id = ?',
                  [item.request_quantity, item.item_id],
                  (err, updateResults) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(updateResults);
                    }
                  }
                );
              });
            });

            Promise.all(updateStockQueries)
              .then(() => {
                db.commit((err) => {
                  if (err) {
                    console.error('Database transaction error:', err);
                    return db.rollback(() => {
                      return res.status(500).json({ error: 'Error completing transaction.' });
                    });
                  }
                  res.json({ message: 'Request approved and stock updated successfully' });
                });
              })
              .catch(err => {
                console.error('Database error:', err);
                return db.rollback(() => {
                  return res.status(500).json({ error: 'Failed to update stock' });
                });
              });
          }
        );
      }
    );
  });
};

const rejectRequest = (req, res) => {
  const requestId = req.params.requestId;
  const rejectedAt = moment().format('YYYY-MM-DD HH:mm:ss'); // Get the current date and time

  db.query(
    'UPDATE requested_materials SET is_approved = 2, approved_at = ? WHERE request_id = ?', // 2 represents rejected
    [rejectedAt, requestId],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to reject request' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json({ message: 'Request rejected successfully' });
    }
  );
};
module.exports = { getRequestMaterialItems, createRequestedMaterials, getRequestedMaterialsHistory, approveRequest, rejectRequest };