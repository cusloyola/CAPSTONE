import { API_URL } from "./api";


export const fetchHistory = async () => {
    try {
        const response = await fetch(`${API_URL}/resources/request-materials/history`);
        if (!response.ok) {
            throw new Error("Failed to fetch history");
        }
        const data = await response.json();

        const updatedRequests = Array.isArray(data)
            ? data.map(r => {
                let parsedItems = [];
                try {
                    if (r.items && typeof r.items === "string") {
                        parsedItems = JSON.parse(r.items);
                    } else if (Array.isArray(r.items)) {
                        parsedItems = r.items;
                    }
                } catch (e) {
                    console.error("Failed to parse items for request ID:", r.request_id, e);
                    parsedItems = [];
                }

                return {
                    ...r,
                    items: parsedItems,
                    status:
                        r.is_approved === 1
                            ? "approved"
                            : r.is_approved === 2
                                ? "rejected"
                                : "pending",
                };
            })
            : [];

        return { success: true, data: updatedRequests };
    } catch (error) {
        console.error("Failed to fetch material requests.", error);
        // Return a structured error object
        return { success: false, error: "Failed to fetch material requests." };
    }
};


export const approveRequest = async (requestId) => {
    try {
        const response = await fetch(`${API_URL}/resources/request-materials/${requestId}/approve`, {
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

        const response = await fetch(`${API_URL}/resources/request-materials/${requestId}/reject`, {
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





