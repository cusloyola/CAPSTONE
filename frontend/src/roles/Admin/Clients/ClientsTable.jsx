import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";

import ClientViewModal from "../Clients/ClientViewModal";

function ClientTable() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editMode, setEditMode] = useState(false); // create vs edit mode

  useEffect(() => {
    fetch("http://localhost:5000/api/clients")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch clients");
        return res.json();
      })
      .then((data) => {
        setClients(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleViewClick = (client) => {
    setSelectedClient(client);
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setEditMode(false);
  };

  const handleDeleteClick = (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    fetch(`http://localhost:5000/api/clients/${clientId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete client");
        return res.json();
      })
      .then(() => {
        setClients((prev) => prev.filter((client) => client.client_id !== clientId));
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to delete the client.");
      });
  };

  const handleCreateClient = (clientData) => {
    fetch("http://localhost:5000/api/clients", { // Changed URL here
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to create client");
      return res.json();
    })
    .then((data) => {
      setClients((prev) => [...prev, data]);
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to create the client.");
    });
  };

  const handleUpdateClient = (clientData) => {
    fetch(`http://localhost:5000/api/clients/${clientData.client_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update client");
        return res.json();
      })
      .then((updatedClient) => {
        setClients((prev) =>
          prev.map((client) =>
            client.client_id === updatedClient.client_id ? updatedClient : client
          )
        );
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to update the client.");
      });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedClient(null);
            setEditMode(false);
            setIsModalOpen(true);
          }}
        >
          + Create Client
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Client ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Client Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone Number</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Website</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Industry</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {clients.map((client) => (
                  <TableRow key={client.client_id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">{client.client_id}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{client.client_name}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{client.email}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{client.phone_number}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{client.website}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">{client.industry}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start">
                      <Button
                        onClick={() => handleViewClick(client)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                      >
                        View
                      </ Button>
                      <Button
                        onClick={() => handleEditClick(client)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(client.client_id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ClientViewModal
          isOpen={isModalOpen}
          client={selectedClient}
          onClose={handleCloseModal}
          onSubmit={editMode ? handleUpdateClient : handleCreateClient}
          isEdit={editMode}
        />
      )}
    </div>
  );
}

export default ClientTable;
