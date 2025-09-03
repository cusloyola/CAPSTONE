import { API_URL } from "./api";

export const fetchHistory = async () => {
  try {
    const response = await fetch(`${API_URL}/admin-request/history`);

    if (!response.ok) {
      const text = await response.text(); // see what server sent
      throw new Error(`Failed to fetch history: ${text}`);
    }

    const data = await response.json().catch(() => []); // fallback to empty

    const updatedRequests = Array.isArray(data)
      ? data.map(r => ({
          ...r,
          status: r.status || "pending",
        }))
      : [];

    return { success: true, data: updatedRequests };
  } catch (error) {
    console.error("Failed to fetch material requests.", error);
    return { success: false, error: "Failed to fetch material requests." };
  }
};



export const openModal = async (requestId) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin-request/${requestId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  setSelectedReport(data.report);
  setSelectedMaterials(data.materials);
  setShowModal(true);
};


export const approveRequest = async (requestId) => {
    try {
        const response = await fetch(`${API_URL}/admin-request/${requestId}/approve`, {
            method: 'PUT',
        });

        if (!response.ok) {
            throw new Error('Failed to approve request.');
        }

        return { success: true, message: 'Material request successfully approved!' };
    } catch (err) {
        console.error("Failed to approve request:", err);
        return { success: false, error: "Failed to approve request." };
    }
};

export const rejectRequest = async (requestId) => {
    try {

        const response = await fetch(`${API_URL}/admin-request/${requestId}/reject`, {
            method: 'PUT',
        });

        if (!response.ok) {
            throw new Error('Failed to reject request.');
        }

        return { success: true, message: 'Material request successfully rejected!' };
    } catch (err) {
        console.error("Failed to reject request:", err);
        return { success: false, error: "Failed to reject request." };
    }
};




export const submitRequest = async (selectedProject, urgency, notes, selectedMaterials) => {
  try {

const requestBody = {
  selectedProject: selectedProject, // 👈 use selectedProject
  urgency,
  notes,
  selectedMaterials: selectedMaterials.map(m => ({
    resource_id: m.item_id || m.resource_id, // make sure the key matches backend
    request_quantity: m.request_quantity
  }))
};



        console.log("Submitting request:", requestBody);

    const response = await fetch(`${API_URL}/request-materials/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Failed to submit request. Please try again.' };
      }
      return { success: false, error: errorData.error || 'Failed to submit request.' };
    }

    return { success: true, message: 'Request submitted successfully!' };
  } catch (err) {
    console.error('Error submitting request:', err);
    return { success: false, error: 'Failed to submit request. Please try again.' };
  }
};





