const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const db = require('../config/db');

const router = express.Router();

// Multer storage to local /uploads folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        // Ensure the uploads directory exists
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

// Promisified db.query
const query = (sql, values) => new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
    });
});

// Upload file to local storage and save metadata
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    const { folder_id, client_id } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const sql = `
            INSERT INTO files (folder_id, client_id, file_name, file_path, mime_type)
            VALUES (?, ?, ?, ?, ?)
        `;
        const relativeFilePath = path.relative(path.join(__dirname, '..', 'uploads'), req.file.path);
        const result = await query(sql, [
            parseInt(folder_id),
            parseInt(client_id),
            req.file.originalname,
            relativeFilePath, // Store relative path from the 'uploads' folder
            req.file.mimetype,
        ]);

        res.status(200).json({
            message: 'File uploaded successfully',
            file_name: req.file.originalname,
            file_id: result.insertId,
        });
    } catch (err) {
        console.error('❌ Upload DB Error:', err);
        // If database fails, try to delete the uploaded file
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.warn('⚠️ Failed to delete uploaded file after DB error:', unlinkErr);
            });
        }
        res.status(500).json({ error: 'Error saving file', details: err });
    }
});

// Fetch all files in a folder
router.get('/:clientId/:folderId', async (req, res) => {
    const { clientId, folderId } = req.params;

    const sql = `
        SELECT file_id, file_name, file_path, mime_type, created_at
        FROM files
        WHERE client_id = ? AND folder_id = ?
    `;

    try {
        const results = await query(sql, [parseInt(clientId), parseInt(folderId)]);
        res.status(200).json(results);
    } catch (err) {
        console.error('❌ Fetch files error:', err);
        res.status(500).json({ error: 'Error fetching files', details: err });
    }
});

// Serve file from uploads/ folder
router.get('/view/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const result = await query(`SELECT file_path, mime_type FROM files WHERE file_name = ?`, [filename]);

        if (result.length === 0) {
            return res.status(404).send('File not found');
        }

        const filePath = path.join(__dirname, '..', 'uploads', result[0].file_path);

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).send('File not found on server');
            }

            res.setHeader('Content-Type', result[0].mime_type);
            res.sendFile(filePath);
        });
    } catch (err) {
        console.error('❌ Error serving file:', err);
        res.status(500).send('Error serving file');
    }
});

// Delete file by ID
router.delete('/:fileId', verifyToken, async (req, res) => {
    const { fileId } = req.params;

    try {
        const result = await query(`SELECT file_path FROM files WHERE file_id = ?`, [parseInt(fileId)]);
        if (result.length === 0) return res.status(404).json({ error: 'File not found' });

        const filePath = path.join(__dirname, '..', 'uploads', result[0].file_path);

        fs.unlink(filePath, async (err) => {
            if (err) console.warn('⚠️ File already missing or error deleting:', err.message);

            await query(`DELETE FROM files WHERE file_id = ?`, [parseInt(fileId)]);
            res.status(200).json({ message: 'File deleted successfully' });
        });
    } catch (err) {
        console.error('❌ Delete error:', err);
        res.status(500).json({ error: 'Error deleting file', details: err });
    }
});

module.exports = router;