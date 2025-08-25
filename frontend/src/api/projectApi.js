import { API_URL } from "./api";


//Project Information
export const fetchProjectInfo = async (project_id) => {
  try {
    const response = await fetch(`${API_URL}/projects/${project_id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch project info");
    }
    const data = await response.json();
    return data; // single project object
  } catch (err) {
    console.error("Error fetching project info:", err);
    return null;
  }
};
