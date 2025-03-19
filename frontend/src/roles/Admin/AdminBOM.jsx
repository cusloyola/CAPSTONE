import React, { useEffect, useState } from "react";
import { loginUser, getProtectedData } from "../../api"; // ✅ Correct way for named exports
import BOMTable from "./Estimation/BOMTable"; // Import the BOMTable component
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const AdminBOM = () => {
  const { user } = useUser(); // Get user data (including token)
  const [data, setData] = useState([]); // ✅ Restore state
  const navigate = useNavigate();

  // Redirect unauthorized users
  useEffect(() => {
    if (!user || user.role.toLowerCase() !== "admin") {
      navigate("/unauthorized"); // Redirect if not an admin
    }
  }, [user, navigate]);

  // Fetch BOM data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/bom", {
          headers: {
            Authorization: `Bearer ${user?.token}`, // 🔒 Include JWT token
          },
        });
        setData(response.data);
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
      await api.post("/bom", { data }, {
        headers: {
          Authorization: `Bearer ${user?.token}`, // 🔒 Include JWT token
        },
      });
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
      <BOMTable data={data} setData={setData} /> {/* ✅ Now it has `data` and `setData` */}
    </div>
  );
};

export default AdminBOM; // ✅ Ensure default export
