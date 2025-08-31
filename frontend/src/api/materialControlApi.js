import { API_URL } from "./api";

export const getMaterialCostOverview = async (projectId) => {
  try {
    const res = await fetch(`${API_URL}/materialcontrol/${projectId}`);
    if (!res.ok) throw new Error("Failed to fetch material cost overview");
    const data = await res.json();
    return data; // { budget: [...] }
  } catch (err) {
    console.error("Error fetching material cost overview:", err);
    throw err;
  }
};
