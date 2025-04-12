import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/button/Button";

const CLIENTS_API_URL = "http://localhost:5000/api/clients";

export default function FilePage() {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        <h2 className="text-xl font-semibold">Client Files</h2>
        <Button onClick={() => alert("Open modal to create client")}>+ Create Client</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loadingClients ? (
          <p>Loading clients...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          clients.map((client) => (
            <div
              key={client.client_id}
              className="bg-white p-4 rounded-lg shadow-lg flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => handleClientClick(client.client_id)}
            >
              <div className="text-2xl">📁</div>
              <div>
                <h3 className="font-semibold text-lg">{client.client_name}</h3>
                <p className="text-sm text-gray-600">CloudConstruct</p>
                <p className="text-sm text-gray-500">{client.client_email}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
