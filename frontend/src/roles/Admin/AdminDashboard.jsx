import React from "react";
import EcommerceMetrics from '../../components/ecommerce/EcommerceMetrics';
import AdminOverviewMetrics from "./AdminOverviewMetrics";
import BarChartOne from "../../components/charts/bar/BarChartOne";

const Dashboard = () => {
  // If you need this again, you can uncomment and use it later
  // const { user } = useUser(); 
  // const [data, setData] = useState(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch("http://localhost:5000/api/DashboardData", {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${user?.token}`,
  //         },
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const result = await response.json();
  //       setData(result);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //       alert("An error occurred while fetching data.");
  //     }
  //   };

  //   if (user?.token) {
  //     fetchData();
  //   }
  // }, [user?.token]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
      <AdminOverviewMetrics />
      <BarChartOne />
    </div>
  );
};

export default Dashboard;
