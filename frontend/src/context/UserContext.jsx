import { createContext, useContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🔍 Initial Decoded Token:", decoded);
        return decoded;
      } catch (error) {
        console.error("❌ Invalid token on load:", error);
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
        console.log("🔍 Decoded Token in useEffect:", decodedUser);
        setUser(decodedUser);
      } catch (error) {
        console.error("❌ Error decoding token:", error);
        setUser(null);
      }
    }
  }, []);
  const login = (token) => {
    try {
      // Store token and user_id in localStorage
      localStorage.setItem("token", token);
      
      // Decode the token to get user_id
      const decoded = jwtDecode(token);
      console.log("🔍 Decoded Token on Login:", decoded);
  
      // Store user_id in localStorage as well
      localStorage.setItem("user_id", decoded.userId); // Store user_id separately
  
      setUser(decoded); // Save the decoded user data in the state
    } catch (error) {
      console.error("❌ Error decoding token on login:", error);
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
