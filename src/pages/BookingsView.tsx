import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  CalendarRange,
  ArrowUpDown,
  Eye,
  Edit
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Booking {
  BookingID: number;
  Date: string;
  Time: string;
  job_id: number;
  repair_description: string;
  repair_status: string;
  handover_date?: string;
  product_id: number;
  product_name: string;
  model?: string;
  model_number?: string;
  product_image?: string;
  customer_id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone_numbers?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const BookingsView: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Date');
  const [sortOrder, setSortOrder] = useState<string>('DESC');
  
  // Date range filter
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDateFilterActive, setIsDateFilterActive] = useState<boolean>(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(false);
  
  // Fetch bookings using the pagination endpoint
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // If date filter is active, use date range endpoint
      if (isDateFilterActive && startDate && endDate) {
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        const response = await axios.get(`http://localhost:5000/api/bookings/date-range`, {
          params: {
            startDate: formattedStartDate,
            endDate: formattedEndDate
          }
        });
        
        setBookings(response.data || []);
        // Set pagination for date filter results
        setPagination({
          total: response.data.length,
          page: 1,
          limit: response.data.length,
          totalPages: 1
        });
      } else {
        // Otherwise use the main bookings endpoint with filters
        const response = await axios.get('http://localhost:5000/api/bookings', {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            status: status || undefined,
            search: search || undefined,
            sortBy,
            sortOrder
          }
        });
        
        setBookings(response.data.bookings);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch bookings when filters or pagination changes
  useEffect(() => {
    fetchBookings();
  }, [pagination.page, pagination.limit, status, sortBy, sortOrder, isDateFilterActive]);
  
  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchBookings();
      } else {
        // Reset to page 1 when search changes
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);
  
  // Apply date filter
  const handleDateFilterApply = () => {
    if (startDate && endDate) {
      setIsDateFilterActive(true);
      // Reset pagination when applying date filter
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };
  
  // Clear date filter
  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setIsDateFilterActive(false);
    // Reset pagination when clearing date filter
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  // Toggle sort order
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };
  
  // Format the date from ISO format to a readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString; // Return as is if parsing fails
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Cancelled':
      case 'Booking Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bookings Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View, manage, and filter all customer bookings
          </p>
        </div>
        
        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name, product..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              {/* Toggle Advanced Filters */}
              <button
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                {isFiltersVisible ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={() => fetchBookings()}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {isFiltersVisible && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Booking Cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex-1 min-w-[150px]">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Start Date"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate ?? undefined}
                      placeholderText="End Date"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <button
                    onClick={handleDateFilterApply}
                    disabled={!startDate || !endDate}
                    className={`px-3 py-2 rounded text-white ${
                      !startDate || !endDate
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
                    }`}
                  >
                    Apply
                  </button>
                  {isDateFilterActive && (
                    <button
                      onClick={handleClearDateFilter}
                      className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Active Filters */}
        {(isDateFilterActive || status) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {isDateFilterActive && startDate && endDate && (
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center">
                <CalendarRange className="h-3.5 w-3.5 mr-1" />
                {formatDate(startDate.toISOString())} - {formatDate(endDate.toISOString())}
              </div>
            )}
            
            {status && (
              <div className={`px-3 py-1 rounded-full text-sm flex items-center ${getStatusColor(status)}`}>
                <Clock className="h-3.5 w-3.5 mr-1" />
                Status: {status}
              </div>
            )}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Bookings Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No bookings found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {search ? 'Try adjusting your search or filters' : 'There are no bookings that match your criteria'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('BookingID')}
                    >
                      <div className="flex items-center">
                        ID
                        {sortBy === 'BookingID' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('firstName')}
                    >
                      <div className="flex items-center">
                        Customer
                        {sortBy === 'firstName' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('product_name')}
                    >
                      <div className="flex items-center">
                        Product
                        {sortBy === 'product_name' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('Date')}
                    >
                      <div className="flex items-center">
                        Date & Time
                        {sortBy === 'Date' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('repair_status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortBy === 'repair_status' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {bookings.map((booking) => (
                    <tr 
                      key={booking.BookingID} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{booking.BookingID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {booking.firstName} {booking.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {booking.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {booking.product_name}
                        </div>
                        {booking.model && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Model: {booking.model}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(booking.Date)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {booking.Time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.repair_status)}`}>
                          {booking.repair_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/bookings/${booking.BookingID}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/bookings/edit/${booking.BookingID}`)}
                            className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                            title="Edit Booking"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && bookings.length > 0 && pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="ml-1">Previous</span>
                </button>
                <div className="text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsView;