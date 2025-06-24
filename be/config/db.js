const mysql = require("mysql");
const util = require('util');
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "", // Ensure your .env has DB_PASSWORD or it's empty
    database: process.env.DB_NAME || "drl_construction_database",
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL database");
    }
});

// !!! THIS IS THE CRITICAL CORRECTION !!!
// Promisify the 'query' method of the 'db' connection object
db.query = util.promisify(db.query);


module.exports = db; // Export the promisified 'db' object