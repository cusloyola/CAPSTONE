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

//List of Projects
export const fetchProjectsWithApproved = async () => {
  try {
    const response = await fetch(`${API_URL}/projects/with-approved`);
    if (!response.ok) {
      throw new Error("Failed to fetch projects with approved proposals");
    }
    return await response.json();
  } catch (err) {
    console.error("Error fetching projects:", err);
    return [];
  }
};
