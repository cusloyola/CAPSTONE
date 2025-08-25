import { API_URL } from "./api";

export const getProposalsByProject = async (projectId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/proposals/approved/${projectId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch proposals");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Proposal fetch error:", error);
    throw error;
  }
};
