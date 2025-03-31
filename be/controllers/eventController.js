// controllers/eventController.js
const db = require('../config/db');

// Get all events
exports.getEvents = (req, res) => {
  db.query('SELECT * FROM events ORDER BY start_date', (err, results) => {
    if (err) {
      console.error('❌ Error fetching events:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Add a new event
exports.addEvent = (req, res) => {
  const { title, start_date, end_date, event_level } = req.body;

  if (!title || !start_date || !end_date || !event_level) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO events (title, start_date, end_date, event_level) VALUES (?, ?, ?, ?)';
  db.query(query, [title, start_date, end_date, event_level], (err, result) => {
    if (err) {
      console.error('❌ Error adding event:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Event added successfully', id: result.insertId });
  });
};

// Update an existing event
exports.updateEvent = (req, res) => {
  const { id } = req.params;
  const { title, start_date, end_date, event_level } = req.body;

  if (!title || !start_date || !end_date || !event_level) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'UPDATE events SET title = ?, start_date = ?, end_date = ?, event_level = ? WHERE id = ?';
  db.query(query, [title, start_date, end_date, event_level, id], (err, result) => {
    if (err) {
      console.error('❌ Error updating event:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully' });
  });
};

// Delete an event
exports.deleteEvent = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM events WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error deleting event:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
};
