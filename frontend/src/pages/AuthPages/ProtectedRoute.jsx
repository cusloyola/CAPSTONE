// src/pages/AuthPages/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser(); // Get the user from context

  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if no user
  }

  return children;
};

export default ProtectedRoute;
