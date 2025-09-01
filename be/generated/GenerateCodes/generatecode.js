const db = require("../../config/db"); // adjust path

function generateStructuredId(tableCode, tableName, idColumn) {
  return new Promise((resolve, reject) => {
    const year = new Date().getFullYear().toString().slice(-2);

   // This is the corrected SQL query
const sql = `
  SELECT ${idColumn} FROM ${tableName} 
  WHERE ${idColumn} LIKE '${tableCode}${year}%'
  ORDER BY LENGTH(${idColumn}) DESC, ${idColumn} DESC
  LIMIT 1
`;

    db.query(sql, (err, results) => {
      if (err) return reject(err);

      let serial = 1;
      if (results.length > 0) {
        const lastId = results[0][idColumn];
        serial = parseInt(lastId.slice(-3)) + 1;
      }

      const newId = `${tableCode}${year}${String(serial).padStart(3, "0")}`;
      resolve(newId);
    });
  });
}


module.exports = generateStructuredId;
