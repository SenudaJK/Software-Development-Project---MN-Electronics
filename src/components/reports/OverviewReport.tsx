import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, DoughnutChart, LineChart } from './ReportCharts';
import PrintReportButton from './PrintReportButton';

interface OverviewReportData {
  report_period: {
    month: string;
    start_date: string;
    end_date: string;
  };
  repair_statistics: {
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
    completion_rate: number;
  };
  financial_metrics: {
    monthly_revenue: number;
    invoice_count: number;
    average_invoice: number;
    revenue_growth_percentage: number;
    previous_month_revenue: number;
  };
  top_repairs: Array<{
    repair_description: string;
    count: number;
  }>;
  top_technicians: Array<{
    technician_name: string;
    completed_jobs: number;
  }>;
}

const OverviewReport: React.FC = () => {
  const [reportData, setReportData] = useState<OverviewReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchOverviewReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:5000/api/reports/overview');
      setReportData(response.data);
    } catch (err: any) {
      console.error('Error fetching overview report:', err);
      setError(err.response?.data?.error || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="flex flex-col items-center">
          <RefreshCw className="animate-spin h-10 w-10 text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
        No report data available.
      </div>
    );
  }

  // Prepare chart data
  const repairStatusData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        label: 'Repair Status',
        data: [
          reportData.repair_statistics.completed,
          reportData.repair_statistics.in_progress,
          reportData.repair_statistics.pending
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)', // green
          'rgba(59, 130, 246, 0.6)', // blue
          'rgba(245, 158, 11, 0.6)', // amber
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const topRepairsData = {
    labels: reportData.top_repairs.map(repair => repair.repair_description),
    datasets: [
      {
        label: 'Repair Count',
        data: reportData.top_repairs.map(repair => repair.count),
        backgroundColor: 'rgba(99, 102, 241, 0.6)', // indigo
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topTechniciansData = {
    labels: reportData.top_technicians.map(tech => tech.technician_name),
    datasets: [
      {
        label: 'Completed Jobs',
        data: reportData.top_technicians.map(tech => tech.completed_jobs),
        backgroundColor: 'rgba(139, 92, 246, 0.6)', // purple
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(value);
  };
  return (
    <div ref={reportRef}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Business Overview Report
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Period: {reportData.report_period.month}
          </p>
        </div>        <div className="flex gap-2 print-hide">
          <button
            onClick={fetchOverviewReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Report
          </button>
          <PrintReportButton 
            reportRef={reportRef} 
            reportType="Business Overview" 
          />
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</h3>
            <div 
              className={`flex items-center ${
                reportData.financial_metrics.revenue_growth_percentage >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {reportData.financial_metrics.revenue_growth_percentage >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="ml-1">{reportData.financial_metrics.revenue_growth_percentage}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {formatCurrency(reportData.financial_metrics.monthly_revenue)}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Previous: {formatCurrency(reportData.financial_metrics.previous_month_revenue)}
          </p>
        </div>

        {/* Repair Status Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Repair Completion</h3>
            <div className="text-blue-600 dark:text-blue-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {reportData.repair_statistics.completion_rate}%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {reportData.repair_statistics.completed} of {reportData.repair_statistics.total} jobs completed
          </p>
        </div>

        {/* Invoice Count Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invoices</h3>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {reportData.financial_metrics.invoice_count}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Avg. {formatCurrency(reportData.financial_metrics.average_invoice)} per invoice
          </p>
        </div>

        {/* Jobs Status Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Jobs Status</h3>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {reportData.repair_statistics.total}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="text-green-600 dark:text-green-400">
              {reportData.repair_statistics.completed} Completed
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              {reportData.repair_statistics.in_progress} In Progress
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              {reportData.repair_statistics.pending} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Repair Status */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Repair Status</h3>
          <DoughnutChart data={repairStatusData} height={250} />
        </div>

        {/* Top Repairs */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Top Repair Types</h3>
          <BarChart data={topRepairsData} height={250} />
        </div>

        {/* Top Technicians */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Top Technicians</h3>
          <BarChart data={topTechniciansData} height={250} />
        </div>
      </div>
    </div>
  );
};

export default OverviewReport;
