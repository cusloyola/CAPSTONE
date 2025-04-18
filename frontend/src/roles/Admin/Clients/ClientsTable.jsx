import React, { useEffect, useState, useMemo } from "react";
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

  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      Object.values(client).some((value) =>
        value?.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, clients]);

  const totalPages = Math.ceil(filteredClients.length / entriesPerPage);
  const startIdx = (currentPage - 1) * entriesPerPage;
  const currentClients = filteredClients.slice(startIdx, startIdx + entriesPerPage);

  const handlePrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="entries" className="text-sm text-gray-700">Show</label>
          <select
            id="entries"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className="text-sm text-gray-700">entries</span>
        </div>

        <div className="flex justify-between items-center gap-4 mb-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 rounded px-3 py-1 text-sm h-10 w-full max-w-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          {/* Create Client Button */}
          <Button
            onClick={() => {
              setSelectedClient(null);
              setEditMode(false);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-6 h-10 min-w-[100px] rounded hover:bg-blue-700 flex items-center justify-center"
          >
            Create
          </Button>
        </div>


      </div>

      <table className="table-auto w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {/* <th className="border px-4 py-2 text-left">Client ID</th> */}
            <th className="border px-4 py-2 text-left">Client Name</th>
            <th className="border px-4 py-2 text-left">Email</th>
            <th className="border px-4 py-2 text-left">Phone Number</th>
            <th className="border px-4 py-2 text-left">Website</th>
            <th className="border px-4 py-2 text-left">Industry</th>
            <th className="border px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentClients.length > 0 ? currentClients.map((client) => (
            <tr key={client.client_id}>
              {/* <td className="border px-4 py-2">{client.client_id}</td> */}
              <td className="border px-4 py-2">{client.client_name}</td>
              <td className="border px-4 py-2">{client.email}</td>
              <td className="border px-4 py-2">{client.phone_number}</td>
              <td className="border px-4 py-2">{client.website}</td>
              <td className="border px-4 py-2">{client.industry}</td>
              <td className="border px-4 py-2">
                <div className="flex gap-x-2">
                  <button
                    onClick={() => handleViewClick(client)}
                    className="bg-blue-600 text-white px-6 h-10 min-w-[50px] rounded hover:bg-blue-700 flex items-center justify-center"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditClick(client)}
                    className="bg-yellow-500 text-white px-6 h-10 min-w-[50px] rounded hover:bg-yellow-700 flex items-center justify-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(client.client_id)}
                    className="bg-red-600 text-white px-6 h-10 min-w-[50px] rounded hover:bg-red-700 flex items-center justify-center"
                  >
                    Delete
                  </button>
                </div>

              </td>
            </tr>
          )) : (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan="7">No results found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
        <p>
          Showing {startIdx + 1} to {Math.min(startIdx + entriesPerPage, filteredClients.length)} of {filteredClients.length} entries
        </p>

        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
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
