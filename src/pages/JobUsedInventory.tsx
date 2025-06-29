import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const JobUsedInventory: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  const [quantityUsed, setQuantityUsed] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [usedBatches, setUsedBatches] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Fetch all inventory items
  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/inventory/getInventory");
      setInventoryItems(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching inventory items");
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // Handle inventory update with FIFO approach
  const handleUpdateInventory = async () => {
    if (!selectedInventory || quantityUsed <= 0) {
      setError("Please select an inventory item and enter a valid quantity.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/jobUsedInventory/add/${jobId}/${selectedInventory.Inventory_ID}`,
        {
          Quantity_Used: quantityUsed,
        }
      );
      
      setUsedBatches(response.data.usedBatches || []);
      setShowResults(true);
      setSuccessMessage(response.data.message || "Inventory updated successfully!");
      setError("");
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Error updating inventory."
      );
    }
  };

  // Go back to jobs page
  const handleBackToJobs = () => {
    navigate("/myjobs");
  };

  // Handle adding more inventory
  const handleAddMore = () => {
    setShowResults(false);
    setSelectedInventory(null);
    setQuantityUsed(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Update Inventory for Job ID: {jobId}
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {!showResults ? (
          // Update Inventory Form
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Update Inventory (FIFO Method)
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The system will automatically use oldest batches first (FIFO method).
            </p>

            {/* Inventory Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Inventory
              </label>
              <select
                value={selectedInventory?.Inventory_ID || ""}
                onChange={(e) => {
                  const inventory = inventoryItems.find(
                    (item: any) => String(item.Inventory_ID) === e.target.value
                  );
                  setSelectedInventory(inventory);
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
              >
                <option value="">Select an inventory item</option>
                {inventoryItems.map((item: any, index: number) => (
                  <option key={index} value={item.Inventory_ID}>
                    {item.product_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity Used
              </label>
              <input
                type="number"
                value={quantityUsed}
                onChange={(e) => setQuantityUsed(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-between">
              <button
                onClick={() => navigate("/myjobs")}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateInventory}
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition"
              >
                Update Inventory
              </button>
            </div>
          </div>
        ) : (
          // Results Display
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Inventory Usage Results
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Inventory Item:</span> {selectedInventory?.product_name}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Total Quantity Used:</span> {quantityUsed}
              </p>
            </div>
            
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Batches Used (FIFO):
            </h4>
            
            {usedBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Batch No</th>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Quantity Used</th>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Cost Per Item</th>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Total Amount</th>
                      <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usedBatches.map((batch, index) => (
                      <tr key={index} className="border-t border-gray-300 dark:border-gray-700">
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{batch.batchNo}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{batch.quantityUsed}</td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          ${batch.costPerItem ? Number(batch.costPerItem).toFixed(2) : '0.00'}
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          ${batch.totalAmount ? Number(batch.totalAmount).toFixed(2) : '0.00'}
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {batch.purchaseDate ? new Date(batch.purchaseDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">No batch information available.</p>
            )}
            
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={handleAddMore}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Add More Inventory
              </button>
              <button
                onClick={handleBackToJobs}
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition"
              >
                Back to Jobs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobUsedInventory;