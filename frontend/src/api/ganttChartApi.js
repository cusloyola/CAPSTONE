import { API_URL } from "./api";  

// export const getGanttTasks = async (projectId) => {
//   try {
//     const token = localStorage.getItem("token");
//     const response = await fetch(`${API_URL}/gantt-chart/${projectId}`, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch tasks");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("❌ Gantt fetch error:", error);
//     throw error;
//   }
// };


export const getGanttCharts = async (projectId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/gantt-chart/${projectId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Gantt charts");
    }

    const data = await response.json();
    return data.data; // return only the array of Gantt charts
  } catch (error) {
    console.error("❌ Gantt fetch error:", error);
    throw error;
  }
};




export const createGanttChart = async ({ proposal_id, title, notes, approved_by }) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/gantt-chart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ proposal_id, title, notes, approved_by }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create Gantt Chart");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Gantt creation error:", error);
    throw error;
  }
};