
//SetDurationCompute.jsx
export const calculateRowTotal = (row) =>
  row.rate === 0 ? 0 : row.quantity / row.rate;




//SetDurationModal.jsx
export function filterWorkItems(items, searchTerm, categoryFilter) {
  return items.filter(item => {
    const matchesSearch =
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || item.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });
}
