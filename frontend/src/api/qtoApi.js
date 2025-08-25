import { API_URL } from "./api";


export const fetchQTOByProject = async (projectId) => {
  const res = await fetch(`${API_URL}/qto/parent-totals/${projectId}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const { data } = await res.json();
  return data;
};