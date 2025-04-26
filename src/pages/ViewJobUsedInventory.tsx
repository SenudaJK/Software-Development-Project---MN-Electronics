import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Search, Edit } from "lucide-react";

const ViewJobUsedInventory: React.FC = () => {
  const [inventories, setInventories] = useState<any[]>([]);
  const [filteredInventories, setFilteredInventories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Group by job for better organization
  const [groupedByJob, setGroupedByJob] = useState<any>({});

  useEffect(() => {
    fetchInventories();
  }, []);

  useEffect(() => {
    if (inventories.length > 0) {
      const filtered = inventories.filter(
        (item) =>
          item.Job_Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Customer_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Inventory_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Job_ID?.toString().includes(searchTerm) ||
          item.Inventory_ID?.toString().includes(searchTerm)
      );
      setFilteredInventories(filtered);

      // Group the filtered items by Job_ID
      const grouped: any = {};
      filtered.forEach((item) => {
        if (!grouped[item.Job_ID]) {
          grouped[item.Job_ID] = {
            jobId: item.Job_ID,
            jobDescription: item.Job_Description,
            customerName: item.Customer_Name,
            employeeName: item.Employee_Name,
            items: [],
          };
        }
        grouped[item.Job_ID].items.push(item);
      });
      setGroupedByJob(grouped);
    }
  }, [searchTerm, inventories]);

  const fetchInventories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/jobUsedInventory/get-all");
      setInventories(response.data);
      setError("");
    } catch (err: any) {
      console.error("Error fetching job used inventories:", err);
      setError(err.response?.data?.message || "Failed to fetch inventory data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    try {
      await axios.put(
        `http://localhost:5000/api/jobUsedInventory/update/${selectedItem.Job_ID}/${selectedItem.Inventory_ID}/${selectedItem.Batch_No}`,
        {
          Quantity_Used: newQuantity,
        }
      );
      
      // Success! Close modal and refresh data
      setIsModalOpen(false);
      fetchInventories();
      showToast("Inventory quantity updated successfully!", "success");
    } catch (err: any) {
      console.error("Error updating quantity:", err);
      showToast(err.response?.data?.message || "Failed to update quantity.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading inventory data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">List of the Job Used Inventory</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300"
            />
          </div>
        </div>

        {Object.keys(groupedByJob).length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Package size={48} className="mx-auto text-gray-400" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">No inventory items found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedByJob).map((jobGroup: any) => (
              <div key={jobGroup.jobId} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Job #{jobGroup.jobId}: {jobGroup.jobDescription}
                  </h2>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Customer:</span> {jobGroup.customerName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Technician:</span> {jobGroup.employeeName}
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-left">
                      <tr>
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Batch #</th>
                        <th className="px-4 py-3">Quantity Used</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3">Total Amount</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {jobGroup.items.map((item: any) => (
                        <tr
                          key={`${item.Job_ID}-${item.Inventory_ID}-${item.Batch_No}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-750"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800 dark:text-gray-200">{item.Inventory_Name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.Description}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{item.Batch_No}</td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{item.Quantity_Used}</td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                            Rs. {parseFloat(item.Unit_Price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                            Rs. {parseFloat(item.Total_Amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleItemClick(item)}
                              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {isModalOpen && selectedItem && (
        <UpdateInventoryModal
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateQuantity}
        />
      )}

      {/* Toast notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

// Update Modal Component
interface UpdateInventoryModalProps {
  item: any;
  onClose: () => void;
  onUpdate: (quantity: number) => void;
}

const UpdateInventoryModal: React.FC<UpdateInventoryModalProps> = ({ item, onClose, onUpdate }) => {
  const [quantity, setQuantity] = useState<number>(item.Quantity_Used);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(quantity);
    } catch (err) {
      console.error("Error in modal update:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Update Used Inventory
        </h2>
        
        <div className="mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p><span className="font-medium">Item:</span> {item.Inventory_Name}</p>
            <p><span className="font-medium">Description:</span> {item.Description}</p>
            <p><span className="font-medium">Batch #:</span> {item.Batch_No}</p>
            <p><span className="font-medium">Unit Price:</span> Rs. {parseFloat(item.Unit_Price).toFixed(2)}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity Used
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              Previous value: {item.Quantity_Used}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Toast Component
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div 
        className={`p-4 rounded-md shadow-lg flex items-center ${
          type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white min-w-[300px]`}
      >
        <div className="flex-1">
          {message}
        </div>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

export default ViewJobUsedInventory;