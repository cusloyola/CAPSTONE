const db = require("../config/db");

exports.getChecklistData = async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM checklist_categories");
    const items = await db.query("SELECT * FROM checklist_data");

    if (!Array.isArray(categories) || !Array.isArray(items)) {
      return res.status(500).json({ message: "Unexpected database response format" });
    }

    const checklist = categories.map((category) => {
      const relatedItems = items
        .filter((item) => item.category_id === category.category_id)
        .map((item) => ({
          id: item.data_id,
          text: item.data_name,
          response: item.response || null,
          actionRequired: item.action_required || "",
        }));

      return {
        section: category.category_name,
        items: relatedItems,
      };
    });

    res.status(200).json({ checklist });
  } catch (error) {
    console.error("❌ Error fetching checklist data:", error);
    res.status(500).json({ message: "Failed to fetch checklist data" });
  }
};
