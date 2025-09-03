import { API_URL } from "./api";


export const fetchMaterials = async () => {
  try {
    const response = await fetch(`${API_URL}/resource/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      items: Array.isArray(data) ? data : [],
      total: Array.isArray(data) ? data.length : 0,
    };
  } catch (error) {
    console.error("API Error: Failed to fetch materials", error);
    throw new Error("Failed to fetch materials. Please check your network and the API server.");
  }
};
