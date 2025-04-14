import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryBatchRegistration = () => {
  interface InventoryItem {
    Inventory_ID: string;
    product_name: string;
  }

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]); // List of inventory items
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]); // Filtered items for live search
  const [selectedInventoryId, setSelectedInventoryId] = useState(''); // Selected inventory item
  const [searchQuery, setSearchQuery] = useState(''); // Search query for live search
  const [quantity, setQuantity] = useState('');
  const [costPerItem, setCostPerItem] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [message, setMessage] = useState('');

  // Fetch inventory items from the backend
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory/getInventory'); // Replace with your inventory endpoint
        setInventoryItems(response.data);
        setFilteredItems(response.data); // Initialize filtered items
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchInventoryItems();
  }, []);

  // Handle live search
  useEffect(() => {
    const filtered = inventoryItems.filter((item) =>
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, inventoryItems]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInventoryId || !quantity || !costPerItem) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/inventoryBatch/addBatch/${selectedInventoryId}`,
        {
          Quantity: quantity,
          Cost_Per_Item: costPerItem,
          Purchase_Date: purchaseDate || new Date().toISOString().split('T')[0], // Default to today's date
        }
      );

      setMessage(response.data.message);
      setQuantity('');
      setCostPerItem('');
      setPurchaseDate('');
      setSelectedInventoryId('');
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding inventory batch:', error);
      setMessage('Failed to add inventory batch.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Inventory Batch Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Inventory Item with Live Search */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Select Inventory Item
            </label>
            <input
              type="text"
              placeholder="Search inventory items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md dark:border-gray-600">
              {filteredItems.map((item) => (
                <div
                  key={item.Inventory_ID}
                  onClick={() => {
                    setSelectedInventoryId(item.Inventory_ID);
                    setSearchQuery(item.product_name);
                  }}
                  className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedInventoryId === item.Inventory_ID
                      ? 'bg-gray-200 dark:bg-gray-600'
                      : ''
                  }`}
                >
                  {item.product_name} (ID: {item.Inventory_ID})
                </div>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter quantity"
              required
            />
          </div>

          {/* Cost Per Item */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Cost Per Item
            </label>
            <input
              type="number"
              value={costPerItem}
              onChange={(e) => setCostPerItem(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter cost per item"
              required
            />
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Add Batch
          </button>

          {/* Message */}
          {message && (
            <p
              className={`mt-4 text-center ${
                message.includes('Failed') ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default InventoryBatchRegistration;