
//Code ni Marcus

// // middleware/upload.js
// const multer = require("multer");
// const path = require("path");

// // Set storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // ensure this folder exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// module.exports = upload;



const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check if the route or a field tells us what folder to use
    let folder = "uploads/general";

    if (req.baseUrl.includes("safetyReports")) {
      folder = "uploads/weeklySafetyReports";
    } else if (req.baseUrl.includes("dailySiteReports")) {
      folder = "uploads/dailySiteReports";
    } else if (req.baseUrl.includes("incidentReports")) {
      folder = "uploads/incidentReports";
    }

    // ensure folder exists
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;

