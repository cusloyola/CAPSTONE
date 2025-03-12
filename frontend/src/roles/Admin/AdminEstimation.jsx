import React, { useEffect, useState } from "react";
import api from "../../api"; // Import the global axios instance
import BOMTable from "./Estimation/BOMTable"; // Import the BOMTable component
import { useUser } from "../../context/UserContext";

const AdminEstimation = () => {
  const { user } = useUser(); // Get user data (including token)
  const [data, setData] = useState([]);

  // Fetch BOM data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/bom"); // Get BOM data from backend
        setData(response.data); // Update BOM table data
      } catch (error) {
        console.error("Error fetching BOM data:", error);
      }
    };

    if (user?.token) {
      fetchData(); // Fetch data only if token exists
    }
  }, [user?.token]);

  // Function to save updated BOM data
  const saveData = async () => {
    try {
      await api.post("/bom", { data }); // Send BOM data to backend
      alert("BOM data saved successfully!");
    } catch (error) {
      console.error("Error saving BOM data:", error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Admin Estimation</h2>
      <button onClick={saveData} className="bg-green-500 text-white p-2 mb-2 rounded">
        Save Data
      </button>
      <BOMTable data={data} setData={setData} /> {/* Pass data to BOMTable */}
    </div>
  );
};

export default AdminEstimation;
