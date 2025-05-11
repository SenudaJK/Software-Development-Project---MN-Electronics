import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Users, Wrench, Package, UserCog, RefreshCw, AlertCircle, ChevronUp,
  ChevronDown, Calendar, Bell, Clock, Zap, ArrowRight, Filter,
  ShieldCheck, AlertTriangle, CalendarClock, ArrowUpRight, CheckCircle, XCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('week');
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [processingBooking, setProcessingBooking] = useState<number | null>(null);
  const [bookingActionSuccess, setBookingActionSuccess] = useState<{id: number, action: string} | null>(null);
  
  // State for dashboard data
  const [statsData, setStatsData] = useState({
    totalCustomers: 0,
    activeRepairs: 0,
    totalProducts: 0,
    totalEmployees: 0
  });
  const [repairJobData, setRepairJobData] = useState([]);
  const [employeePerformanceData, setEmployeePerformanceData] = useState([]);
  const [trendData, setTrendData] = useState<{ name: string; repairs: number; invoices: number }[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Retrieve user data and fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchPendingBookings();
    
    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchDashboardData(false);
      fetchPendingBookings();
    }, 300000);
    
    return () => clearInterval(intervalId);
  }, [timeframe]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (bookingActionSuccess) {
      const timer = setTimeout(() => {
        setBookingActionSuccess(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [bookingActionSuccess]);
  
  const fetchDashboardData = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    setError('');
    
    // Get employee data from session/local storage
    const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
    if (employeeData.username) {
      setUsername(employeeData.username);
    }
    
    try {
      // Fetch statistics data
      const statsResponse = await axios.get('http://localhost:5000/api/dashboard/stats');
      
      // Fetch repair job status data with timeframe
      const repairStatusResponse = await axios.get(`http://localhost:5000/api/dashboard/repair-status?timeframe=${timeframe}`);
      
      // Fetch employee performance data with timeframe
      const employeePerformanceResponse = await axios.get(`http://localhost:5000/api/dashboard/employee-performance?timeframe=${timeframe}`);
      
      // Create weekly trend data (would normally come from API)
      const trendData = generateTrendData();
      
      // Update states with fetched data
      setStatsData({
        totalCustomers: statsResponse.data.totalCustomers || 0,
        activeRepairs: statsResponse.data.activeRepairs || 0,
        totalProducts: statsResponse.data.totalProducts || 0,
        totalEmployees: statsResponse.data.totalEmployees || 0
      });
      
      setRepairJobData(repairStatusResponse.data || []);
      setEmployeePerformanceData(employeePerformanceResponse.data || []);
      setTrendData(trendData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const fetchPendingBookings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/bookings/status/pending');
      setPendingBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    }
  };
  
  // Handle booking status update (accept or cancel)
  const updateBookingStatus = async (e: React.MouseEvent, bookingId: number, status: string) => {
    e.stopPropagation(); // Prevent navigation when clicking button
    setProcessingBooking(bookingId);
    
    try {
      // Use status as 'Accepted' or 'Cancelled' to match the backend route expectations
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        status: status === 'accept' ? 'Accepted' : 'Cancelled'
      });
      
      // Update local state to remove the processed booking
      setPendingBookings(currentBookings => 
        currentBookings.filter(booking => booking.BookingID !== bookingId)
      );
      
      // Show success message
      setBookingActionSuccess({
        id: bookingId,
        action: status === 'accept' ? 'accepted' : 'cancelled'
      });
      
      // Refresh dashboard data to update stats
      fetchDashboardData(false);
      
    } catch (error) {
      console.error(`Error ${status}ing booking:`, error);
      setError(`Failed to ${status} booking. Please try again.`);
    } finally {
      setProcessingBooking(null);
    }
  };
  
  // Enhanced trend data with more realistic data generation and better typing
  const generateTrendData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Create more realistic data with trends
    let repairBase = Math.floor(Math.random() * 5) + 3; // Base value between 3-8
    let invoiceBase = Math.floor(Math.random() * 4) + 2; // Base value between 2-6
    
    return days.map((day, index) => {
      // Create a slight daily trend with weekday pattern (more on weekdays, less on weekends)
      const weekendFactor = (day === 'Sat' || day === 'Sun') ? 0.7 : 1.2;
      const dayFactor = 1 + (index * 0.1); // Slight increase through week
      
      const repairs = Math.max(1, Math.floor(repairBase * weekendFactor * (1 + Math.random() * 0.5)));
      const invoices = Math.max(1, Math.floor(invoiceBase * weekendFactor * (1 + Math.random() * 0.4)));
      
      return {
        name: day,
        repairs,
        invoices,
        total: repairs + invoices
      };
    });
  };
  
  // Define stats with trends based on fetched data
  const stats = [
    { 
      title: 'Total Customers', 
      value: statsData.totalCustomers, 
      icon: <Users className="h-6 w-6" />, 
      change: '+5.2%',
      trend: 'up',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600' 
    },
    { 
      title: 'Active Repairs', 
      value: statsData.activeRepairs, 
      icon: <Wrench className="h-6 w-6" />, 
      change: '+12.3%',
      trend: 'up',
      color: 'bg-gradient-to-br from-green-500 to-green-600' 
    },
    { 
      title: 'Total Products', 
      value: statsData.totalProducts, 
      icon: <Package className="h-6 w-6" />, 
      change: '+3.7%',
      trend: 'up',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600' 
    },
    { 
      title: 'Employees', 
      value: statsData.totalEmployees, 
      icon: <UserCog className="h-6 w-6" />, 
      change: '0%',
      trend: 'neutral',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600' 
    },
  ];

  // Time periods for filtering
  const timeframes = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <p className="font-medium text-gray-800 dark:text-gray-200">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.name === 'Jobs Completed' ? 'jobs' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, <span className="font-medium text-blue-600 dark:text-blue-400">{username || 'User'}</span>!
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              
              <button 
                onClick={() => fetchDashboardData(false)} 
                disabled={refreshing}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center transition-all"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* Timeframe filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">View data for:</span>
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`text-sm px-3 py-1.5 rounded-full ${
                  timeframe === tf.value 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-750'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Success Message */}
        {bookingActionSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>Booking successfully {bookingActionSuccess.action}!</p>
          </div>
        )}

        {/* Pending Bookings Alert */}
        {pendingBookings.length > 0 && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden">
            <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {pendingBookings.length} Pending Booking{pendingBookings.length !== 1 ? 's' : ''} Require Attention
              </h2>
              <button 
                onClick={() => navigate('/bookings')}
                className="text-sm text-amber-800 dark:text-amber-300 hover:underline flex items-center"
              >
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingBookings.slice(0, 3).map((booking) => (
                <div 
                  key={booking.BookingID}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 hover:shadow-md transition-all"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => navigate(`/bookings/${booking.BookingID}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {booking.firstName} {booking.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {booking.product_name} {booking.model ? `(${booking.model})` : ''}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                      {formatDate(booking.Date)} at {booking.Time}
                    </div>
                    
                    {booking.repair_description && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {booking.repair_description}
                      </p>
                    )}
                  </div>
                  
                  {/* Accept/Cancel Action Buttons */}
                  <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button 
                      onClick={(e) => updateBookingStatus(e, booking.BookingID, 'accept')}
                      disabled={processingBooking === booking.BookingID}
                      className="bg-green-50 hover:bg-green-100 border border-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800 text-green-700 dark:text-green-400 rounded-md py-1.5 text-sm font-medium flex items-center justify-center transition-colors"
                    >
                      {processingBooking === booking.BookingID ? (
                        <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      )}
                      Accept
                    </button>
                    <button 
                      onClick={(e) => updateBookingStatus(e, booking.BookingID, 'cancel')}
                      disabled={processingBooking === booking.BookingID}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md py-1.5 text-sm font-medium flex items-center justify-center transition-colors"
                    >
                      {processingBooking === booking.BookingID ? (
                        <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                      )}
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show "View More" button if there are more than 3 bookings */}
            {pendingBookings.length > 3 && (
              <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-800 text-center">
                <button
                  onClick={() => navigate('/bookings')}
                  className="text-amber-800 dark:text-amber-300 hover:underline text-sm font-medium"
                >
                  View {pendingBookings.length - 3} more pending bookings
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 overflow-hidden relative"
                >
                  <div className="flex items-center">
                    <div className={`${stat.color} rounded-full p-3 text-white mr-4`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                      
                      {/* Trend indicator */}
                      <div className={`flex items-center mt-1 text-sm ${
                        stat.trend === 'up' 
                          ? 'text-green-600 dark:text-green-400' 
                          : stat.trend === 'down' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {stat.trend === 'up' && <ChevronUp className="h-4 w-4 mr-1" />}
                        {stat.trend === 'down' && <ChevronDown className="h-4 w-4 mr-1" />}
                        {stat.change}
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative background element */}
                  <div className={`absolute right-0 top-0 h-full w-24 opacity-10 ${stat.color}`} 
                    style={{clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'}}></div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Repair Job Status Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    Repair Job Status
                  </h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {timeframes.find(tf => tf.value === timeframe)?.label}
                  </div>
                </div>
                
                {repairJobData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={repairJobData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={110}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        paddingAngle={2}
                      >
                        {repairJobData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={CustomTooltip} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                    <Package className="h-12 w-12 mb-3 opacity-40" />
                    <p className="text-center">No repair job data available</p>
                    <p className="text-sm mt-2 text-gray-400">Try selecting a different time period</p>
                  </div>
                )}
              </div>

              {/* Employee Performance Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Employee Performance
                  </h2>
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium px-2.5 py-1 rounded">
                    Jobs Completed
                  </div>
                </div>
                
                {employeePerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={employeePerformanceData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                      barSize={38}
                    >
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        tick={{ fill: '#666', fontSize: 12 }} 
                      />
                      <YAxis tick={{ fill: '#666', fontSize: 12 }} />
                      <Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                      <Bar 
                        name="Jobs Completed" 
                        dataKey="jobsCompleted" 
                        fill="#10b981" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                    <UserCog className="h-12 w-12 mb-3 opacity-40" />
                    <p className="text-center">No employee performance data available</p>
                    <p className="text-sm mt-2 text-gray-400">Try selecting a different time period</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Weekly Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-purple-500" />
                  Weekly Activity Trend
                </h2>
                <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium px-2.5 py-1 rounded">
                  Last 7 days
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="repairs" 
                    name="Repairs" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="invoices" 
                    name="Invoices" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Quick Access Section */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: 'New Repair', icon: <Wrench className="h-5 w-5" />, color: 'bg-blue-500', path: '/create-job' },
                { title: 'Add Customer', icon: <Users className="h-5 w-5" />, color: 'bg-green-500', path: '/customers' },
                { title: 'Warranty Claims', icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-purple-500', path: '/warranty-jobs' },
                { title: 'View Bookings', icon: <CalendarClock className="h-5 w-5" />, color: 'bg-amber-500', path: '/bookings' },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`${item.color} rounded-full p-3 text-white mb-3`}>
                      {item.icon}
                    </div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;