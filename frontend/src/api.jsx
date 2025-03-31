import axios from 'axios';

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Now you can use `api` for the requests


// ✅ Automatically attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});





export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/Auth/Login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        // ✅ Store token in localStorage
        localStorage.setItem("token", data.token);
        return data;
    } catch (error) {
        console.error("❌ Login error:", error);
        throw error;
    }
};

export const getProtectedData = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) throw new Error("No token found");

        const response = await fetch(`${API_URL}/protected`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        return data;
    } catch (error) {
        console.error("❌ Protected route error:", error);
        throw error;
    }
};

export default api;
