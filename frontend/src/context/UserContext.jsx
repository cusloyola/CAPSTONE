import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        return jwtDecode(token);
      } catch (error) {
        console.error("Invalid token on load:", error);
        localStorage.removeItem("token");
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
      } catch (error) {
        console.error("Error decoding token:", error);
        setUser(null);
      }
    }
  }, []);

  const login = (token) => {
    try {
      localStorage.setItem("token", token);
      setUser(jwtDecode(token));
    } catch (error) {
      console.error("Error decoding token on login:", error);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
