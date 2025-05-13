import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Search, 
  ExternalLink, 
  ShoppingCart, 
  AlertTriangle, 
  RefreshCw, 
  Lock,
  Download,
  Filter,
  ChevronDown,
  X
} from 'lucide-react';

const ViewInventory = () => {
  interface InventoryItem {
    inventoryId: string;
    productName: string;
    totalQuantity: number;
    stockStatus: string;
  }

  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentUserRole, setCurrentUserRole] = useState('');
  
  // Check if the current user is an owner
  const isOwner = currentUserRole === 'owner';
  
  const navigate = useNavigate();

  // Get the current user's role from localStorage
  useEffect(() => {
    try {
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      setCurrentUserRole(employeeData.role || '');
    } catch (error) {
      console.error('Error parsing employee data:', error);
    }
  }, []);

  // Fetch inventory data from the backend
  const fetchInventoryData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/inventory/inventory-status/all');
      const inventoryItems = response.data.map((item: any) => ({
        inventoryId: item.Inventory_ID,
        productName: item.product_name,
        totalQuantity: item.totalQuantity,
        stockStatus: item.stockStatus,
      }));
      
      setInventoryData(inventoryItems);
      setFilteredInventory(inventoryItems);
      
      // Filter items that need to be purchased and store in localStorage
      const itemsToBuy = inventoryItems.filter((item: InventoryItem) => 
        item.stockStatus === 'Buy Items' || item.stockStatus === 'Out of Stock'
      );
      localStorage.setItem('inventoryAlerts', JSON.stringify(itemsToBuy));
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filter and sort inventory data
  useEffect(() => {
    let result = [...inventoryData];
    
    // Apply search query filter
    if (searchQuery) {
      result = result.filter((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.inventoryId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter((item) => item.stockStatus === statusFilter);
    }
    
    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy as keyof InventoryItem];
        const bValue = b[sortBy as keyof InventoryItem];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        } else {
          // For numeric values
          return sortOrder === 'asc' 
            ? Number(aValue) - Number(bValue) 
            : Number(bValue) - Number(aValue);
        }
      });
    }
    
    setFilteredInventory(result);
  }, [inventoryData, searchQuery, statusFilter, sortBy, sortOrder]);

  // Navigate to InventoryBatch page
  const handleViewClick = (inventoryId: string) => {
    // Check if user has owner role
    if (!isOwner) {
      setError('Only owners can view detailed inventory information');
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    navigate(`/inventory-batch/${inventoryId}`);
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Export inventory data to CSV
  const exportToCSV = () => {
    if (filteredInventory.length === 0) return;
    
    // Create CSV content
    const headers = ["Inventory ID", "Product Name", "Total Quantity", "Stock Status"].join(",");
    const rows = filteredInventory.map(item => [
      item.inventoryId,
      `"${item.productName}"`,
      item.totalQuantity,
      item.stockStatus
    ].join(","));
    
    const csvContent = [headers, ...rows].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setSortBy('');
    setSortOrder('asc');
  };

  // Check if any filters are active
  const isFilterActive = searchQuery || statusFilter || sortBy;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <Package className="mr-2" size={28} /> 
              Inventory Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage your product inventory
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={filteredInventory.length === 0 || loading}
              className={`flex items-center px-4 py-2 rounded-lg 
                ${filteredInventory.length === 0 || loading 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                }
                border border-green-200 dark:border-green-800 transition-colors`}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </button>
            
            <button
              onClick={() => navigate('/add-purchase')}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add New Purchase
            </button>
          </div>
        </div>

        {/* Permission info for non-owners */}
        {!isOwner && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md flex items-center text-blue-700 dark:text-blue-400">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>You have limited access. Only owners can view detailed inventory information.</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Box */}
            <div className="relative lg:flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name or ID..."
                className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Stock Status Filter */}
            <div className="lg:w-48">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-full py-2.5 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Buy Items">Buy Items</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Clear Filters Button */}
            <div className="lg:w-40">
              <button
                onClick={clearFilters}
                disabled={!isFilterActive}
                className={`w-full py-2.5 flex items-center justify-center rounded-lg ${
                  isFilterActive 
                    ? "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50"
                    : "text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                }`}
              >
                <X className="mr-1.5 h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Active Filter Indicators */}
          {isFilterActive && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
                
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Search: {searchQuery.length > 20 ? searchQuery.substring(0, 20) + "..." : searchQuery}
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {statusFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Status: {statusFilter}
                    <button 
                      onClick={() => setStatusFilter("")}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {sortBy && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Sorted by: {sortBy} ({sortOrder})
                  </span>
                )}
                
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  Showing {filteredInventory.length} of {inventoryData.length} items
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading inventory data...</p>
              </div>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-gray-500 dark:text-gray-400">
              <Package className="h-12 w-12" />
              <p className="mt-4">No inventory items found matching your criteria</p>
              {isFilterActive && (
                <button 
                  onClick={clearFilters} 
                  className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <tr>
                    <th 
                      onClick={() => handleSort('inventoryId')} 
                      className="py-3 px-4 cursor-pointer"
                    >
                      <div className="flex items-center">
                        Inventory ID
                        {sortBy === 'inventoryId' && (
                          <ChevronDown 
                            className={`ml-1 h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('productName')} 
                      className="py-3 px-4 cursor-pointer"
                    >
                      <div className="flex items-center">
                        Product Name
                        {sortBy === 'productName' && (
                          <ChevronDown 
                            className={`ml-1 h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('totalQuantity')} 
                      className="py-3 px-4 cursor-pointer"
                    >
                      <div className="flex items-center">
                        Total Quantity
                        {sortBy === 'totalQuantity' && (
                          <ChevronDown 
                            className={`ml-1 h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('stockStatus')} 
                      className="py-3 px-4 cursor-pointer"
                    >
                      <div className="flex items-center">
                        Stock Status
                        {sortBy === 'stockStatus' && (
                          <ChevronDown 
                            className={`ml-1 h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} 
                          />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-4">
                      <div className="flex items-center justify-end">
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInventory.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                          {item.inventoryId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                          {item.productName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.totalQuantity}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${item.stockStatus === 'In Stock' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : item.stockStatus === 'Buy Items' 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }
                        `}>
                          {item.stockStatus === 'Buy Items' && 
                            <AlertTriangle className="inline-block mr-1 h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                          }
                          {item.stockStatus === 'Out of Stock' && 
                            <AlertTriangle className="inline-block mr-1 h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                          }
                          {item.stockStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleViewClick(item.inventoryId)}
                            className={`p-2 rounded-lg transition-colors ${
                              isOwner
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={isOwner ? "View Inventory Details" : "Only owners can view detailed inventory"}
                            disabled={!isOwner}
                          >
                            {isOwner ? (
                              <ExternalLink className="h-4 w-4" />
                            ) : (
                              <Lock className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewInventory;