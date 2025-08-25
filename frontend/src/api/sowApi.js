import { API_URL } from "./api";

export const fetchWorkDetails = async (projectId) => {

  const res = await fetch(`${API_URL}/gantt-chart/work-details?project_id=${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch work details");

  const data = await res.json();

  return (Array.isArray(data) ? data : [])
    .filter(item => Number(item.amount) > 0)
    .map(item => ({
      itemId: item.sow_proposal_id,
      sow_proposal_id: item.sow_proposal_id,
      description: item.item_title,
      category: item.type_name,
      work_item_id: item.work_item_id,
      isReinforcement: !!item.rebar_overall_weight,
      rebar_overall_weight: item.rebar_overall_weight || 0
    }));
};
