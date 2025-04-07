import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import ClientViewModal from "../Clients/ClientViewModal"; // Import the modal

function ClientTable() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/clients", {
      method: "GET", 
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch clients");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched clients data:", data); // Log the data to inspect it
        setClients(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  

  // Handle View Modal
  const handleViewClick = (client) => {
    setSelectedClient(client); // Set the selected client data
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedClient(null); // Clear the selected client
  };

  // Handle Deleting a Client
  const handleDeleteClick = (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    fetch(`http://localhost:5000/api/clients/${clientId}`, {
      method: "DELETE",
      // No token required for now, so removing the Authorization header
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete client");
        return res.json();
      })
      .then(() => {
        setClients((prev) => prev.filter((client) => client.client_id !== clientId)); // Remove deleted client from state
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to delete the client.");
      });
  };

  // Handle Client Creation
  const handleCreateClient = (clientData) => {
    fetch("http://localhost:5000/api/clients/create", {
      method: "POST", // Sending a POST request to create a new client
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clientData), // Sending client data in the request body
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create client");
        return res.json();
      })
      .then((data) => {
        // Optionally handle success
        console.log("Client created:", data);
        setClients((prev) => [...prev, data]); // Add the new client to the state
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to create the client.");
      });
  };

  // Loading or Error Handling
  if (loading) {
    return <div>Loading...</div>; // Display loading message
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Client ID
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Client Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Phone Number
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Website
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Industry
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {clients.map((client) => (
                <TableRow key={client.client_id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    {client.client_id}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {client.client_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {client.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {client.phone_number}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {client.website}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {client.industry}
                  </TableCell>
                  {/* Actions Cell with View and Delete buttons */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start">
                    <button
                      onClick={() => handleViewClick(client)}
                      className="px-4 py-2 mr-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteClick(client.client_id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ClientViewModal
          isOpen={isModalOpen}
          client={selectedClient}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default ClientTable;
