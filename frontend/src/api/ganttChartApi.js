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

















//Gantt Chart Setup
export const fetchGanttTasks = async (projectId) => {
  if (!projectId) {
    console.warn("⚠️ No projectId provided");
    return [];
  }

  try {
    console.log("🌐 Fetching tasks for projectId:", projectId);
    const res = await fetch(
      `${API_URL}/gantt-chart/work-details?project_id=${projectId}`
    );

    if (!res.ok) {
      console.error("❌ Failed fetch, status:", res.status);
      return [];
    }

    const data = await res.json();
    console.log("📦 Tasks fetched from API:", data);

    if (!Array.isArray(data)) {
      console.error("❌ API did not return an array:", data);
      return [];
    }

    const mappedTasks = data.map((item, index) => ({
      itemNo: index + 1,
      description: item.item_title,
      amount: Number(item.amount) || 0,
      startWeek: 1,
      finishWeek: 4,
      duration: 4,
      color: "bg-blue-500",
      completedWeeks: [],
    }));

    console.log("📝 Mapped tasks:", mappedTasks);
    return mappedTasks;
  } catch (err) {
    console.error("🔥 Error fetching work details:", err);
    return [];
  }
};


//SetDurationCompute - saveDuration
export const saveTask = async (taskData) => {
  try {
    const response = await fetch(`${API_URL}/gantt-chart/save-duration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("Failed to save task");
    }

    const data = await response.json();
    console.log("Saved task:", data);
    return data;
  } catch (err) {
    console.error("Error saving task:", err);
    throw err;
  }
};