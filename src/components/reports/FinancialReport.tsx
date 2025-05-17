import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, AlertCircle, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { BarChart, LineChart, PieChart } from './ReportCharts';
import PrintReportButton from './PrintReportButton';

interface FinancialReportData {
  report_period: {
    period: string;
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_expenses: number;
    profit: number;
    profit_margin: string;
  };
  expense_breakdown: {
    inventory: number;
    salaries: number;
  };
  revenue_by_service: Array<{
    repair_description: string;
    invoice_count: number;
    total_revenue: number;
  }>;
  monthly_trends: Array<{
    month: string;
    invoice_count: number;
    monthly_revenue: number;
  }>;
}

const FinancialReport: React.FC = () => {
  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: ''
  });
  const reportRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<string>('month');

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

  const fetchFinancialReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:5000/api/reports/financial', {
        params: {
          period,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setReportData(response.data);
    } catch (err: any) {
      console.error('Error fetching financial report:', err);
      setError(err.response?.data?.error || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchFinancialReport();
    }
  }, [dateRange.startDate, dateRange.endDate, period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    
    // Adjust date range based on selected period
    const now = new Date();
    let startDate, endDate;
    
    switch(newPeriod) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        endDate = new Date(now.getFullYear(), quarterMonth + 3, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading financial data...</p>
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
  const prepareRevenueByServiceData = () => {
    if (!reportData) return null;
    
    return {
      labels: reportData.revenue_by_service.map(item => item.repair_description),
      datasets: [
        {
          label: 'Revenue (LKR)',
          data: reportData.revenue_by_service.map(item => item.total_revenue),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareMonthlyTrendsData = () => {
    if (!reportData) return null;
    
    return {
      labels: reportData.monthly_trends.map(item => {
        // Convert YYYY-MM to MMM YYYY format
        const [year, month] = item.month.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      datasets: [
        {
          label: 'Monthly Revenue (LKR)',
          data: reportData.monthly_trends.map(item => item.monthly_revenue),
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4,
        },
      ],
    };
  };

  const prepareExpenseBreakdownData = () => {
    if (!reportData) return null;
    
    return {
      labels: ['Inventory', 'Salaries'],
      datasets: [
        {
          label: 'Expenses (LKR)',
          data: [reportData.expense_breakdown.inventory, reportData.expense_breakdown.salaries],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const revenueByServiceData = prepareRevenueByServiceData();
  const monthlyTrendsData = prepareMonthlyTrendsData();
  const expenseBreakdownData = prepareExpenseBreakdownData();
  return (
    <div ref={reportRef}>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Financial Reports
          </h2>
          {reportData && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Period: {reportData.report_period.start_date} to {reportData.report_period.end_date}
            </p>
          )}
        </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4 print-hide">
          {/* Period selector */}
          <div className="flex">
            <button
              onClick={() => handlePeriodChange('month')}
              className={`px-3 py-2 rounded-l-lg ${
                period === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handlePeriodChange('quarter')}
              className={`px-3 py-2 ${
                period === 'quarter' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => handlePeriodChange('year')}
              className={`px-3 py-2 rounded-r-lg ${
                period === 'year' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Year
            </button>
          </div>
          
          {/* Custom date range */}
          <div className="flex items-center gap-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">Start</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400">End</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="p-2 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>            <div className="flex gap-2 mt-5">
              <button
                onClick={fetchFinancialReport}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <PrintReportButton 
                reportRef={reportRef} 
                reportType="Financial" 
              />
            </div>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Key financial metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Revenue Card */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
                <div className="bg-green-100 p-2 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(reportData.summary.total_revenue)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                From {reportData.revenue_by_service.length} service types
              </p>
            </div>

            {/* Expenses Card */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</h3>
                <div className="bg-red-100 p-2 rounded-full text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(reportData.summary.total_expenses)}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Inventory: {formatCurrency(reportData.expense_breakdown.inventory)}</span>
                <span>Salaries: {formatCurrency(reportData.expense_breakdown.salaries)}</span>
              </div>
            </div>

            {/* Profit Card */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</h3>
                <div className={`p-2 rounded-full ${
                  reportData.summary.profit >= 0
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                reportData.summary.profit >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(reportData.summary.profit)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Profit margin: {reportData.summary.profit_margin}
              </p>
            </div>

            {/* Period Card */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Report Period</h3>
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {new Date(reportData.report_period.start_date).toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric'
                })} - {new Date(reportData.report_period.end_date).toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                {reportData.report_period.period} report
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue by Service */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Revenue by Service Type</h3>
              {revenueByServiceData && <BarChart data={revenueByServiceData} height={250} />}
            </div>

            {/* Monthly Trends */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Monthly Revenue Trends</h3>
              {monthlyTrendsData && <LineChart data={monthlyTrendsData} height={250} />}
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Expense Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Expense Breakdown</h3>
              {expenseBreakdownData && <PieChart data={expenseBreakdownData} height={250} />}
            </div>

            {/* Revenue vs Expenses */}
            <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Revenue vs Expenses</h3>
              <div className="h-[250px] flex justify-center items-center">
                <div className="w-full max-w-md">
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(reportData.summary.total_revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expenses</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(reportData.summary.total_expenses)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-red-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (reportData.summary.total_expenses / reportData.summary.total_revenue) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profit</span>
                      <span className={`text-sm font-medium ${
                        reportData.summary.profit >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(reportData.summary.profit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className={`${
                          reportData.summary.profit >= 0
                            ? 'bg-blue-600'
                            : 'bg-red-600'
                        } h-2.5 rounded-full`} 
                        style={{ 
                          width: `${Math.min(100, Math.abs(reportData.summary.profit / reportData.summary.total_revenue) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Table */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Revenue by Service Type</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Service Type
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Invoices
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Avg. Revenue
                    </th>
                    <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reportData.revenue_by_service.map((service, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                        {service.repair_description}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {service.invoice_count}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(service.total_revenue)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(service.total_revenue / service.invoice_count)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {((service.total_revenue / reportData.summary.total_revenue) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      Total
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      {reportData.revenue_by_service.reduce((sum, service) => sum + service.invoice_count, 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(reportData.summary.total_revenue)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(reportData.summary.total_revenue / 
                        reportData.revenue_by_service.reduce((sum, service) => sum + service.invoice_count, 0)
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialReport;
