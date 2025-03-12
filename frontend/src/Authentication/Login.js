import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !password) {
      setMessage('Username and Password are required.');
      return;
    }
  
    const loginData = { Username: username, Password: password };
  
    try {
      const response = await fetch('http://localhost:5000/api/Test/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
  
      const result = await response.json();
      console.log('Response from server:', result);  // Log the response to check if role is included
  
      if (response.ok) {
        setMessage(result.message);  // Show success message
  
        const userRole = result.role;  // This should now contain the role from the backend
        console.log('User role:', userRole);  // Check the role in the console
  
        // Redirect based on the user role
        if (userRole === 'Site Engineer') {
          navigate('/SiteEngineerDashboard');  // Redirect to Site Engineer Dashboard
        } else if (userRole === 'Safety Engineer') {
          navigate('/SafetyDashboard');  // Redirect to Safety Engineer Dashboard
        } else if (userRole === 'Admin') {
          navigate('/AdminDashboard');  // Redirect to Admin Dashboard
        } else {
          // Optional: Handle case for undefined roles
          setMessage('Role is undefined or unrecognized.');
        }
      } else {
        setMessage(result.message);  // Show error message
      }
    } catch (error) {
      setMessage('An error occurred while logging in.');
    }
  };
  
  
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
