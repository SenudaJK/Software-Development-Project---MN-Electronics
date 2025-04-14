import React, { useEffect, useState } from 'react';
import { Users, Wrench, Package, UserCog } from 'lucide-react';

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
    { title: 'Total Customers', value: '124', icon: <Users className="h-6 w-6" />, color: 'bg-blue-500' },
    { title: 'Active Repairs', value: '38', icon: <Wrench className="h-6 w-6" />, color: 'bg-green-500' },
    { title: 'Total Products', value: '85', icon: <Package className="h-6 w-6" />, color: 'bg-purple-500' },
    { title: 'Employees', value: '12', icon: <UserCog className="h-6 w-6" />, color: 'bg-orange-500' },
  ];

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

      {/* Recent Repair Jobs and Employee Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Repair Jobs</h2>
          {/* Add table or list of recent repair jobs */}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Employee Performance</h2>
          {/* Add employee performance metrics */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;