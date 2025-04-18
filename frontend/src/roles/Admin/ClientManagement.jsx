import React from 'react';
import ClientTable from '../Admin/Clients/ClientsTable'; 

const ClientManagement = () => {
  return (
    <div>
<h1 style={{ fontSize: '20px', fontWeight: '500' }}>Client Management</h1>
<ClientTable />
    </div>
  );
};

export default ClientManagement;