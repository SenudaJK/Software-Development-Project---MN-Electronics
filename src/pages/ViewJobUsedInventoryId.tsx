import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  RefreshCw, 
  Search, 
  ArrowLeft, 
  Package, 
  Tag, 
  DollarSign,
  FileText,
  ShoppingCart,
  Download,
  AlertCircle,
  User,
  Calendar,
  Wrench,
  BarChart2
} from "lucide-react";

interface JobUsedInventoryItem {
  Job_ID: string;
  Inventory_ID: string;
  Batch_No: string;
  Quantity_Used: number;
  Total_Amount: number;
  Inventory_Name: string;
  Unit_Price: number;
}

interface JobDetails {
  job_id: string;
  product_name: string;
  model: string;
  customer_first_name: string;
  customer_last_name: string;
  repair_status: string;
  handover_date: string;
  repair_description: string;
}

const ViewJobUsedInventoryId: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inventoryItems, setInventoryItems] = useState<JobUsedInventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<JobUsedInventoryItem[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);

  // Fetch job used inventory data
  useEffect(() => {
    const fetchJobUsedInventory = async () => {
      try {
        setIsLoading(true);
        
        if (!jobId) {
          setError("No job ID provided");
          setIsLoading(false);
          return;
        }

        // First fetch job details to show contextual information
        try {
          const jobResponse = await axios.get(`http://localhost:5000/api/jobs/get/${jobId}`);
          setJobDetails(jobResponse.data);
        } catch (error) {
          console.error("Error fetching job details:", error);
          // Continue even if we can't get job details
        }

        // Then fetch job used inventory items
        const inventoryResponse = await axios.get(`http://localhost:5000/api/jobUsedInventory/get-by-job/${jobId}`);
        
        if (inventoryResponse.data.jobUsedInventories && inventoryResponse.data.jobUsedInventories.length > 0) {
          setInventoryItems(inventoryResponse.data.jobUsedInventories);
          setFilteredItems(inventoryResponse.data.jobUsedInventories);
          setTotalCost(parseFloat(inventoryResponse.data.totalInventoryCost));
        } else {
          setInventoryItems([]);
          setFilteredItems([]);
          setTotalCost(0);
        }
      } catch (error) {
        console.error("Error fetching job used inventory:", error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setError("No inventory items found for this job");
        } else {
          setError("Failed to fetch job used inventory data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobUsedInventory();
  }, [jobId]);

  // Filter inventory items based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredItems(inventoryItems);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      setFilteredItems(
        inventoryItems.filter(
          (item) =>
            item.Inventory_Name.toLowerCase().includes(lowercasedSearch) ||
            item.Inventory_ID.toLowerCase().includes(lowercasedSearch) ||
            item.Batch_No.toLowerCase().includes(lowercasedSearch)
        )
      );
    }
  }, [searchTerm, inventoryItems]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "in progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "cannot repair":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Generate PDF export of inventory items
  const exportInventoryReport = () => {
    // In a real implementation, this would generate a PDF report
    alert(`Exporting inventory report for Job ${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-2">
            {error}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            This job may not have any inventory items assigned to it yet.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        {/* Header section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <button 
                onClick={() => navigate(-1)} 
                className="mr-3 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Job Used Inventory Details
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-10">
              Showing parts and components used for Job #{jobId}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportInventoryReport}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Job details card */}
        {jobDetails && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Job Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {jobDetails.product_name} {jobDetails.model && <span className="text-sm text-gray-500">({jobDetails.model})</span>}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {jobDetails.customer_first_name} {jobDetails.customer_last_name}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(jobDetails.repair_status)}`}>
                    <Wrench className="h-3 w-3 mr-1" />
                    {jobDetails.repair_status}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Handover Date</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {formatDate(jobDetails.handover_date)}
                  </p>
                </div>
              </div>
            </div>
            
            {jobDetails.repair_description && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Repair Description</p>
                <p className="text-gray-800 dark:text-gray-200">{jobDetails.repair_description}</p>
              </div>
            )}
          </div>
        )}

        {/* Inventory summary card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="flex items-center mb-3 sm:mb-0">
              <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Inventory Summary</h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Items</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                {inventoryItems.length} <span className="text-sm font-normal">items</span>
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">Total Units Used</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                {inventoryItems.reduce((sum, item) => sum + Number(item.Quantity_Used), 0)} <span className="text-sm font-normal">units</span>
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
              <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                {formatCurrency(totalCost)}
              </p>
            </div>
          </div>

          {/* Inventory items list */}
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Inventory Item
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      ID & Batch No.
                    </th>
                    <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Quantity Used
                    </th>
                    <th className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 font-semibold tracking-wider">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map((item, index) => (
                    <tr 
                      key={`${item.Inventory_ID}-${item.Batch_No}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.Inventory_Name || "Unnamed Item"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {item.Inventory_ID}
                          </div>
                          <div className="flex items-center mt-1">
                            <Tag className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">
                              Batch: {item.Batch_No}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(item.Unit_Price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-800 dark:text-blue-300 inline-block">
                          {item.Quantity_Used}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(item.Total_Amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Cost
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">No inventory items found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm 
                  ? `No items matching "${searchTerm}" were found` 
                  : "This job doesn't have any inventory items assigned to it yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewJobUsedInventoryId;