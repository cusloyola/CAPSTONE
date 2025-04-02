import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminReports = () => {
  const [lowestStocksData, setLowestStocksData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [outOfStock, setOutOfStock] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const lowestStocksResponse = await axios.get(
          "http://localhost:5000/api/reports/lowest-stocks"
        );
        setLowestStocksData(lowestStocksResponse.data);

        const totalItemsResponse = await axios.get(
          "http://localhost:5000/api/reports/total-items"
        );
        setTotalItems(totalItemsResponse.data.totalItems);

        const totalStockResponse = await axios.get(
          "http://localhost:5000/api/reports/total-stock"
        );
        setTotalStock(totalStockResponse.data.totalStock);

        const outOfStockResponse = await axios.get(
          "http://localhost:5000/api/reports/out-of-stock"
        );
        setOutOfStock(outOfStockResponse.data.outOfStockCount);

        const totalCategoriesResponse = await axios.get(
          "http://localhost:5000/api/reports/total-categories"
        );
        setTotalCategories(totalCategoriesResponse.data.totalCategories);
      } catch (err) {
        setError("Failed to fetch data. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const projectProgressData = [
    { project_name: "Manila Bridge", progress: 60 },
    { project_name: "Cebu Building", progress: 80 },
    { project_name: "Davao Road", progress: 30 },
  ];

  const projectCompletionData = [
    { project_name: "Manila Bridge", completion_percentage: 95 },
    { project_name: "Cebu Building", completion_percentage: 70 },
    { project_name: "Davao Road", completion_percentage: 40 },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a83280"];

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Admin Reports & Analytics</h1>

      {/* Inventory Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Inventory Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-lg font-medium">Total Items: {totalItems}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-lg font-medium">Total Stock: {totalStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-lg font-medium">Out of Stock: {outOfStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-lg font-medium">Total Categories: {totalCategories}</p>
          </div>
        </div>
      </div>

      {/* Charts in Two Rows of Two */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lowest Stock Items Bar Chart Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Lowest Stock Items</h2>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <BarChart width={600} height={300} data={lowestStocksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="item_name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock_quantity" fill="#8884d8" />
            </BarChart>
          </div>
        </div>

        {/* Project Progress Pie Chart Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Project Progress</h2>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <PieChart width={400} height={300}>
              <Pie
                data={projectProgressData}
                dataKey="progress"
                nameKey="project_name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {projectProgressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </div>
        </div>

        {/* Project Completion Bar Chart Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Project Completion</h2>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <BarChart width={600} height={300} data={projectCompletionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completion_percentage" fill="#82ca9d" />
            </BarChart>
          </div>
        </div>

        {/* Empty Card (Placeholder) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* You can put additional content here or leave it empty */}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;