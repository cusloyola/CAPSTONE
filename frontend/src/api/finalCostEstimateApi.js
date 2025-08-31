import { API_URL } from "./api";


export const saveFinalEstimation = async (
  proposal_id,
  costData,
  totalAmount,
  markupPercent,
  markupAmount,
  grandTotal
) => {
  const details = costData.map((row) => ({
    sow_proposal_id: row.sow_proposal_id,
    amount: parseFloat(row.total_with_allowance ?? row.total_amount) || 0,
  }));

  const res = await fetch(`${API_URL}/cost-estimation/${proposal_id}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      details,
      total: totalAmount,
      markup_percent: markupPercent,
      markup_amount: markupAmount,
      grand_total: grandTotal,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Throw an Error with the message from the API
    throw new Error(data.error || "Failed to save final estimation");
  }

  return data;
};
