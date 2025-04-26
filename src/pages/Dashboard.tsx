import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Wrench, Package, UserCog, RefreshCw, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for dashboard data
  const [statsData, setStatsData] = useState({
    totalCustomers: 0,
    activeRepairs: 0,
    totalProducts: 0,
    totalEmployees: 0
  });
  const [repairJobData, setRepairJobData] = useState([]);
  const [employeePerformanceData, setEmployeePerformanceData] = useState([]);
  
  // Retrieve user data and fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      
      // Get employee data from session/local storage
      const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
      if (employeeData.username) {
        setUsername(employeeData.username);
      }
      
      try {
        // Fetch statistics data
        const statsResponse = await axios.get('http://localhost:5000/api/dashboard/stats');
        
        // Fetch repair job status data
        const repairStatusResponse = await axios.get('http://localhost:5000/api/dashboard/repair-status');
        
        // Fetch employee performance data
        const employeePerformanceResponse = await axios.get('http://localhost:5000/api/dashboard/employee-performance');
        
        // Update states with fetched data
        setStatsData({
          totalCustomers: statsResponse.data.totalCustomers || 0,
          activeRepairs: statsResponse.data.activeRepairs || 0,
          totalProducts: statsResponse.data.totalProducts || 0,
          totalEmployees: statsResponse.data.totalEmployees || 0
        });
        
        setRepairJobData(repairStatusResponse.data || []);
        setEmployeePerformanceData(employeePerformanceResponse.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Define stats based on fetched data
  const stats = [
    { title: 'Total Customers', value: statsData.totalCustomers, icon: <Users className="h-6 w-6" />, color: 'bg-blue-500' },
    { title: 'Active Repairs', value: statsData.activeRepairs, icon: <Wrench className="h-6 w-6" />, color: 'bg-green-500' },
    { title: 'Total Products', value: statsData.totalProducts, icon: <Package className="h-6 w-6" />, color: 'bg-purple-500' },
    { title: 'Employees', value: statsData.totalEmployees, icon: <UserCog className="h-6 w-6" />, color: 'bg-orange-500' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Message */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            Welcome, {username || 'User'}!
          </h1>
          
          {/* Last updated indicator */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <div className={`${stat.color} rounded-full p-3 text-white mr-4`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-semibold">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Repair Job Status Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Repair Job Status</h2>
                {repairJobData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={repairJobData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {repairJobData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} jobs`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No repair job data available
                  </div>
                )}
              </div>

              {/* Employee Performance Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Employee Performance</h2>
                {employeePerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={employeePerformanceData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 25,
                      }}
                    >
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="Jobs Completed" dataKey="jobsCompleted" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    No employee performance data available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;