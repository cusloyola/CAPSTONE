// const db = require('../../config/db');


// const addQtoEntries = async (req, res) => {
//   try {
//     const { qto_entries } = req.body;

//     if (!qto_entries || !Array.isArray(qto_entries) || qto_entries.length === 0) {
//       return res.status(400).json({ message: "No QTO entries provided" });
//     }

//     const insertPromises = qto_entries.map(entry => {
//       const {
//         sow_proposal_id,
//         length = null,
//         width = null,
//         height = null,
//         quantity = null,
//         computed_value = null,
//         notes = null,
//       } = entry;

//       // Optional: Validate required fields here (e.g. sow_proposal_id, unit_type)

//       return db.query(
//         `INSERT INTO qto_entries 
//           (sow_proposal_id, length, width, height, quantity, computed_value, notes) 
//          VALUES (?, ?, ?,  ?, ?, ?, ?)`,
//         [sow_proposal_id, length, width, height, quantity, computed_value, notes]
//       );
//     });

//     await Promise.all(insertPromises);

//     res.status(201).json({ message: "QTO entries added successfully" });
//   } catch (error) {
//     console.error("Error inserting QTO entries:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
