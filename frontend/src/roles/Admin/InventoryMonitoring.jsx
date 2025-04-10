import React, { useState, useEffect } from "react";
import axios from "axios";
import FastMovingItems from "./FastMovingItems";
import { FaBoxOpen, FaExclamationTriangle, FaTag, FaSortAmountDown } from 'react-icons/fa'; // Import more icons

const LowStockInventory = () => {
  const [lowestStocks, setLowestStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0); // Add totalCategories state

  const cardRadiusClass = "rounded-2xl"; // Define the radius class

  useEffect(() => {
    const fetchInventoryData = async () => {
      setLoading(true);
      setError(null);

      try {
        const lowestStocksResponse = await axios.get(
          "http://localhost:5000/api/inventory-information/lowest-stocks"
        );
        setLowestStocks(lowestStocksResponse.data);

        const totalItemsResponse = await axios.get(
          "http://localhost:5000/api/inventory-information/total-items"
        );
        setTotalItems(totalItemsResponse.data.totalItems);

        const totalStockResponse = await axios.get(
          "http://localhost:5000/api/inventory-information/total-stock"
        );
        setTotalStock(totalStockResponse.data.totalStock);

        const outOfStockResponse = await axios.get(
          "http://localhost:5000/api/inventory-information/out-of-stock"
        );
        setOutOfStockCount(outOfStockResponse.data.outOfStockCount);

        const totalCategoriesResponse = await axios.get(
          "http://localhost:5000/api/inventory-information/total-categories"
        );
        setTotalCategories(totalCategoriesResponse.data.totalCategories);

      } catch (err) {
        console.error("[LowStockInventory] Error fetching data:", err);
        setError("Failed to fetch inventory data. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  const inventoryInfoCard = (
    <div
    className={`bg-white ${cardRadiusClass} shadow-md p-6`}
    style={{ width: '710px' }} // Specify width here
  >
      <h2 className="text-xl font-semibold mb-4 text-black-800 flex items-center">
        <FaBoxOpen className="mr-2" /> Inventory Info
      </h2>
      <p className="text-base font-medium text-black-600">
        <strong>Company:</strong> Global Logistics Inc.
      </p><br></br>
      <p className="text-base font-medium text-black-600">
        <strong>Contact:</strong> Mr. Robert Reyes
      </p><br></br>
      <p className="text-base font-medium text-black-600">
        <strong>Email:</strong> robert.reyes@globallogistics.com
      </p><br></br>
      <p className="text-base font-medium text-black-600">
        <strong>Location:</strong> Valenzuela City, PH
      </p><br></br>
    </div>
  );

  const lowestStockItemsCard = (
    <div className={`bg-white ${cardRadiusClass} shadow-md p-6 max-h-80 overflow-y-auto`}
    style={{ width: 'auto' }} > {/* Set width to auto to allow flex to control */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <FaExclamationTriangle className="mr-2 text-red-500" /> Depleted Items
      </h2>
      {lowestStocks.map((item) => (
        <div key={item.item_id}>
          <p className="font-semibold text-lg text-gray-900">
            {item.item_name}
          </p>
          <p className="text-base font-medium text-[#FF0000]">
            Stocks: {item.stock_quantity === 0 ? "Depleted" : item.stock_quantity}
          </p>
          {item.item_id !== lowestStocks[lowestStocks.length - 1]?.item_id && (
            <hr className="my-2 border-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
  

  if (loading) {
    return (
      <div className="p-6 flex flex-wrap -mx-4">
        <div className="w-full md:w-1/2 lg:w-1/3 px-4 mb-4">{inventoryInfoCard}</div>
        <div className="w-full md:w-1/2 lg:w-2/3 px-4 mb-4">
          <p>Loading lowest stock items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-wrap -mx-4">
        <div className="w-full md:w-1/2 lg:w-1/3 px-4 mb-4">{inventoryInfoCard}</div>
        <div className="w-full md:w-1/2 lg:w-2/3 px-4 mb-4">
          <p>Error loading depleted items.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 flex flex-wrap -mx-4 mb-1"> {/* Changed mb-4 to mb-2 */}
        {/* Top Row of Cards */}
        <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/4 px-4 mb-4">
          <div className={`bg-white ${cardRadiusClass} shadow-md p-6 flex items-center`}>
            <FaBoxOpen className="text-xl mr-4 text-blue-500" />
            <div>
              <p className="text-xl font-semibold text-gray-800">{totalItems}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/4 px-4 mb-1">
          <div className={`bg-white ${cardRadiusClass} shadow-md p-6 flex items-center`}>
            <FaTag className="text-xl mr-4 text-green-500" />
            <div>
              <p className="text-xl font-semibold text-gray-800">{totalCategories}</p>
              <p className="text-sm text-gray-600">Total Categories</p>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/4 px-4 mb-1">
          <div className={`bg-white ${cardRadiusClass} shadow-md p-6 flex items-center`}>
            <FaExclamationTriangle className="text-xl mr-4 text-red-500" />
            <div>
              <p className="text-xl font-semibold text-gray-800">{outOfStockCount}</p>
              <p className="text-sm text-gray-600">Items Out of Stock</p>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/4 px-4 mb-1">
          <div className={`bg-white ${cardRadiusClass} shadow-md p-6 flex items-center`}>
            <FaSortAmountDown className="text-xl mr-4 text-yellow-500" />
            <div>
              <p className="text-xl font-semibold text-gray-800">{totalStock}</p>
              <p className="text-sm text-gray-600">Total Number of Stocks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row with Depleted Items on the Left and Inventory Info on the Right */}
      <div className="p-6 flex flex-wrap -mx-4">
        <div className="w-full md:w-1/2 lg:w-1/2 px-4 mb-4">
          {inventoryInfoCard}
        </div>
        <div className="w-full md:w-1/2 lg:w-1/2 px-4 mb-4">
          {lowestStockItemsCard}
        </div>
      </div>

      <FastMovingItems />
    </>
  );
};

export default LowStockInventory;