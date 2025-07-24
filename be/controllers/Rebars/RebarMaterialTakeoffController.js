const db = require("../../config/db");

const getRebarDetails = (req, res) => {
  const { proposal_id } = req.params;

  const sql = `
    SELECT
      rd.rebar_masterlist_id,
      rm.label,
      rd.work_item_id,
      SUM(rd.total_weight) AS total_weight
    FROM rebar_details rd
    JOIN rebar_masterlist rm ON rd.rebar_masterlist_id = rm.rebar_masterlist_id
    JOIN sow_proposal sp ON sp.sow_proposal_id = rd.sow_proposal_id
    WHERE sp.proposal_id = ?
    GROUP BY rd.rebar_masterlist_id
  `;

  db.query(sql, [proposal_id], (err, results) => {
    if (err) {
      console.error("Failed to get rebar details:", err);
      return res.status(500).json({ message: "DB error" });
    }

    return res.status(200).json({
      message: "Rebar details fetched successfully",
      data: results,
    });
  });
};

const getResourceDetails = (req, res) => {

  const sql = 
  `SELECT
  r.material_name,
  r.brand_name,
  uom.unitId
  r.default_unit_cost
  FROM
  resource r
  JOIN unit_of_measure uom ON r.unitId = uom.unitId
  
  `
  db.query(sql, (err, results) => {
    if(err){
      console.error("Failed to fetch resource details: ", err);
      return res.status(500).json({message: "DB Error"});
    }
    return res.status(200).json({message: "Successfully fetch resource details", data: results});
  });

};

const submitRebarResources = (req, res) => {
  console.log("📦 Received Rebar Request:", req.body);

  const { resources, grand_total } = req.body;

if (!Array.isArray(resources) || resources.length === 0) {
  return res.status(400).json({ error: "No rebar resources provided" });
}

const sow_proposal_id = resources[0]?.sow_proposal_id;

if (!sow_proposal_id) {
  return res.status(400).json({ error: "Missing sow_proposal_id" });
}


  if (!Array.isArray(resources) || resources.length === 0) {
    return res.status(400).json({ error: "No rebar resources provided" });
  }

  const insertResourcesQuery = `
    INSERT INTO mto_rebar_resources (
      sow_proposal_id,
      rebar_masterlist_id,
      resource_id,
      material_cost
    ) VALUES ?
  `;

  const values = resources.map(resource => [
    sow_proposal_id,
    resource.rebar_masterlist_id,
    resource.resource_id,
    resource.material_cost,
  ]);

  console.log("📤 Rebar resource rows to insert:", values);

  db.query(insertResourcesQuery, [values], (err1, result1) => {
    if (err1) {
      console.error("❌ Error inserting rebar resources:", err1);
      return res.status(500).json({ error: "Failed to insert rebar resources" });
    }

    console.log("✅ Rebar resources inserted:", result1.affectedRows);

    const insertTotalQuery = `
      INSERT INTO mto_rebar_totals (
        sow_proposal_id,
        rebar_grand_total
      ) VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        rebar_grand_total = VALUES(rebar_grand_total);
    `;

    db.query(insertTotalQuery, [sow_proposal_id, grand_total], (err2, result2) => {
      if (err2) {
        console.error("❌ Error saving grand total:", err2);
        return res.status(500).json({ error: "Failed to save grand total" });
      }

      console.log("✅ Grand total saved/updated:", result2.affectedRows);
      res.json({ message: "Rebar resources and grand total saved successfully" });
    });
  });
};

const getFullRebarTakeOff = (req, res) => {
  const { proposal_id } = req.params;

  const sql = `
 SELECT
  mrr.mto_rebar_resource_id,
    mrr.material_cost,
    mrr.sow_proposal_id,
    mrr.rebar_masterlist_id,
    mrr.resource_id,
    swi.item_title AS parent_title,         
    swi.work_item_id AS parent_id,         
    rm.label,
    SUM(rd.total_weight) AS total_per_rebar,
    r.material_name,
    r.brand_name,
    r.default_unit_cost,
    uom.unitCode
    FROM
        mto_rebar_resources mrr
    JOIN sow_proposal sp ON mrr.sow_proposal_id = sp.sow_proposal_id
    JOIN sow_work_items swi ON sp.work_item_id = swi.work_item_id
    JOIN rebar_masterlist rm ON mrr.rebar_masterlist_id = rm.rebar_masterlist_id
    JOIN rebar_details rd ON rm.rebar_masterlist_id = rd.rebar_masterlist_id
    JOIN resource r ON mrr.resource_id = r.resource_id
    JOIN unit_of_measure uom ON r.unitId = uom.unitId
    WHERE sp.proposal_id = ?
    GROUP BY
     mrr.mto_rebar_resource_id,
    mrr.material_cost,
    mrr.sow_proposal_id,
    mrr.rebar_masterlist_id,
    mrr.resource_id,
    swi.item_title,
    swi.work_item_id,
    rm.label,
    r.material_name,
    r.brand_name,
    r.default_unit_cost,
    uom.unitCode;


  `;

  db.query(sql, [proposal_id], (err, results) => { // ✅ <-- fix is here
    if (err) {
      console.error("Failed to fetch full rebar take off:", err);
      return res.status(500).json({ message: "DB Error" });
    }
    return res.status(200).json({ message: "Successfully fetched rebar take off", data: results });
  });
};


const updateRebarResources = async (req, res) => {
    try {
        const { materialTakeOff } = req.body;

        if (!Array.isArray(materialTakeOff) || materialTakeOff.length === 0) {
            return res.status(400).json({ message: "Invalid materialTakeOff payload" });
        }

        // Destructure the specific values needed for the first update
        const { mto_rebar_resource_id, resource_id, material_cost, sow_proposal_id } = materialTakeOff[0];

        // Ensure the primary key for the resource update is present
        if (!mto_rebar_resource_id) {
            return res.status(400).json({ message: "Missing mto_rebar_resource_id for update" });
        }

        console.log("🔧 Attempting to update rebar resource:", {
            mto_rebar_resource_id, // Log the primary key being used
            resource_id,
            material_cost,
            sow_proposal_id,
        });

        // 1. Update based on the primary key (mto_rebar_resource_id)
        const updateResult = await db.query(
            `UPDATE mto_rebar_resources
             SET resource_id = ?, material_cost = ?
             WHERE mto_rebar_resource_id = ?`, // Use mto_rebar_resource_id here
            [resource_id, material_cost, mto_rebar_resource_id] // Pass resource_id and material_cost for SET, and mto_rebar_resource_id for WHERE
        );

        console.log("✅ Rebar resource update result:", updateResult);

        if (updateResult.affectedRows === 0) {
            // This now means the specific mto_rebar_resource_id wasn't found
            return res.status(404).json({ message: `No rebar resource found with ID ${mto_rebar_resource_id} to update.` });
        }

        // 2. Recompute the grand total for that sow_proposal_id
        // This part is likely correct if mto_rebar_resources has sow_proposal_id and you want the sum of all resources for that proposal
        const totalRows = await db.query(
            `SELECT SUM(material_cost) AS new_total
             FROM mto_rebar_resources
             WHERE sow_proposal_id = ?`,
            [sow_proposal_id] // Using sow_proposal_id here is correct for summing up all materials for that proposal
        );

        const newTotal = totalRows[0]?.new_total || 0;
        console.log("📊 New total computed for sow_proposal_id", sow_proposal_id, ":", newTotal);

        // 3. Update the grand total table
        // Assuming mto_rebar_totals has sow_proposal_id as a unique identifier (or primary key)
        const totalUpdateResult = await db.query(
            `UPDATE mto_rebar_totals
             SET rebar_grand_total = ?
             WHERE sow_proposal_id = ?`, // This is likely fine if there's only one total per sow_proposal_id
            [newTotal, sow_proposal_id]
        );

        console.log("🟢 Rebar grand total updated:", totalUpdateResult);

        if (totalUpdateResult.affectedRows === 0) {
            // If mto_rebar_totals truly has a mto_rebar_total_id and you need to use it,
            // you'd need to pass it from the frontend or fetch it first.
            // For now, if no row is affected here, it means no existing total for that sow_proposal_id.
            // You might need to INSERT if it doesn't exist, rather than just returning 404.
            return res.status(404).json({ message: `No rebar total row found for sow_proposal_id ${sow_proposal_id} to update.` });
        }

        res.status(200).json({ message: "Update successful", newTotal });

    } catch (err) {
        console.error("❌ Update failed:", err);
        res.status(500).json({ error: "Failed to update rebar data" });
    }
};

module.exports = {
  getRebarDetails,
  getResourceDetails,
  submitRebarResources,
  getFullRebarTakeOff,
  updateRebarResources
};




