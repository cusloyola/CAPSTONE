import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";

const Dashboard = () => {
  const { user } = useUser(); // Get user data (including token)
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/DashboardData", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`, // Include token for authentication
          },
        });

        const result = await response.json();
        setData(result); // Store fetched data in state
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (user?.token) {
      fetchData(); // Fetch data only if token exists
    }
  }, [user?.token]);

  return (
    <div>
      <h2>Dashboard</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
};

export default Dashboard;
