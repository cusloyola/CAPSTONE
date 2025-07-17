const db = require("../config/db"); // ✅ Ensure this is correctly set up

exports.getChecklistData = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM checklist_categories');
    const [items] = await db.query('SELECT * FROM checklist_data');

    const result = categories.map(cat => ({
      section: cat.section,
      items: items
        .filter(item => item.category_id === cat.id)
        .map(item => ({
          id: item.id,
          text: item.checklist_item,
          response: item.response,
          actionRequired: item.action_required
        }))
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching checklist data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
