const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');


// Ensure the uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using the current timestamp
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with timestamp
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Controller method for handling file upload
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Respond with success message and file details
  res.status(200).json({
    message: 'File uploaded successfully',
    file_name: req.file.originalname,
    file_path: req.file.path, // Path to the uploaded file
  });
};

module.exports = { uploadFile, upload };
