import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, AlertCircle, Users, Heart, Repeat, Clock } from 'lucide-react';
import { BarChart, DoughnutChart, PieChart } from './ReportCharts';
import PrintReportButton from './PrintReportButton';

interface TopCustomer {
  id: string;
  customer_name: string;
  email: string;
  total_jobs: number;
  total_spent: number;
  last_visit: string;
}

interface CommonRepair {
  repair_description: string;
  count: number;
}

interface CustomerReportData {
  customer_statistics: {
    total_customers: number;
    returning_customers: number;
    retention_rate: string;
  };
  top_customers: TopCustomer[];
  common_repairs: CommonRepair[];
}

const CustomerReport: React.FC = () => {
  const [reportData, setReportData] = useState<CustomerReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchCustomerReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:5000/api/reports/customer');
      setReportData(response.data);
    } catch (err: any) {
      console.error('Error fetching customer report:', err);
      setError(err.response?.data?.error || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerReport();
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(value);
  };

  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="flex flex-col items-center">
          <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading customer data...</p>
        </div>
      </div>
    );
  }

  if (error && !reportData) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-red-700 dark:text-red-300">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md flex items-center text-gray-700 dark:text-gray-300">
        No customer data available.
      </div>
    );
  }

  // Prepare chart data
  const prepareCustomerRetentionData = () => {
    return {
      labels: ['Returning Customers', 'One-time Customers'],
      datasets: [
        {
          data: [
            reportData.customer_statistics.returning_customers,
            reportData.customer_statistics.total_customers - reportData.customer_statistics.returning_customers
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)', // blue
            'rgba(156, 163, 175, 0.6)', // gray
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(156, 163, 175, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareCommonRepairsData = () => {
    return {
      labels: reportData.common_repairs.map(repair => repair.repair_description),
      datasets: [
        {
          label: 'Repair Count',
          data: reportData.common_repairs.map(repair => repair.count),
          backgroundColor: [
            'rgba(16, 185, 129, 0.6)', // green
            'rgba(245, 158, 11, 0.6)', // amber
            'rgba(99, 102, 241, 0.6)', // indigo
            'rgba(236, 72, 153, 0.6)', // pink
            'rgba(14, 165, 233, 0.6)', // sky
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(99, 102, 241, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(14, 165, 233, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareCustomerSpendingData = () => {
    return {
      labels: reportData.top_customers.slice(0, 5).map(customer => customer.customer_name),
      datasets: [
        {
          label: 'Total Spent (LKR)',
          data: reportData.top_customers.slice(0, 5).map(customer => customer.total_spent),
          backgroundColor: 'rgba(79, 70, 229, 0.6)', // indigo
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const customerRetentionData = prepareCustomerRetentionData();
  const commonRepairsData = prepareCommonRepairsData();
  const customerSpendingData = prepareCustomerSpendingData();
  return (
    <div ref={reportRef}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Customer Analysis Report
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Customer retention and spending patterns
          </p>
        </div>        <div className="mt-2 sm:mt-0 flex gap-2 print-hide">
          <button
            onClick={fetchCustomerReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Report
          </button>
          <PrintReportButton 
            reportRef={reportRef} 
            reportType="Customer Analysis" 
          />
        </div>
      </div>

      {/* Customer statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</h3>
            <div className="bg-blue-100 p-2 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {reportData.customer_statistics.total_customers}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total customers in database
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Retention</h3>
            <div className="bg-green-100 p-2 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Repeat className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {reportData.customer_statistics.retention_rate}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {reportData.customer_statistics.returning_customers} returning customers
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Repair Type</h3>
            <div className="bg-amber-100 p-2 rounded-full text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
            {reportData.common_repairs[0]?.repair_description || 'None'}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {reportData.common_repairs[0]?.count || 0} repairs recorded
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Customer Retention</h3>
          <div className="h-64">
            <DoughnutChart data={customerRetentionData} height={250} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{reportData.customer_statistics.retention_rate}</span> of customers return for additional services
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Most Common Repair Types</h3>
          <div className="h-64">
            <PieChart data={commonRepairsData} height={250} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Top Customer Spending</h3>
        <BarChart data={customerSpendingData} height={300} />
      </div>

      {/* Top customers table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Top Customers by Revenue</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Jobs
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Avg. Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reportData.top_customers.map((customer) => {
                // Calculate days since last visit
                const lastVisitDate = new Date(customer.last_visit);
                const today = new Date();
                const daysSinceLastVisit = Math.floor(
                  (today.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      {customer.customer_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {customer.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {customer.total_jobs}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(customer.total_spent)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                        <span>
                          {new Date(customer.last_visit).toLocaleDateString()}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            ({daysSinceLastVisit} days ago)
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(customer.total_spent / customer.total_jobs)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common repairs breakdown */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Common Repair Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {reportData.common_repairs.map((repair, index) => (
            <div 
              key={index} 
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                {repair.count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                {repair.repair_description}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-600">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.floor((repair.count / reportData.common_repairs[0].count) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer insights */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Customer Insights & Recommendations</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Retention Strategy</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              With a {reportData.customer_statistics.retention_rate} retention rate, focus on increasing repeat business through follow-up 
              service reminders and loyalty programs. Target the {reportData.customer_statistics.total_customers - reportData.customer_statistics.returning_customers} one-time 
              customers with special offers.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Service Specialization</h4>
            <p className="text-sm text-green-700 dark:text-green-400">
              The most common repair type is "{reportData.common_repairs[0]?.repair_description}" with {reportData.common_repairs[0]?.count} repairs. 
              Consider specializing technicians in this area and stocking relevant inventory to optimize service delivery.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">VIP Customers</h4>
            <p className="text-sm text-purple-700 dark:text-purple-400">
              Your top customer ({reportData.top_customers[0]?.customer_name}) has spent {formatCurrency(reportData.top_customers[0]?.total_spent)} across {reportData.top_customers[0]?.total_jobs} jobs. 
              Consider creating a VIP program for your top 10 customers who contribute significantly to revenue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReport;
