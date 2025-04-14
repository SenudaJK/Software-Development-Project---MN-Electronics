import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewInventory = () => {
  interface InventoryItem {
    inventoryId: string;
    productName: string;
    totalQuantity: number;
    stockStatus: string;
  }

  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch inventory data from the backend
  const fetchInventoryData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/inventory/inventory-status/all');
      setInventoryData(
        response.data.map((item: any) => ({
          inventoryId: item.Inventory_ID,
          productName: item.product_name,
          totalQuantity: item.totalQuantity,
          stockStatus: item.stockStatus,
        }))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filter inventory based on the search query
  const filteredInventory = inventoryData.filter((item) =>
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate to InventoryBatch page
  const handleViewClick = (inventoryId: string) => {
    navigate(`/inventory-batch/${inventoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Inventory Management</h2>

        {/* Search Section */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search Inventory"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/2 p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <tr>
                <th className="py-3 px-4">Inventory ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Total Quantity</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredInventory.length > 0 ? (
                filteredInventory.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4">{item.inventoryId}</td>
                    <td className="py-3 px-4">{item.productName}</td>
                    <td className="py-3 px-4">{item.totalQuantity}</td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        item.stockStatus === 'Out of Stock'
                          ? 'text-red-500'
                          : item.stockStatus === 'Buy Items'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {item.stockStatus}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewClick(item.inventoryId)}
                        className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button className="py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
            Add New Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInventory;