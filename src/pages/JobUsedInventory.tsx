import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const JobUsedInventory: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [quantityUsed, setQuantityUsed] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
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

  // Fetch batches for the selected inventory item
  const fetchBatches = async (inventoryId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/inventoryBatch/getBatches/${inventoryId}`);
      setBatches(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching batches for the selected inventory");
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // Handle inventory update
  const handleUpdateInventory = async () => {
    if (!selectedInventory || !selectedBatch || quantityUsed <= 0) {
      setError("Please select an inventory item, batch, and enter a valid quantity.");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/jobUsedInventory/add/${jobId}`, {
        Inventory_ID: selectedInventory.Inventory_ID,
        Batch_No: selectedBatch.Batch_No,
        Quantity_Used: quantityUsed,
      });

      setSuccessMessage("Inventory updated successfully!");
      setError("");
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/myjobs"); // Navigate back to My Jobs after success
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating inventory.");
    }
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

        {/* Update Inventory Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Update Inventory</h3>

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
                setSelectedBatch(null); // Reset batch selection
                setBatches([]); // Clear batches
                if (inventory) fetchBatches(inventory.Inventory_ID); // Fetch batches for the selected inventory
              }}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
            >
              <option value="">Select an inventory item</option>
              {inventoryItems.map((item: any, index: number) => (
                <option key={index} value={item.Inventory_ID}>
                  {item.product_name} {/* Display inventory name */}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Selection */}
          {batches.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Batch
              </label>
              <select
                value={selectedBatch?.Batch_No || ""}
                onChange={(e) =>
                  setSelectedBatch(
                    batches.find((batch: any) => String(batch.Batch_No) === e.target.value)
                  )
                }
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
              >
                <option value="">Select a batch</option>
                {batches.map((batch: any, index: number) => (
                  <option key={index} value={batch.Batch_No}>
                    Batch {batch.Batch_No} - {batch.Quantity} items available
                  </option>
                ))}
              </select>
            </div>
          )}

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
          <div className="flex justify-end">
            <button
              onClick={handleUpdateInventory}
              className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition"
            >
              Update Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobUsedInventory;