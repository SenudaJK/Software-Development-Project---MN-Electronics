import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Hash, 
  Search, 
  Plus, 
  ChevronDown, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X
} from 'lucide-react';

const InventoryBatchRegistration = () => {
  interface InventoryItem {
    Inventory_ID: string;
    product_name: string;
    current_quantity?: number;
    price?: number;
  }
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]); // List of inventory items
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]); // Filtered items for live search
  const [selectedInventoryId, setSelectedInventoryId] = useState(''); // Selected inventory item
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null); // Complete selected item data  
  const [searchQuery, setSearchQuery] = useState(''); // Search query for live search
  const [quantity, setQuantity] = useState('');
  const [costPerItem, setCostPerItem] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Array<{ param?: string; msg: string }>>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside search dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Fetch inventory items from the backend
  useEffect(() => {
    const fetchInventoryItems = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/inventory/getInventory');
        setInventoryItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
        setMessage('Failed to load inventory items. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventoryItems();
  }, []);

  // Handle live search
  useEffect(() => {
    if (searchQuery) {
      const filtered = inventoryItems.filter((item) =>
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
      setIsSearchOpen(true);
    } else {
      setFilteredItems(inventoryItems);
      setIsSearchOpen(false);
    }
  }, [searchQuery, inventoryItems]);

  // Get item details when selected
  useEffect(() => {
    if (selectedInventoryId) {
      const item = inventoryItems.find(item => item.Inventory_ID === selectedInventoryId);
      if (item) {
        setSelectedItem(item);
        // If item has a price set, use that as the default cost per item
        if (item.price) {
          setCostPerItem(item.price.toString());
        }
      }
    } else {
      setSelectedItem(null);
    }
  }, [selectedInventoryId, inventoryItems]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages and errors
    setMessage('');
    setErrors([]);
    setIsLoading(true);

    if (!selectedInventoryId || !quantity || !costPerItem) {
      setMessage('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/inventoryBatch/addBatch/${selectedInventoryId}`,
        {
          Quantity: quantity,
          Cost_Per_Item: costPerItem,
          Purchase_Date: purchaseDate || new Date().toISOString().split('T')[0],
        }
      );      setMessage(response.data.message);
      setQuantity('');
      setCostPerItem('');
      setPurchaseDate('');
      setSelectedInventoryId('');
      setSearchQuery('');
      setSelectedItem(null);
    } catch (error: any) {
      console.error('Error adding inventory batch:', error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.error) {
        setMessage(`Error: ${error.response.data.error}`);
      } else {
        setMessage('Failed to add inventory batch. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedInventoryId('');
    setSearchQuery('');
    setSelectedItem(null);
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? 'Rs. 0.00' : `Rs. ${numValue.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Inventory Batch Registration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add new inventory batches to track stock and costs
          </p>
        </div>        <div className="grid grid-cols-1 gap-6">
          {/* Main Form Section */}
          <div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Package className="text-white" size={20} />
                  <h2 className="text-xl font-semibold text-white">
                    Add New Inventory Batch
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Select Inventory Item with Live Search */}
                <div className="relative" ref={searchRef}>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Package size={16} className="mr-1.5" />
                    Select Inventory Item
                  </label>
                  
                  {selectedItem ? (
                    <div className="relative">
                      <div className="p-3 border rounded-lg flex items-center justify-between bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-md flex items-center justify-center mr-3">
                            <Package size={20} className="text-blue-600 dark:text-blue-300" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              {selectedItem.product_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              ID: {selectedItem.Inventory_ID} 
                              {selectedItem.current_quantity !== undefined && (
                                <span className="ml-2">• Current Stock: {selectedItem.current_quantity}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          className="p-1.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Search inventory items..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onClick={() => setIsSearchOpen(true)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        />
                        <div className="absolute top-0 left-0 h-full flex items-center pl-3">
                          <Search className="text-gray-400" size={18} />
                        </div>
                      </div>

                      {isSearchOpen && (
                        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
                          {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                              <div
                                key={item.Inventory_ID}
                                onClick={() => {
                                  setSelectedInventoryId(item.Inventory_ID);
                                  setSearchQuery(item.product_name);
                                  setIsSearchOpen(false);
                                }}
                                className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center border-b border-gray-100 dark:border-gray-700"
                              >
                                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-800 rounded-md flex items-center justify-center mr-3">
                                  <Package size={16} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800 dark:text-gray-200">
                                    {item.product_name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {item.Inventory_ID}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                              No items found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Search by product name to select an inventory item
                  </p>
                </div>

                {/* Quantity and Cost Per Item row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <Hash size={16} className="mr-1.5" />
                      Quantity
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        placeholder="Enter quantity"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Must be between 1 and 9999
                      </p>
                    </div>
                  </div>

                  {/* Cost Per Item */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <DollarSign size={16} className="mr-1.5" />
                      Cost Per Item
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={costPerItem}
                        onChange={(e) => setCostPerItem(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        placeholder="Enter cost per item"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Must be a positive value (e.g. 25.50)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Calendar size={16} className="mr-1.5" />
                    Purchase Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Leave empty to use today's date
                    </p>
                  </div>
                </div>

                {/* Total Cost Summary - if quantity and cost are set */}
                {quantity && costPerItem && (
                  <div className="bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Batch Cost:
                      </div>
                      <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {formatCurrency(parseFloat(quantity) * parseFloat(costPerItem))}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {quantity} items × {formatCurrency(costPerItem)} per item
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !selectedInventoryId || !quantity || !costPerItem}
                  className={`w-full py-3 px-4 flex justify-center items-center rounded-lg shadow-sm transition ${
                    isLoading || !selectedInventoryId || !quantity || !costPerItem
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={18} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus size={18} className="mr-2" />
                      Add Inventory Batch
                    </>
                  )}
                </button>

                {/* Feedback Messages */}
                {message && (
                  <div className={`p-3 rounded-lg flex items-start ${
                    message.includes('Error') || message.includes('Failed') 
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                      : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  }`}>
                    {message.includes('Error') || message.includes('Failed') ? (
                      <AlertCircle size={20} className="text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle size={20} className="text-green-500 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${
                      message.includes('Error') || message.includes('Failed') 
                        ? 'text-red-700 dark:text-red-400' 
                        : 'text-green-700 dark:text-green-400'
                    }`}>
                      {message}
                    </p>
                  </div>
                )}

                {/* Validation Errors */}
                {errors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle size={18} className="text-red-500 dark:text-red-400 mr-2" />
                      <h4 className="text-red-700 dark:text-red-400 font-medium">
                        Please fix the following errors:
                      </h4>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 space-y-1 ml-1">
                      {errors.map((err, index) => (
                        <li key={index}>{err.msg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>          </div>
            
          {/* Help Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
            <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-2">Tips</h3>
            <ul className="text-sm space-y-2 text-blue-700 dark:text-blue-400">
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Enter the quantity of items purchased in this batch</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>Cost per item should be the purchase price, not the selling price</span>
              </li>
              <li className="flex">
                <span className="mr-2">•</span>
                <span>The purchase date defaults to today if left empty</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryBatchRegistration;