import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const InventoryBatch = () => {
  const { inventoryId } = useParams<{ inventoryId: string }>();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Success message state
  const [showDialog, setShowDialog] = useState(false); // State to show/hide dialog
  const [selectedBatch, setSelectedBatch] = useState<any>(null); // State for the selected batch
  const [formData, setFormData] = useState({
    Quantity: '',
    Cost_Per_Item: '',
    Purchase_Date: '',
  });

  // Fetch batch details for the given inventory ID
  const fetchBatchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/inventoryBatch/getBatches/${inventoryId}`);
      setBatches(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching batch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
  }, [inventoryId]);

  // Format the date to "YYYY-MM-DD"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle Update Button Click
  const handleUpdate = (batch: any) => {
    setSelectedBatch(batch);
    setFormData({
      Quantity: batch.Quantity,
      Cost_Per_Item: batch.Cost_Per_Item,
      Purchase_Date: formatDate(batch.Purchase_Date),
    });
    setShowDialog(true); // Show the dialog
  };

  // Handle Dialog Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Dialog Submit
  const handleDialogSubmit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/inventoryBatch/updateBatch/${selectedBatch.Batch_No}`, formData);
      setSuccessMessage('Batch updated successfully!');
      setError('');
      setShowDialog(false); // Close the dialog
      fetchBatchDetails(); // Refresh the batch list
    } catch (err: any) {
      console.error('Error updating batch:', err);
      setError(err.response?.data?.errors?.map((error: any) => error.msg).join(', ') || 'Failed to update batch');
      setSuccessMessage('');
    }
  };

  // Handle Delete Button Click
  const handleDelete = async (batchId: number) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await axios.delete(`http://localhost:5000/api/inventoryBatch/delete/${batchId}`);
        setBatches((prevBatches) => prevBatches.filter((batch: any) => batch.Batch_No !== batchId));
        setSuccessMessage('Batch deleted successfully!');
        setError('');
      } catch (err: any) {
        console.error('Error deleting batch:', err);
        setError('Failed to delete batch');
        setSuccessMessage('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Inventory Batches for Inventory ID: {inventoryId}
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Batch Table */}
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <tr>
                <th className="py-3 px-4">Batch No</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Cost Per Item</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Purchase Date</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : batches.length > 0 ? (
                batches.map((batch: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4">{batch.Batch_No}</td>
                    <td className="py-3 px-4">{batch.Quantity}</td>
                    <td className="py-3 px-4">{batch.Cost_Per_Item}</td>
                    <td className="py-3 px-4">{batch.Total_Amount}</td>
                    <td className="py-3 px-4">{formatDate(batch.Purchase_Date)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleUpdate(batch)}
                        className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(batch.Batch_No)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-center">
                    No batches found for this inventory ID
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Dialog */}
      {showDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Update Batch</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                name="Quantity"
                value={formData.Quantity}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Cost Per Item</label>
              <input
                type="number"
                name="Cost_Per_Item"
                value={formData.Cost_Per_Item}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Purchase Date</label>
              <input
                type="date"
                name="Purchase_Date"
                value={formData.Purchase_Date}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDialog(false)}
                className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDialogSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryBatch;