import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBolt, FaClock } from 'react-icons/fa'; // Import icons

function FastMovingItems() {
  const [fastMovingItems, setFastMovingItems] = useState([]);
  const [slowMovingItems, setSlowMovingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItemsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fastResponse = await axios.get('http://localhost:5000/api/inventory-information/fast-moving-items');
        console.log("[FastMovingItems] Fetched fast-moving items:", fastResponse.data);
        setFastMovingItems(fastResponse.data);

        const slowResponse = await axios.get('http://localhost:5000/api/inventory-information/slow-moving-items');
        console.log("[FastMovingItems] Fetched slow-moving items:", slowResponse.data);
        setSlowMovingItems(slowResponse.data);
      } catch (err) {
        console.error("[FastMovingItems] Error fetching items:", err);
        if (axios.isAxiosError(err)) {
          console.error("[FastMovingItems] Axios error details:", err.response ? err.response.data : err.message);
        }
        setError("Failed to fetch items data. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchItemsData();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading items data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading items data: {error}</div>;
  }
  return (
        <div className="flex flex-wrap -mx-2"> {/* Reduced -mx-4 to -mx-2 */}
          {/* Fast Moving Items Card */}
          <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0 ml-6" style={{ maxWidth: '725px' }}> {/* Reduced px-4 to px-2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center">
                <FaBolt className="mr-2" /> Top 5 Fast Moving Items
              </h2>
              {fastMovingItems.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {fastMovingItems.map(item => (
                    <li key={item.item_id} className="py-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{item.item_name}</span>
                      <span className="text-indigo-700 text-sm">Total Quantity Approved: {item.total_requested_quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No fast-moving items data available.</p>
              )}
            </div>
          </div>
    
          {/* Slow Moving Items Card */}
       <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0 ml-2" style={{ maxWidth: '725px' }}> {/* Reduced px-4 to px-2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#007bff] flex items-center">
                <FaClock className="mr-2" /> Top 5 Slow Moving Items
              </h2>
              {slowMovingItems.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {slowMovingItems.map(item => (
                    <li key={item.item_id} className="py-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{item.item_name}</span>
                      <span className="text-[#007bff] text-sm">Total Quantity Approved: {item.total_requested_quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 italic">No slow-moving items data available.</p>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    export default FastMovingItems;