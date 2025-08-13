const db = require('../../config/db');

const getAllSOWWorkItems = (req, res) => {
 const sql = `
  SELECT
      s.work_item_id,
      s.item_title,
      u.unitCode, 
      s.sequence_order,
      t.type_name AS category
  FROM
      sow_work_items s
  JOIN
      sow_work_types t ON s.work_type_id = t.work_type_id
  JOIN
      unit_of_measure u ON s.unitID = u.unitID 
  WHERE
      s.parent_id IS NULL
  ORDER BY s.sequence_order;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
};


const getSowWorkItemsByProposal = (req, res) => {
  const { proposal_id } = req.params;

  if (!proposal_id) {
    return res.status(400).json({ error: "proposal_id is required" });
  }

  const sql = `
   SELECT
    sp.work_item_id,
    swi.item_title,
    u.unitCode,
    swi.sequence_order,
    wt.type_name AS category
FROM sow_proposal sp
JOIN sow_work_items swi ON sp.work_item_id = swi.work_item_id
JOIN unit_of_measure u ON swi.unitID = u.unitID
JOIN sow_work_types wt ON swi.work_type_id = wt.work_type_id
WHERE sp.proposal_id = ?
ORDER BY swi.sequence_order;

  `;

  db.query(sql, [proposal_id], (err, results) => {
    if (err) {
      console.error("Failed to fetch SOW work items by proposal:", err);
      return res.status(500).json({ error: "Server error fetching work items" });
    }
    res.status(200).json(results);
  });
};

const getSOWfromTable = (req, res) => {
  const { proposal_id } = req.query;

  if (!proposal_id) {
    return res.status(400).json({ error: "proposal_id is required" });
  }

  // 1. Fetch selected parent items (with sow_proposal_id)
  const parentSql = `
    SELECT
      sp.sow_proposal_id,
      swi.work_item_id,
      swi.item_title,
      swi.unitID,
      swi.sequence_order,
      swi.work_type_id,
      swi.parent_id,
      swi.compute_type,
      swi.quantity_type
    FROM sow_proposal sp
    JOIN sow_work_items swi ON sp.work_item_id = swi.work_item_id
    WHERE sp.proposal_id = ?
  `;

  db.query(parentSql, [proposal_id], (err, parentItems) => {
    if (err) {
      console.error("❌ Error fetching parents:", err);
      return res.status(500).json({ error: "Error fetching parent items" });
    }

    const parentIds = parentItems.map(p => p.work_item_id);

    if (parentIds.length === 0) {
      return res.status(200).json({ workItems: [], floors: [] });
    }

    // 2. Fetch children of those parent IDs
    const childSql = `
      SELECT
        swi.work_item_id,
        swi.item_title,
        swi.unitID,
        swi.sequence_order,
        swi.work_type_id,
        swi.parent_id,
        swi.compute_type,
              swi.quantity_type

      FROM sow_work_items swi
      WHERE swi.parent_id IN (?)
    `;

    db.query(childSql, [parentIds], (err, childItems) => {
      if (err) {
        console.error("❌ Error fetching children:", err);
        return res.status(500).json({ error: "Error fetching child items" });
      }

      // 3. Attach sow_proposal_id from parents to each child
      const enrichedChildren = childItems.map(child => {
        const parent = parentItems.find(p => p.work_item_id === child.parent_id);
        return {
          ...child,
          sow_proposal_id: parent?.sow_proposal_id || null
        };
      });

      const allItems = [...parentItems, ...enrichedChildren];

      // 4. Check if any item is floor-based
      const hasFloorBasedItems = allItems.some(item => item.compute_type === 'sum_per_floors');

      if (!hasFloorBasedItems) {
        return res.status(200).json({ workItems: allItems, floors: [] });
      }

      // 5. Fetch floor data
      const floorSql = `
        SELECT pf.floor_id, pf.floor_code, pf.floor_label
        FROM proposals p
        JOIN projects pr ON p.project_id = pr.project_id
        JOIN project_floors pf ON pr.project_id = pf.project_id
        WHERE p.proposal_id = ?
      `;

      db.query(floorSql, [proposal_id], (err, floors) => {
        if (err) {
          console.error("❌ Error fetching floors:", err);
          return res.status(500).json({ error: "Error fetching floors" });
        }

        return res.status(200).json({ workItems: allItems, floors });
      });
    });
  });
};









const addSOWWorkItems = async (req, res) => {
  try {
    const { proposal_id, work_item_ids } = req.body;

    if (!proposal_id) {
      return res.status(400).json({ message: "proposal_id is required" });
    }

    if (!work_item_ids || !Array.isArray(work_item_ids) || work_item_ids.length === 0) {
      return res.status(400).json({ message: "No work items selected" });
    }

    const insertPromises = work_item_ids.map(work_item_id => {
      return db.query(
        "INSERT INTO sow_proposal (proposal_id, work_item_id) VALUES (?, ?)",
        [proposal_id, work_item_id]
      );
    });

    await Promise.all(insertPromises);

    res.status(201).json({ message: "Work items added to proposal successfully" });
  } catch (error) {
    console.error("Error inserting work items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};











const getAllWorkItemsRaw = (req, res) => {
  const sql = `
    SELECT 
      w.work_item_id, 
      w.item_title, 
      w.item_description, 
      w.unitID, 
      u.unitCode,
      w.sequence_order
    FROM 
      sow_work_items w
    JOIN 
      unit_of_measure u ON w.unitID = u.unitID
    ORDER BY 
      w.sequence_order
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
};

// ADD
const addWorkItem = (req, res) => {
  const { item_title, item_description, unitID, sequence_order, work_type_id } = req.body;
  const sql = `
    INSERT INTO sow_work_items (work_type_id, item_title, item_description, unitID, sequence_order)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [work_type_id, item_title, item_description, unitID, sequence_order], (err, result) => {
    if (err) {
      console.error("Add Work Item DB error:", err);
      return res.status(500).json({ error: "DB error", details: err });
    }
    res.json({ success: true, id: result.insertId });
  });
};

const getAllWorkTypes = (req, res) => {
  const sql = "SELECT work_type_id, type_name, type_description, sequence_order FROM sow_work_types ORDER BY sequence_order";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
};

const getWorkTypesAndItemsByProposal = (req, res) => {
    const { proposal_id } = req.params;

    const sql = `
        SELECT 
            swt.work_type_id,
            swt.type_name,
            swt.sequence_order,
            swi.work_item_id,
            swi.item_title
        FROM sow_proposal sp
        JOIN sow_work_items swi ON sp.work_item_id = swi.work_item_id
        JOIN sow_work_types swt ON swi.work_type_id = swt.work_type_id
        WHERE sp.proposal_id = ?
        ORDER BY swt.sequence_order, swi.item_title
    `;

    db.query(sql, [proposal_id], (err, results) => {
        if (err) {
            console.error("❌ Error fetching SOW grouped items:", err);
            return res.status(500).json({ error: "Database error" });
        }

        const grouped = {};
        results.forEach(row => {
            const { work_type_id, type_name, work_item_id, item_title } = row;
            if (!grouped[work_type_id]) {
                grouped[work_type_id] = {
                    work_type_id,
                    type_name,
                    items: []
                };
            }
            grouped[work_type_id].items.push({ work_item_id, item_title });
        });

        console.log("✅ SOW Grouped Items:", Object.values(grouped));
        res.json(Object.values(grouped));
    });
};



const updateProposalWorkItem = async (req, res) => {
  const { proposal_id, work_item_id, new_work_item_id } = req.body;

  if (!proposal_id || !work_item_id || !new_work_item_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await db.query(
      "UPDATE sow_proposal SET work_item_id = ? WHERE proposal_id = ? AND work_item_id = ?",
      [new_work_item_id, proposal_id, work_item_id]
    );
    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteWorkItem = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM sow_work_items WHERE work_item_id=?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("MySQL error:", err); // <-- Log the real error
      return res.status(500).json({ error: err.sqlMessage }); // <-- Return MySQL error for debugging
    }
    res.json({ success: true, affectedRows: result.affectedRows });
  });
};

module.exports = {
  getAllSOWWorkItems,
  getSOWfromTable,



  addSOWWorkItems,
  getSowWorkItemsByProposal,
  getAllWorkItemsRaw,
  addWorkItem,
  updateProposalWorkItem,
  deleteWorkItem,
  getAllWorkTypes,

  getWorkTypesAndItemsByProposal

};
