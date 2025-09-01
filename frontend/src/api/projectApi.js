import { API_URL } from "./api";


export const fetchBrands = async () => {
  try {
    const response = await fetch(`${API_URL}/resource/brands`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error: Failed to fetch brands', error);
    throw new Error('Failed to fetch brand categories.');
  }
};

// Fetch all available projects
export const fetchProjects = async () => {
  try {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error: Failed to fetch projects', error);
    throw new Error('Failed to fetch projects.');
  }
};



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
