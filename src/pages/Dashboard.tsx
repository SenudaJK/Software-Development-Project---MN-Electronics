import React, { useEffect, useState } from 'react';
import { Users, Wrench, Package, UserCog } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Dashboard = () => {
  const [username, setUsername] = useState('');

  // Retrieve the username from the 'employee' object in local storage
  useEffect(() => {
    const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
    if (employeeData.username) {
      setUsername(employeeData.username);
    }
  }, []);

  const stats = [
    { title: 'Total Customers', value: 124, icon: <Users className="h-6 w-6" />, color: 'bg-blue-500' },
    { title: 'Active Repairs', value: 38, icon: <Wrench className="h-6 w-6" />, color: 'bg-green-500' },
    { title: 'Total Products', value: 85, icon: <Package className="h-6 w-6" />, color: 'bg-purple-500' },
    { title: 'Employees', value: 12, icon: <UserCog className="h-6 w-6" />, color: 'bg-orange-500' },
  ];

  // Example data for charts
  const repairJobData = [
    { name: 'Completed', value: 50 },
    { name: 'In Progress', value: 30 },
    { name: 'Pending', value: 20 },
  ];

  const employeePerformanceData = [
    { name: 'John', jobsCompleted: 15 },
    { name: 'Jane', jobsCompleted: 20 },
    { name: 'Mike', jobsCompleted: 10 },
    { name: 'Sarah', jobsCompleted: 25 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Welcome Message */}
      <h1 className="text-2xl font-semibold mb-6">
        Welcome! {username}
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Repair Job Status</h2>
          <PieChart width={300} height={300}>
            <Pie
              data={repairJobData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {repairJobData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* Employee Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Employee Performance</h2>
          <BarChart
            width={500}
            height={300}
            data={employeePerformanceData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="jobsCompleted" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;