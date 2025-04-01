import React, { useState, useEffect } from 'react';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        role: '',
        password: '',
    });
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewedUser, setViewedUser] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/user-accounts');
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/user-accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });
            if (!response.ok) {
                throw new Error('Failed to add user');
            }
            setShowModal(false);
            setSuccessMessage('User added successfully!');
            setShowSuccessModal(true);
            fetchUsers();
            setNewUser({
                full_name: '',
                email: '',
                phone_number: '',
                role: '',
                password: '',
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleViewUserInfo = (user) => {
        setViewedUser(user);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewedUser(null);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/user-accounts/${userToDelete.user_id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            setIsDeleteModalOpen(false);
            setSuccessMessage('User deleted successfully!');
            setShowSuccessModal(true);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleEdit = (user) => {
        setEditUser({ ...user });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        setEditUser({ ...editUser, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/user-accounts/${editUser.user_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editUser),
            });
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            setIsEditModalOpen(false);
            setSuccessMessage('User updated successfully!');
            setShowSuccessModal(true);
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1>
                <span style={{ marginLeft: "25px", fontSize: '1.75em' }}><strong>User Management</strong></span>
            </h1>

            <br /><br /><br />
            {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

            <button
                onClick={() => setShowModal(true)}
                style={{ padding: "10px", marginLeft: "20px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
            >
                + Add User
            </button>

            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px", margin: "10px 0", marginLeft: "10px", width: "750px", borderRadius: "10px" }}
            />

            <select
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    padding: "8px",
                    margin: "10px 0",
                    marginLeft: "10px",
                    width: "590px",
                    borderRadius: "10px",
                }}
            >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Site Engineer">Site Engineer</option>
                <option value="Safety Engineer">Safety Engineer</option>
            </select>

            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "5px",
                            width: "400px",
                        }}
                    >
                        <h3>Add New User</h3>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={newUser.full_name}
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newUser.email}
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={newUser.phone_number}
                                    onChange={handleChange}
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={newUser.role}
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                >
                                    <option value="">Select Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Site Engineer">Site Engineer</option>
                                    <option value="Safety Engineer">Safety Engineer</option>
                                </select>
                            </div>
                            <div>
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newUser.password}
                                    onChange={handleChange}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <button type="submit" style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
                                    Add User</button>
                            </div>
                        </form>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                marginTop: "10px",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <h3 style={{ marginTop: '10px', marginLeft: '30px', fontSize: '1.5em' }}> <strong> User List</strong></h3>
            {loading ? (
                <p>⏳ Loading users...</p>
            ) : filteredUsers.length > 0 ? (
                <table style={{ marginTop: "20px", width: "100%", height: "600px", borderCollapse: "collapse", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", display: "block", overflowY: "auto" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#e0e0e0", textAlign: "left" }}>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "auto" }}>Full Name</th>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "auto" }}>Email</th>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "auto" }}>Phone Number</th>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "auto" }}>Role</th>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "auto" }}>Is Active</th>
                            <th style={{ padding: "12px 15px", borderBottom: "2px solid #ddd", fontWeight: "600", color: "black", width: "180px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.user_id} style={{ borderBottom: "1px solid #eee", backgroundColor: "white" }}>
                                <td style={{ padding: "12px 15px", color: "black", width: "20%", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name}</td>
                                <td style={{ padding: "12px 15px", color: "black", width: "20%", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</td>
                                <td style={{ padding: "12px 15px", color: "black", width: "15%", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.phone_number}</td>
                                <td style={{ padding: "12px 15px", color: "black", width: "15%", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.role}</td>
                                <td style={{ padding: "12px 15px", color: "black", width: "10%", textAlign: 'center' }}>{user.is_active === 1 ? 'Yes' : 'No'}</td>
                                <td style={{ padding: "12px 15px", width: "20%" }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                        <button
                                            onClick={() => handleViewUserInfo(user)}
                                            style={{
                                                width: "75px",
                                                padding: "8px 12px",
                                                backgroundColor: "#3498db",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                flex: '1',
                                                marginRight: '5px',
                                            }}
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEdit(user)}
                                            style={{
                                                width: "75px",
                                                padding: "8px 12px",
                                                backgroundColor: "#f1c40f",
                                                color: "black",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                flex: '1',
                                                marginRight: '5px',
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(user)}
                                            style={{
                                                width: "75px",
                                                padding: "8px 12px",
                                                backgroundColor: "#e74c3c",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                                flex: '1',
                                                marginRight: '5px',
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{
                    textAlign: 'center',
                    fontSize: '1.2em',
                    fontWeight: 'bold',
                    color: 'red',
                    padding: '20px',
                    margin: '20px auto',
                    width: '80%',
                    maxWidth: '600px',
                }}>
                    📭 No matching users found!
                </p>
            )}

            {isDeleteModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "8px",
                            width: "350px",
                            textAlign: "center",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <h3>Confirm Delete</h3>
                        <p style={{ marginBottom: '20px' }}>Are you sure you want to delete {userToDelete.full_name}?</p>
                        <div>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor: "#e74c3c",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginRight: "10px",
                                    fontSize: '16px',
                                }}
                            >
                                Confirm Delete
                            </button>
                            <button
                                onClick={closeDeleteModal}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor: "#3498db",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: '16px',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '300px' }}>
                        <p>{successMessage}</p>
                        <button onClick={() => setShowSuccessModal(false)} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px' }}>OK</button>
                    </div>
                </div>
            )}
            {showViewModal && viewedUser && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            width: "400px",
                            textAlign: "left",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        }}
                    >
                        <h3 style={{ marginBottom: "15px", textAlign: "center" }}>User Information</h3>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Full Name:</strong> {viewedUser.full_name}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Email:</strong> {viewedUser.email}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Phone Number:</strong> {viewedUser.phone_number}
                        </p>
                        <p style={{ marginBottom: "8px" }}>
                            <strong>Role:</strong> {viewedUser.role}
                        </p>
                        <p style={{ marginBottom: "15px" }}>
                            <strong>Is Active:</strong> {viewedUser.is_active === 1 ? 'Yes' : 'No'}
                        </p>
                        <div style={{ textAlign: "center" }}>
                            <button
                                onClick={closeViewModal}
                                style={{
                                    padding: "12px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isEditModalOpen && editUser && (
                <div
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "5px",
                            width: "400px",
                        }}
                    >
                        <h3>Edit User</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={editUser.full_name}
                                    onChange={handleEditChange}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editUser.email}
                                    onChange={handleEditChange}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={editUser.phone_number}
                                    onChange={handleEditChange}
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>
                            <div>
                                <label>Role</label>
                                <select
                                    name="role"
                                    value={editUser.role}
                                    onChange={handleEditChange}
                                    required
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                >
                                    <option value="">Select Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Site Engineer">Site Engineer</option>
                                    <option value="Safety Engineer">Safety Engineer</option>
                                </select>
                            </div>
                            <div>
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={editUser.password}
                                    onChange={handleEditChange}
                                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                                />
                            </div>

                            <div>
                                <button type="submit" style={{ padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>
                                    Update User</button>
                            </div>
                        </form>
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                marginTop: "10px",
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;