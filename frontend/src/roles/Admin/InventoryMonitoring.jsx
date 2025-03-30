import React from "react";

const LowStockInventory = () => {
  const sampleItems = [
    { item_id: 1, item_name: "Screws", stock_quantity: 10 },
    { item_id: 2, item_name: "Nuts", stock_quantity: 5 },
    { item_id: 3, item_name: "Bolts", stock_quantity: 8 },
    { item_id: 4, item_name: "Washers", stock_quantity: 0 },
    { item_id: 5, item_name: "Hammers", stock_quantity: 2 },
    { item_id: 6, item_name: "Pipes", stock_quantity: 1 },
    { item_id: 7, item_name: "Wires", stock_quantity: 15 },
    { item_id: 8, item: "Bricks", stock_quantity: 0 },
    { item_id: 9, item_name: "Cement", stock_quantity: 3 },
    { item_id: 10, item_name: "Tiles", stock_quantity: 7 },
    { item_id: 11, item_name: "Another Item", stock_quantity: 2 },
    { item_id: 12, item_name: "Yet Another Item", stock_quantity: 0 },
    { item_id: 13, item_name: "And Another", stock_quantity: 11 },
    { item_id: 14, item_name: "Last One", stock_quantity: 1 },
  ];

  const sortedItems = sampleItems
    .sort((a, b) => a.stock_quantity - b.stock_quantity)
    .slice(0, 5);

  const warehouseLocation = "Valenzuela City, Philippines";

  return (
    <div className="p-6 flex">
  <div
  className="bg-white rounded-2xl shadow-md p-6 max-h-80 overflow-y-auto w-full mr-4"
  style={{ maxWidth: '1000px' }}
>
  <h2 className="text-2xl font-semibold mb-6 text-black-800 border-b pb-4">
    Inventory Information
  </h2>
  <div className="flex flex-wrap -mx-4">
    <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
      <strong>Total Items:</strong> 1500 
    </p>
 
    
    <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
    <strong>Company:</strong> Global Logistics Inc.
  </p>
  <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
      <strong>Total Categories:</strong> 10
    </p>
    
    <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
    <strong>Contact Person:</strong> Mr. Robert Reyes
  </p>
  <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
      <strong>Items Out of Stock:</strong> 50
    </p>   
    <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
    <strong>Email:</strong> robert.reyes@globallogistics.com
  </p>
    
    <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
      <strong>Total Number of Stocks:</strong> 3000
    </p>
    <p className="text-base font-medium text-black-600 w-1/2 px-4 py-2">
        <strong>Warehouse Location:</strong> Valenzuela City, Philippines
    </p>

  </div>
</div>

      <div className="bg-white rounded-2xl shadow-md p-6 max-h-80 overflow-y-auto w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-4">
          Top 5 Lowest Stocks
        </h2>
        {sortedItems.map((item) => (
          <div key={item.item_id}>
            <p className="font-semibold text-lg text-gray-900">
              {item.item_name}
            </p>
            <p className="text-base font-medium text-red-600">
              Total Stocks: {item.stock_quantity === 0 ? "Depleted" : item.stock_quantity}
            </p>
            {item.item_id !== sortedItems[sortedItems.length - 1].item_id && (
              <hr className="my-4 border-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockInventory;