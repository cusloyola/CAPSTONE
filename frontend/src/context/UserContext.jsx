import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();




export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve the user from localStorage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        // Only parse if it's a valid string
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
        setUser(null); // If parsing fails, set user as null
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Persist the user data
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // Clear user data
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
