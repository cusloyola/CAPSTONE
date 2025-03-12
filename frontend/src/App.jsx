import { useState, useEffect } from "react";
import axios from "axios";

function App() {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("admin"); // ✅ Default role is valid

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get("http://localhost:5000/api/users")
            .then(response => setUsers(response.data))
            .catch(error => console.error("Error fetching users:", error));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name || !email || !role) {
            alert("All fields are required!");
            return;
        }

        axios.post(
            "http://localhost:5000/api/users",
            { name, email, role },
            { headers: { "Content-Type": "application/json" } } // ✅ Ensure correct format
        )
        .then(() => {
            setName("");
            setEmail("");
            setRole("admin"); // ✅ Reset to a valid role
            fetchUsers(); // Refresh user list
        })
        .catch(error => {
            if (error.response) {
                console.error("Error adding user:", error.response.data);
                alert(error.response.data.error); // Show error message to user
            } else {
                console.error("Unknown error:", error.message);
            }
        });
    };

    return (
        <div>
            <h1>User Management</h1>

            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="admin">Admin</option>
                    <option value="software engineer">Software Engineer</option>
                    <option value="safety engineer">Safety Engineer</option>
                </select>

                <button type="submit">Add User</button>
            </form>

            <h2>Users List</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.name} - {user.email} ({user.role})</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
