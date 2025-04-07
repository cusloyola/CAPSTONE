import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/button/Button";

const CLIENTS_API_URL = "http://localhost:5000/api/clients"; // Clients API endpoint

export default function FilePage() {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // For navigating to folders/projects under client

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch(CLIENTS_API_URL);
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingClients(false);
    }
  };

const handleClientClick = (clientId) => {
    navigate(`/clients/${clientId}/folders`); 
  };
  

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">All Clients</h2>
        <Button onClick={() => alert("Open modal to create client")}>+ Create Client</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {loadingClients ? (
          <p>Loading clients...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          clients.map((client) => (
            <div
              key={client.client_id}
              className="bg-white p-4 rounded-lg shadow-lg cursor-pointer"
              onClick={() => handleClientClick(client.client_id)}
            >
              <h3 className="font-semibold">{client.client_name}</h3>
              <p className="text-gray-500">{client.client_email}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
