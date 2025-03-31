import React, { useState, useEffect } from "react";
import axios from "axios";

const LowStockInventory = () => {
  const [lowestStocks, setLowestStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0); // Add totalCategories state

  useEffect(() => {
    const fetchLowestStocks = async () => {
      setLoading(true);
      setError(null);
      console.log(
        "[LowStockInventory] Fetching lowest stocks from: http://localhost:5000/api/inventory-information/lowest-stocks"
      );

      try {
        const response = await axios.get(
          "http://localhost:5000/api/inventory-information/lowest-stocks"
        );
        console.log(
          "[LowStockInventory] Fetched lowest stocks successfully:",
          response.data
        );
        setLowestStocks(response.data);
        console.log(
          "[LowStockInventory] Lowest stocks state updated:",
          response.data
        );

        // Fetch total items count
        const totalItemsResponse = await axios.get(
          "http://localhost:5000/api/inventory-information/total-items"
        );
        setTotalItems(totalItemsResponse.data.totalItems);
        console.log(
          "[LowStockInventory] Total items count fetched:",
          totalItemsResponse.data.totalItems
        );

        // Fetch total stock quantity
        const totalStockResponse = await axios.get(
          "http://localhost:5000/api/inventory-information/total-stock"
        );
        setTotalStock(totalStockResponse.data.totalStock);
        console.log(
          "[LowStockInventory] Total stock quantity fetched:",
          totalStockResponse.data.totalStock
        );

        // Fetch out of stock count
        const outOfStockResponse = await axios.get(
          "http://localhost:5000/api/inventory-information/out-of-stock"
        );
        setOutOfStockCount(outOfStockResponse.data.outOfStockCount);
        console.log(
          "[LowStockInventory] Out of stock count fetched:",
          outOfStockResponse.data.outOfStockCount
        );

        // Fetch total categories count
        const totalCategoriesResponse = await axios.get(
          "http://localhost:5000/api/inventory-information/total-categories"
        );
        setTotalCategories(totalCategoriesResponse.data.totalCategories);
        console.log(
          "[LowStockInventory] Total categories count fetched:",
          totalCategoriesResponse.data.totalCategories
        );
      } catch (err) {
        console.error("[LowStockInventory] Error fetching lowest stocks:", err);
        if (axios.isAxiosError(err)) {
          console.error(
            "[LowStockInventory] Axios error details:",
            err.response ? err.response.data : err.message
          );
        }
        setError("Failed to fetch lowest stocks. Try again later.");
      } finally {
        setLoading(false);
        console.log("[LowStockInventory] Fetch operation completed.");
      }
    };

    fetchLowestStocks();
  }, []);

  const inventoryInfo = (
    <div
      className="bg-white rounded-2xl shadow-md p-6 max-h-80 overflow-y-auto w-full mr-4"
      style={{ maxWidth: "1000px" }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-black-800 border-b pb-4">
        Inventory Information
      </h2>
      <div className="flex flex-wrap -mx-4">
        <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
          <strong>Total Items:</strong> {totalItems}
        </p>
        <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
          <strong>Company:</strong> Global Logistics Inc.
        </p>
        <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
          <strong>Total Categories:</strong> {totalCategories}
        </p>
        <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
          <strong>Contact Person:</strong> Mr. Robert Reyes
        </p>
        <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
          <strong>Items Out of Stock:</strong> {outOfStockCount}
        </p>
        <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
          <strong>Email:</strong> robert.reyes@globallogistics.com
        </p>
        <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
          <strong>Total Number of Stocks:</strong> {totalStock}
        </p>
        <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
          <strong>Warehouse Location:</strong> Valenzuela City, Philippines
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 flex">
        {inventoryInfo}
        <p>Loading lowest stock items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex">
        {inventoryInfo}
        <p>Error: {error}</p>
      </div>
    );
  }

  if (lowestStocks.length === 0) {
    return (
      <div className="p-6 flex">
        {inventoryInfo}
        <div className="bg-white rounded-2xl shadow-md p-6 max-h-80 overflow-y-auto w-full">
          <p>No depleted items to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex">
      {inventoryInfo}
      <div className="bg-white rounded-2xl shadow-md p-6 max-h-80 overflow-y-auto w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-4">
          Lowest Stock Items
        </h2>
        {lowestStocks.map((item) => (
          <div key={item.item_id}>
            <p className="font-semibold text-lg text-gray-900">
              {item.item_name}
            </p>
            <p className="text-base font-medium text-red-600">
              Total Stocks: {item.stock_quantity === 0 ? "Depleted" : item.stock_quantity}
            </p>
            {item.item_id !== lowestStocks[lowestStocks.length - 1]?.item_id && (
              <hr className="my-4 border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockInventory;