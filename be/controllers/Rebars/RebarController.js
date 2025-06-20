const { parse } = require("dotenv");
const db = require("../../config/db");

const getRebarMasterlist = (req, res) => {
  const sql = `SELECT * FROM rebar_masterlist ORDER BY diameter_mm, length_m, label`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching rebar masterlist:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // ✅ Here 'results' is defined as the second argument of db.query
    return res.status(200).json(results);
  });
};

const addRebarEntries = async (req, res) => {
  const {rebar_entries} = req.body;

  try {
  
 if (!Array.isArray(rebar_entries) || rebar_entries.length === 0) {
  return res.status(400).json({ message: "No rebars to submit" });
}


  const insertPromises = rebar_entries.map(item => {

    const{
      quantity,
      total_weight,
      rebar_masterlist_id,
      work_item_id,
      location,
    } = item;


    const qty = parseFloat(quantity) || 0;
    const weight = parseFloat(total_weight) || 0;

    if(!rebar_masterlist_id || qty <= 0) {

      return Promise.resolve();
    }


    return db.query(

      `INSERT INTO rebar_details 
      (rebar_masterlist_id, work_item_id, total_weight, location, quantity )
      VALUES (?, ?, ?, ?, ?)` ,
      [rebar_masterlist_id, work_item_id, weight, location, qty ]
    );

  });

  await Promise.all(insertPromises);

  return res.status(201).json({message: "Rebar Successfully added"});

 } catch(error){
     console.error("Error adding rebar in database", error);
     return res.status(500).json({message: "Internal server Error"});
 }
};

module.exports = {
    getRebarMasterlist,
    addRebarEntries
};