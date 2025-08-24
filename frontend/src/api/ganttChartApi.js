import { API_URL } from "./api";  

export const getGanttTasks = async (projectId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/gantt/${projectId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Gantt fetch error:", error);
    throw error;
  }
};
