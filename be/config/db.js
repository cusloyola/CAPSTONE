const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root", 
    password: "", 
    database: "drl_construction_database"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL database");
    }
});

module.exports = db;
