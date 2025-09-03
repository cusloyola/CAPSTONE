const db = require("../../config/db");
const moment = require('moment');
const generateStructuredId = require("../../generated/GenerateCodes/generatecode");

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
    "SELECT resource_id, item_name, stock_quantity FROM inventory_items WHERE isDeleted = 0",
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
    await queryAsync("START TRANSACTION");

    const request_id = await generateStructuredId(
      "111",
      "requested_materials",
      "request_id"
    );

    await queryAsync(
      "INSERT INTO requested_materials (request_id, project_id, urgency, notes) VALUES (?, ?, ?, ?)",
      [request_id, selectedProject, urgency, notes]
    );

    const startId = await generateStructuredId(
      "110",
      "requested_material_items",
      "item_request_id"
    );
    let serialCounter = parseInt(startId.slice(-3));

    const values = [];
    for (const item of selectedMaterials) {
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
      r.default_unit_cost, 
      rmi.request_quantity,
      r.material_name,
      rb.brand_name
    FROM requested_materials rm
    JOIN requested_material_items rmi ON rm.request_id = rmi.request_id
    JOIN projects p ON rm.project_id = p.project_id
    JOIN resource r ON rmi.resource_id = r.resource_id
    JOIN resource_brand rb ON r.brand_id = rb.brand_id
    ORDER BY rm.request_id`,
    (err, results) => {
      if (err) {
        console.error("❌ Error fetching requested materials history:", err);
        return res.status(500).json({ error: "Server error while fetching history" });
      }

     if (!results || results.length === 0) {
  console.warn("⚠️ No requested materials history found.");
  return res.json([]); 
}


      const formattedResults = results.reduce((acc, row) => {
        const existingRequest = acc.find(item => item.request_id === row.request_id);
        const material = {
          resource_id: row.resource_id,
          material_name: row.material_name,
          brand_name: row.brand_name,
          request_quantity: row.request_quantity,
          default_unit_cost: row.default_unit_cost,
        };

        if (existingRequest) {
          existingRequest.items.push(material);
        } else {
          acc.push({
            request_id: row.request_id,
            project_name: row.project_name,
            urgency: row.urgency,
            notes: row.notes,
            status:
              row.is_approved === 1
                ? "approved"
                : row.is_approved === 2
                  ? "rejected"
                  : "pending",
            request_date: row.request_date,
            approved_at: row.approved_at,
            items: [material],
          });
        }
        return acc;
      }, []);


      console.log("📌 Sending Requested Materials History Data:", formattedResults);
      return res.json(formattedResults);
    }
  );
};


// Helper function to promisify a MySQL query
const promisifyQuery = (db, sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const approveRequest = async (req, res) => {
  console.log("--- New Request Received ---");
  console.log("Request Params:", req.params);
  console.log("Request Body:", req.body);

  const { requestId } = req.params;
  const approvedBy = "Admin";
  const approvedAt = new Date();

  try {
    await promisifyQuery(db, "START TRANSACTION");
    console.log(`🚀 Transaction started for Request ID: ${requestId}`);

    const resultApprove = await promisifyQuery(
      db,
      "UPDATE requested_materials SET is_approved = 1, approved_by = ?, approved_at = ? WHERE request_id = ?",
      [approvedBy, approvedAt, requestId]
    );

    if (resultApprove.affectedRows === 0) {
      console.log("❌ Request not found. Rolling back.");
      await promisifyQuery(db, "ROLLBACK");
      return res.status(404).json({ error: "Request not found" });
    }
    console.log("✅ Request approved in requested_materials");

    const items = await promisifyQuery(
      db,
      `SELECT t1.resource_id, t1.request_quantity, t2.project_id
             FROM requested_material_items t1
             JOIN requested_materials t2 ON t1.request_id = t2.request_id
             WHERE t1.request_id = ?`,
      [requestId]
    );

    console.log(`📦 Found ${items.length} items to process`);
    console.log("Items to process:", items);

    for (const item of items) {
      const { resource_id, request_quantity, project_id } = item;

      const [resource] = await promisifyQuery(
        db,
        "SELECT work_item_id, stocks, default_unit_cost FROM resource WHERE resource_id = ?",
        [resource_id]
      );
      if (!resource) throw new Error(`Resource ${resource_id} not found`);

      const previous_stock = resource.stocks;
      const current_stock = previous_stock - request_quantity;
      const total_cost = request_quantity * resource.default_unit_cost;

      console.log(`🔹 Processing resource_id: ${resource_id}, quantity: ${request_quantity}`);
      console.log(`  Previous stock: ${previous_stock}, Current stock: ${current_stock}, Total cost: ${total_cost}`);

      const updateResource = await promisifyQuery(
        db,
        "UPDATE resource SET stocks = ? WHERE resource_id = ?",
        [current_stock, resource_id]
      );
      console.log("  ✅ Resource stock updated:", updateResource.affectedRows);

      const [proposal] = await promisifyQuery(
        db,
        `SELECT sp.sow_proposal_id
                 FROM sow_proposal sp
                 JOIN proposals p ON sp.proposal_id = p.proposal_id
                 WHERE sp.work_item_id = ? AND p.project_id = ?`,
        [resource.work_item_id, project_id]
      );

      if (!proposal) {
        throw new Error(`Sow proposal not found for work_item ${resource.work_item_id} and project ${project_id}`);
      }

      const updateFinal = await promisifyQuery(
        db,
        `UPDATE final_estimation_details
                 SET remaining_amount = remaining_amount - ?
                 WHERE sow_proposal_id = ?`,
        [total_cost, proposal.sow_proposal_id]
      );

      console.log("  ✅ Final estimation updated:", updateFinal.affectedRows);

      const materialUsageId = await generateStructuredId("12", "material_usage", "material_usage_id");
      console.log("  Generated material_usage_id:", materialUsageId);

      const insertUsage = await promisifyQuery(
        db,
        `INSERT INTO material_usage
                 (material_usage_id, work_item_id, project_id, resource_id, quantity_used, total_cost, previous_stock, quantity_issued, current_stock, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          materialUsageId,
          resource.work_item_id,
          project_id,
          resource_id,
          request_quantity,
          total_cost,
          previous_stock,
          request_quantity,
          current_stock,
          approvedAt
        ]
      );
      console.log("  ✅ Material usage inserted:", insertUsage.affectedRows);
    }

    await promisifyQuery(db, "COMMIT");
    console.log("🎉 Transaction committed successfully");
    res.json({ message: "Request approved and all related tables updated successfully" });

  } catch (err) {
    await promisifyQuery(db, "ROLLBACK");
    console.error("❌ Transaction failed. Rolled back.", err);
    res.status(500).json({ error: "Transaction failed. Rolled back." });
  }
};

// You need to ensure the generateStructuredId and db variables are also defined and available in this file.
// For example, if they are imported from another file:
// const db = require('../path/to/db-connection');
// const generateStructuredId = require('../path/to/generate-id-helper');


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