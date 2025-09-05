import React, { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import ActionDropdownUserManagement from "./User Management/ActionDropwdownUserManagement";
import AddUserModal from "./User Management/AddUser";

// API endpoint for users
const USERS_API_URL = "http://localhost:5000/api/user-accounts";

const SuccessMessageModal = ({ isOpen, onClose, message }) => (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xs m-4" aria-modal="true" role="dialog">
        <div className="relative w-full max-w-xs overflow-y-auto rounded-2xl bg-white p-4 text-center shadow-lg">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h4 className="mt-3 text-lg font-semibold text-gray-800">Success!</h4>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
            <div className="mt-4 flex justify-center">
                <Button onClick={onClose} size="sm" variant="outline">
                    Close
                </Button>
            </div>
        </div>
    </Modal>
);

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [viewedUser, setViewedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add/Edit form state
    const [newUser, setNewUser] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        role: "",
        password: "",
    });

    // Search/filter/pagination
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const startIdx = (currentPage - 1) * entriesPerPage;
    const endIdx = startIdx + entriesPerPage;
    const visibleUsers = filteredUsers.slice(startIdx, endIdx);
    const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(USERS_API_URL);
            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = users;
        if (search) {
            filtered = filtered.filter(
                (u) =>
                    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                    u.email?.toLowerCase().includes(search.toLowerCase()) ||
                    u.phone_number?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (roleFilter) {
            filtered = filtered.filter((u) => u.role === roleFilter);
        }
        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [search, roleFilter, users]);

    // Add User
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(USERS_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });
            if (!response.ok) throw new Error("Failed to add user");
            setShowAddModal(false);
            setSuccessMessage("User added successfully!");
            fetchUsers();
            setNewUser({
                full_name: "",
                email: "",
                phone_number: "",
                role: "",
                password: "",
            });
        } catch (err) {
            setError(err.message);
        }
    };

    // Edit User
    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${USERS_API_URL}/${userToEdit.user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userToEdit),
            });
            if (!response.ok) throw new Error("Failed to update user");
            setShowEditModal(false);
            setSuccessMessage("User updated successfully!");
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // Delete User
    const confirmDelete = async () => {
        try {
            const response = await fetch(`${USERS_API_URL}/${userToDelete.user_id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete user");
            setShowDeleteModal(false);
            setSuccessMessage("User deleted successfully!");
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // Pagination handlers
    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };
    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <div className="p-4 space-y-6 bg-white shadow rounded">
            <div className="bg-blue-600 text-white flex justify-between items-center p-4 rounded">
                <h1 className="text-lg font-semibold">List of All Users</h1>
                <button
                    className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100"
                    onClick={() => setShowAddModal(true)}
                >
                    Add New User
                </button>
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-2">
                    <label className="block font-medium text-gray-700">Role:</label>
                    <select
                        className="border p-2 rounded w-48"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Site Engineer">Site Engineer</option>
                        <option value="Safety Engineer">Safety Engineer</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                <div>
                    <label className="text-sm">
                        Show
                        <select
                            className="mx-2 border p-1 pr-8 rounded appearance-none"
                            value={entriesPerPage}
                            onChange={(e) => {
                                setEntriesPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={1}>1</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        entries
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <label className="block font-medium text-gray-700">Search:</label>
                    <input
                        id="searchInput"
                        type="text"
                        className="border p-2 rounded w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by Name, Email, Phone"
                    />
                </div>
            </div>
            {loading ? (
                <p>⏳ Loading users...</p>
            ) : (
                <table className="table-auto w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-4 py-2 text-center">Full Name</th>
                            <th className="border px-4 py-2 text-center">Email</th>
                            <th className="border px-4 py-2 text-center">Phone Number</th>
                            <th className="border px-4 py-2 text-center">Role</th>
                            <th className="border px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleUsers.length > 0 ? (
                            visibleUsers.map((user) => (
                                <tr key={user.user_id}>
                                    <td className="border px-4 py-2">{user.full_name}</td>
                                    <td className="border px-4 py-2">{user.email}</td>
                                    <td className="border px-4 py-2">{user.phone_number}</td>
                                    <td className="border px-4 py-2">{user.role}</td>
                                    <td className="border px-4 py-2 text-center">
                                        <ActionDropdownUserManagement
                                            onEdit={() => {
                                                setUserToEdit({ ...user });
                                                setShowEditModal(true);
                                            }}
                                            onDelete={() => {
                                                setUserToDelete(user);
                                                setShowDeleteModal(true);
                                            }}
                                            onCopy={() => {}}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center border px-4 py-2">
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm">
                <p>
                    Showing {startIdx + 1} to {Math.min(endIdx, filteredUsers.length)} of {filteredUsers.length} entries
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
            {/* Add User Modal */}
            {showAddModal && (
                <AddUserModal
                    onClose={() => setShowAddModal(false)}
                    onUserAdded={() => fetchUsers()}
                />
            )}
            {/* Edit User Modal */}
            {showEditModal && userToEdit && (
                <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} className="max-w-xs m-4" aria-modal="true" role="dialog">
                    <div className="relative w-full max-w-xs overflow-y-auto rounded-2xl bg-white p-4 text-center shadow-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Edit User</h3>
                        <form onSubmit={handleEditUser}>
                            <div>
                                <Label>Full Name</Label>
                                <Input type="text" name="full_name" value={userToEdit.full_name} onChange={e => setUserToEdit({ ...userToEdit, full_name: e.target.value })} required />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input type="email" name="email" value={userToEdit.email} onChange={e => setUserToEdit({ ...userToEdit, email: e.target.value })} required />
                            </div>
                            <div>
                                <Label>Phone Number</Label>
                                <Input type="text" name="phone_number" value={userToEdit.phone_number} onChange={e => setUserToEdit({ ...userToEdit, phone_number: e.target.value })} />
                            </div>
                            <div>
                                <Label>Role</Label>
                                <select name="role" value={userToEdit.role} onChange={e => setUserToEdit({ ...userToEdit, role: e.target.value })} required className="w-full border p-2 rounded">
                                    <option value="">Select Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Site Engineer">Site Engineer</option>
                                    <option value="Safety Engineer">Safety Engineer</option>
                                </select>
                            </div>
                            <div>
                                <Label>Password</Label>
                                <Input type="password" name="password" value={userToEdit.password || ""} onChange={e => setUserToEdit({ ...userToEdit, password: e.target.value })} />
                            </div>
                            <div className="mt-4 flex justify-center">
                                <Button type="submit" size="sm" variant="primary">Update User</Button>
                            </div>
                        </form>
                        <Button onClick={() => setShowEditModal(false)} size="sm" variant="outline" className="mt-2">Close</Button>
                    </div>
                </Modal>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="max-w-xs m-4" aria-modal="true" role="dialog">
                    <div className="relative w-full max-w-xs overflow-y-auto rounded-2xl bg-white p-4 text-center shadow-lg">
                        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        <h4 className="mt-3 text-lg font-semibold text-gray-800">Are you sure?</h4>
                        <p className="mt-2 text-sm text-gray-600">
                            Do you want to delete <b>{userToDelete.full_name}</b>?
                        </p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button onClick={() => setShowDeleteModal(false)} size="sm" variant="outline">
                                Cancel
                            </Button>
                            <Button onClick={confirmDelete} size="sm" variant="destructive">
                                Delete
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
            {/* View User Modal */}
            {showViewModal && viewedUser && (
                <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} className="max-w-xs m-4" aria-modal="true" role="dialog">
                    <div className="relative w-full max-w-xs overflow-y-auto rounded-2xl bg-white p-4 text-left shadow-lg">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800 text-center">User Information</h3>
                        <p><strong>Full Name:</strong> {viewedUser.full_name}</p>
                        <p><strong>Email:</strong> {viewedUser.email}</p>
                        <p><strong>Phone Number:</strong> {viewedUser.phone_number}</p>
                        <p><strong>Role:</strong> {viewedUser.role}</p>
                        <p><strong>Is Active:</strong> {viewedUser.is_active === 1 ? "Yes" : "No"}</p>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={() => setShowViewModal(false)} size="sm" variant="outline">
                                OK
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
            <SuccessMessageModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                message={successMessage}
            />
        </div>
        </div>
    );
};

export default UserManagement;