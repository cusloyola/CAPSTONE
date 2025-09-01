import { API_URL } from "./api";


export const fetchMaterials = async (page, limit, search, brand) => {
  try {
    let url = `${API_URL}/resources?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (brand) url += `&brand=${encodeURIComponent(brand)}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      items: Array.isArray(data.items) ? data.items : [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('API Error: Failed to fetch materials', error);
    throw new Error('Failed to fetch materials. Please check your network and the API server.');
  }
};
