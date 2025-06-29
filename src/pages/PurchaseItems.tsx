import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Search, 
  ShoppingBag, 
  Package, 
  Calendar, 
  ArrowDown, 
  ArrowUp, 
  FilePlus, 
  RefreshCw,
  Download,
  Filter,
  X,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";

interface PurchaseItem {
  Purchase_ID: number;
  Inventory_ID: number;
  Batch_No: string;
  Quantity: number;
  Total_Amount: string; // String because decimal from DB
  Purchase_Date: string;
  Inventory_Name: string;
}

const PurchaseItems: React.FC = () => {
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PurchaseItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<string>("0.00");
  const [itemCount, setItemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<keyof PurchaseItem>("Purchase_Date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: "",
    end: ""
  });
  const [filterActive, setFilterActive] = useState<boolean>(false);
  const [filterInventory, setFilterInventory] = useState<number | null>(null);
  const [uniqueInventories, setUniqueInventories] = useState<{id: number, name: string}[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Fetch purchase items from the API
  useEffect(() => {
    const fetchPurchaseItems = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/inventoryBatch/get-purchase-items");
        setPurchaseItems(response.data.purchaseItems);
        setFilteredItems(response.data.purchaseItems);
        setTotalAmount(response.data.totalPurchaseAmount);
        setItemCount(response.data.count);
        
        // Extract unique inventories for the filter dropdown
        const uniqueInvs = Array.from(new Set(
          response.data.purchaseItems.map((item: PurchaseItem) => item.Inventory_ID)
        )).map(id => {
          const item = response.data.purchaseItems.find((i: PurchaseItem) => i.Inventory_ID === id);
          return { id: id as number, name: item.Inventory_Name };
        });
        setUniqueInventories(uniqueInvs);
        
        setError("");
      } catch (err: any) {
        console.error("Error fetching purchase items:", err);
        setError(err.response?.data?.message || "Failed to fetch purchase items data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchaseItems();
  }, []);

  // Apply filtering and sorting
  useEffect(() => {
    let result = [...purchaseItems];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(item => 
        item.Inventory_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Batch_No.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.Purchase_ID).includes(searchTerm)
      );
    }
    
    // Apply inventory filter
    if (filterInventory) {
      result = result.filter(item => item.Inventory_ID === filterInventory);
    }
    
    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      result = result.filter(item => {
        const purchaseDate = new Date(item.Purchase_Date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the end date fully
        
        return purchaseDate >= startDate && purchaseDate <= endDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === "Total_Amount" || sortField === "Quantity") {
        // Numeric sorting
        const aVal = parseFloat(String(a[sortField]));
        const bVal = parseFloat(String(b[sortField]));
        
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      } else if (sortField === "Purchase_Date") {
        // Date sorting
        const aDate = new Date(a[sortField]);
        const bDate = new Date(b[sortField]);
        
        return sortDirection === "asc" 
          ? aDate.getTime() - bDate.getTime() 
          : bDate.getTime() - aDate.getTime();
      } else {
        // String sorting
        const aVal = String(a[sortField]).toLowerCase();
        const bVal = String(b[sortField]).toLowerCase();
        
        return sortDirection === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
    });
    
    // Update filtered items
    setFilteredItems(result);
    
    // Check if any filter is active
    setFilterActive(
      !!searchTerm || 
      !!filterInventory || 
      !!(dateRange.start && dateRange.end)
    );
    
  }, [purchaseItems, searchTerm, sortField, sortDirection, filterInventory, dateRange]);

  // Calculate paginated items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Format date to local format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(Number(amount));
  };

  // Handle sort toggle
  const handleSort = (field: keyof PurchaseItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: keyof PurchaseItem) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ArrowUp size={14} className="ml-1" /> 
      : <ArrowDown size={14} className="ml-1" />;
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
    setFilterInventory(null);
    setSortField("Purchase_Date");
    setSortDirection("desc");
  };

  // Export to CSV
  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Create CSV content
      const headers = [
        "Purchase ID",
        "Inventory Name",
        "Inventory ID",
        "Batch No",
        "Quantity",
        "Total Amount (Rs.)",
        "Purchase Date"
      ].join(",");
      
      const rows = filteredItems.map(item => [
        item.Purchase_ID,
        `"${item.Inventory_Name}"`, // Quotation marks to handle commas in names
        item.Inventory_ID,
        `"${item.Batch_No}"`,
        item.Quantity,
        parseFloat(item.Total_Amount).toFixed(2),
        item.Purchase_Date
      ].join(","));
      
      const csvContent = [headers, ...rows].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `purchase_items_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      setError("Failed to export data to CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <ShoppingBag className="mr-2" size={24} /> 
              Purchase Items Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage inventory purchase records
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              disabled={isExporting || filteredItems.length === 0}
              className={`flex items-center px-4 py-2 rounded-lg 
                ${isExporting || filteredItems.length === 0 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                }
                border border-green-200 dark:border-green-800 transition-colors`}
            >
              {isExporting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export CSV
            </button>
            
            <a
              href="/add-purchase"
              className="flex items-center px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Add New Purchase
            </a>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">{itemCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expense</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtered Results</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                  {filteredItems.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Filter className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters section only */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
          {/* Search and basic filters - top row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Box - takes more space */}
            <div className="relative lg:flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by inventory name, batch number, purchase ID..."
                className="w-full py-2.5 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            {/* Inventory Filter - fixed width */}
            <div className="lg:w-64">
              <div className="relative">
                <select
                  value={filterInventory || ""}
                  onChange={(e) => setFilterInventory(e.target.value ? Number(e.target.value) : null)}
                  className="w-full h-full py-2.5 pl-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Inventories</option>
                  {uniqueInventories.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Clear Filters Button - fixed width */}
            <div className="lg:w-48">
              <button
                onClick={clearFilters}
                disabled={!filterActive}
                className={`w-full py-2.5 flex items-center justify-center rounded-lg ${
                  filterActive 
                    ? "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50"
                    : "text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                }`}
              >
                <X className="mr-1.5 h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Date Range Filter - bottom row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Calendar className="inline-block mr-1 h-4 w-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="hidden sm:block">
              {/* This empty div helps balance the layout on larger screens */}
            </div>
          </div>
          
          {/* Active Filter Indicators */}
          {filterActive && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
                
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Search: {searchTerm}
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {dateRange.start && dateRange.end && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Date: {dateRange.start} to {dateRange.end}
                    <button 
                      onClick={() => setDateRange({start: "", end: ""})}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {filterInventory && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Inventory: {uniqueInventories.find(i => i.id === filterInventory)?.name}
                    <button 
                      onClick={() => setFilterInventory(null)}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  Showing {filteredItems.length} of {purchaseItems.length} records
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Purchase Items Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center p-10">
              <div className="flex flex-col items-center">
                <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading purchase data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-10 text-red-500 dark:text-red-400">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4">{error}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-gray-500 dark:text-gray-400">
              <Package className="h-12 w-12" />
              <p className="mt-4">No purchase records found</p>
              {filterActive && (
                <button 
                  onClick={clearFilters} 
                  className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th 
                        onClick={() => handleSort("Purchase_ID")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      >
                        <div className="flex items-center">
                          Purchase ID {getSortIcon("Purchase_ID")}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("Inventory_Name")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      >
                        <div className="flex items-center">
                          Inventory Item {getSortIcon("Inventory_Name")}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("Batch_No")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      >
                        <div className="flex items-center">
                          Batch No {getSortIcon("Batch_No")}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("Quantity")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      >
                        <div className="flex items-center">
                          Quantity {getSortIcon("Quantity")}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("Total_Amount")}
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      >
                        <div className="flex items-center justify-end">
                          Amount {getSortIcon("Total_Amount")}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort("Purchase_Date")}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      >
                        <div className="flex items-center">
                          Purchase Date {getSortIcon("Purchase_Date")}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentItems.map(item => (
                      <tr 
                        key={`${item.Purchase_ID}-${item.Inventory_ID}-${item.Batch_No}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                            #{item.Purchase_ID}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.Inventory_Name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {item.Inventory_ID}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {item.Batch_No}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md dark:bg-gray-700 dark:text-gray-300">
                            {item.Quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(item.Total_Amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            {formatDate(item.Purchase_Date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative group">
                            <button className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:hover:bg-gray-600">
                              <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                            <div className="hidden group-hover:block absolute right-0 mt-2 z-10 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700">
                              <div className="py-1">
                                <a href={`/edit-purchase/${item.Purchase_ID}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                                  Edit
                                </a>
                                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredItems.length)}
                      </span>{" "}
                      of <span className="font-medium">{filteredItems.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 
                          dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                          currentPage === 1
                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page number buttons */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 
                          ? i + 1
                          : currentPage >= totalPages - 2 
                            ? totalPages - 4 + i
                            : currentPage - 2 + i;

                        if (pageNum <= totalPages && pageNum > 0) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600
                                ${
                                  currentPage === pageNum
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                } text-sm font-medium`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 
                          dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${
                          currentPage === totalPages || totalPages === 0
                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseItems;