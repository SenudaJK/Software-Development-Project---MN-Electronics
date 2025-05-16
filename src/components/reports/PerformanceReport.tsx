import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, AlertCircle, Award, Calendar, UserCog, TrendingUp } from 'lucide-react';
import { BarChart, LineChart } from './ReportCharts';

interface EmployeePerformance {
  employee_id: string;
  employee_name: string;
  role: string;
  assigned_jobs: number;
  completed_jobs: number;
  avg_completion_days: number;
  invoices_generated: number;
  revenue_generated: number;
  completion_rate: string;
  efficiency_score: string;
  avg_revenue_per_job: string;
}

interface PerformanceReportData {
  report_period: {
    start_date: string;
    end_date: string;
  };
  employee_performance: EmployeePerformance[];
  team_averages: {
    avg_completion_rate: string;
    avg_revenue_per_employee: string;
  };
}

const PerformanceReport: React.FC = () => {
  const [reportData, setReportData] = useState<PerformanceReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: ''
  });

  // Calculate default date range (current month)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setDateRange({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    });
  }, []);

  const fetchPerformanceReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:5000/api/reports/performance', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setReportData(response.data);
    } catch (err: any) {
      console.error('Error fetching performance report:', err);
      setError(err.response?.data?.error || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchPerformanceReport();
    }
  }, [dateRange.startDate, dateRange.endDate]);

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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading performance data...</p>
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

  // Prepare chart data
  const prepareCompletionRateData = () => {
    if (!reportData) return null;
    
    const sortedEmployees = [...reportData.employee_performance]
      .sort((a, b) => parseFloat(a.completion_rate) - parseFloat(b.completion_rate));
    
    return {
      labels: sortedEmployees.map(employee => employee.employee_name),
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: sortedEmployees.map(employee => parseFloat(employee.completion_rate)),
          backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
        {
          label: 'Team Average (%)',
          data: sortedEmployees.map(() => parseFloat(reportData.team_averages.avg_completion_rate)),
          type: 'line',
          fill: false,
          backgroundColor: 'rgba(234, 88, 12, 0.6)', // orange
          borderColor: 'rgba(234, 88, 12, 1)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
        }
      ],
    };
  };

  const prepareRevenueData = () => {
    if (!reportData) return null;
    
    const sortedEmployees = [...reportData.employee_performance]
      .sort((a, b) => a.revenue_generated - b.revenue_generated);
    
    return {
      labels: sortedEmployees.map(employee => employee.employee_name),
      datasets: [
        {
          label: 'Revenue Generated (LKR)',
          data: sortedEmployees.map(employee => employee.revenue_generated),
          backgroundColor: 'rgba(16, 185, 129, 0.6)', // green
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        },
        {
          label: 'Team Average (LKR)',
          data: sortedEmployees.map(() => parseFloat(reportData.team_averages.avg_revenue_per_employee)),
          type: 'line',
          fill: false,
          backgroundColor: 'rgba(234, 88, 12, 0.6)', // orange
          borderColor: 'rgba(234, 88, 12, 1)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
        }
      ],
    };
  };

  const prepareJobCompletionData = () => {
    if (!reportData) return null;
    
    return {
      labels: reportData.employee_performance.map(employee => employee.employee_name),
      datasets: [
        {
          label: 'Assigned Jobs',
          data: reportData.employee_performance.map(employee => employee.assigned_jobs),
          backgroundColor: 'rgba(156, 163, 175, 0.6)', // gray
          borderColor: 'rgba(156, 163, 175, 1)',
          borderWidth: 1,
        },
        {
          label: 'Completed Jobs',
          data: reportData.employee_performance.map(employee => employee.completed_jobs),
          backgroundColor: 'rgba(5, 150, 105, 0.6)', // emerald
          borderColor: 'rgba(5, 150, 105, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const completionRateData = prepareCompletionRateData();
  const revenueData = prepareRevenueData();
  const jobCompletionData = prepareJobCompletionData();

  // Find top performer
  const findTopPerformer = () => {
    if (!reportData || !reportData.employee_performance.length) return null;
    
    return reportData.employee_performance.reduce((top, current) => {
      return (current.completed_jobs > top.completed_jobs) ? current : top;
    });
  };

  const topPerformer = findTopPerformer();

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Employee Performance Report
          </h2>
          {reportData && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Period: {new Date(reportData.report_period.start_date).toLocaleDateString()} to {new Date(reportData.report_period.end_date).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              onClick={fetchPerformanceReport}
              className="mt-5 px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Performance summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Team Completion Rate */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Completion Rate</h3>
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <UserCog className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {reportData.team_averages.avg_completion_rate}
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                Team average job completion rate
              </div>
            </div>

            {/* Top Performer */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Performer</h3>
                <div className="bg-amber-100 p-2 rounded-full text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200 truncate">
                {topPerformer?.employee_name || 'None'}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{topPerformer?.completed_jobs || 0} Jobs Completed</span>
                <span>{topPerformer?.completion_rate || '0%'} Completion Rate</span>
              </div>
            </div>

            {/* Average Revenue */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Revenue Per Employee</h3>
                <div className="bg-green-100 p-2 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(parseFloat(reportData.team_averages.avg_revenue_per_employee))}
              </div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                Average revenue generated per employee
              </div>
            </div>
          </div>

          {/* Period selector */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Report Period: {new Date(reportData.report_period.start_date).toLocaleDateString()} - {new Date(reportData.report_period.end_date).toLocaleDateString()}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  
                  setDateRange({
                    startDate: firstDay.toISOString().split('T')[0],
                    endDate: lastDay.toISOString().split('T')[0]
                  });
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                This Month
              </button>
              <button 
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                  const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
                  
                  setDateRange({
                    startDate: firstDay.toISOString().split('T')[0],
                    endDate: lastDay.toISOString().split('T')[0]
                  });
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Last Month
              </button>
              <button 
                onClick={() => {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), 0, 1);
                  const lastDay = new Date(now.getFullYear(), 11, 31);
                  
                  setDateRange({
                    startDate: firstDay.toISOString().split('T')[0],
                    endDate: lastDay.toISOString().split('T')[0]
                  });
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                This Year
              </button>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Completion Rate</h3>
              {completionRateData && <BarChart data={completionRateData} height={250} />}
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Revenue Generated</h3>
              {revenueData && <BarChart data={revenueData} height={250} />}
            </div>
          </div>

          {/* Additional charts */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Job Assignment & Completion</h3>
            {jobCompletionData && <BarChart data={jobCompletionData} height={300} />}
          </div>

          {/* Employee performance table */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Employee Performance Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Assigned Jobs
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Completed Jobs
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Completion Rate
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Avg. Completion Days
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Revenue Generated
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Avg Revenue/Job
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Efficiency Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.employee_performance.map((employee) => (
                    <tr key={employee.employee_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                        {employee.employee_name}
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{employee.role}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {employee.assigned_jobs}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {employee.completed_jobs}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: employee.completion_rate }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {employee.completion_rate}
                          </span>
                        </div>
                      </td>                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {employee.avg_completion_days != null && typeof employee.avg_completion_days === 'number' 
                          ? employee.avg_completion_days.toFixed(1) 
                          : typeof employee.avg_completion_days === 'string' 
                            ? parseFloat(employee.avg_completion_days).toFixed(1)
                            : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                        {formatCurrency(employee.revenue_generated)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(parseFloat(employee.avg_revenue_per_job))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            parseFloat(employee.efficiency_score) >= 90
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : parseFloat(employee.efficiency_score) >= 70
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : parseFloat(employee.efficiency_score) >= 50
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {employee.efficiency_score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceReport;
