// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Define routes for events
router.get('/', eventController.getEvents); // Fetch all events
router.post('/', eventController.addEvent); // Add a new event
router.put('/:id', eventController.updateEvent); // Update an event
router.delete('/:id', eventController.deleteEvent); // Delete an event

module.exports = router;
