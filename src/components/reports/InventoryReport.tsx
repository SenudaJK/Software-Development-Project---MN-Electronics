import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { RefreshCw, AlertCircle, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, DoughnutChart, PieChart } from './ReportCharts';
import PrintReportButton from './PrintReportButton';

interface InventoryItem {
  inventory_id: string;
  product_name: string;
  description: string;
  current_stock: number;
  stock_limit: number;
  avg_unit_cost: number;
  total_purchased: number;
}

interface TopUsedPart {
  product_name: string;
  used_in_jobs: number;
}

interface PurchaseSummary {
  month: string;
  total_purchased: number;
  total_cost: number;
}

interface InventoryReportData {
  summary: {
    total_inventory_value: string;
    total_items: number;
    low_stock_count: number;
    last_updated: string;
  };
  low_stock_items: InventoryItem[];
  inventory_status: InventoryItem[];
  most_used_parts: TopUsedPart[];
  purchase_summary: PurchaseSummary[];
}

const InventoryReport: React.FC = () => {
  const [reportData, setReportData] = useState<InventoryReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchInventoryReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:5000/api/reports/inventory');
      setReportData(response.data);
    } catch (err: any) {
      console.error('Error fetching inventory report:', err);
      setError(err.response?.data?.error || 'Failed to fetch inventory report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryReport();
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading inventory data...</p>
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
        No inventory data available.
      </div>
    );
  }
  
  // Prepare chart data
  const prepareStockLevelData = () => {
    // Group items by stock status
    const lowStockCount = reportData.low_stock_items.length;
    const adequateStockCount = reportData.inventory_status.length - lowStockCount;
    
    return {
      labels: ['Low Stock', 'Adequate Stock'],
      datasets: [
        {
          data: [lowStockCount, adequateStockCount],
          backgroundColor: [
            'rgba(239, 68, 68, 0.6)', // red
            'rgba(34, 197, 94, 0.6)', // green
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(34, 197, 94, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareMostUsedPartsData = () => {
    return {
      labels: reportData.most_used_parts.map(part => part.product_name),
      datasets: [
        {
          label: 'Used in Jobs',
          data: reportData.most_used_parts.map(part => part.used_in_jobs),
          backgroundColor: 'rgba(99, 102, 241, 0.6)', // indigo
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  const preparePurchaseHistoryData = () => {
    return {
      labels: reportData.purchase_summary.map(entry => entry.month),
      datasets: [
        {
          label: 'Purchase Count',
          data: reportData.purchase_summary.map(entry => entry.total_purchased),
          backgroundColor: 'rgba(59, 130, 246, 0.6)', // blue
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Total Cost (LKR)',
          data: reportData.purchase_summary.map(entry => entry.total_cost),
          backgroundColor: 'rgba(16, 185, 129, 0.6)', // emerald
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y1',
        }
      ],
    };
  };

  const stockLevelData = prepareStockLevelData();
  const mostUsedPartsData = prepareMostUsedPartsData();

  return (
    <div ref={reportRef}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Inventory Report
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current status and usage statistics for inventory items
          </p>
          {reportData.summary.last_updated && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Last updated: {new Date(reportData.summary.last_updated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="mt-2 sm:mt-0 flex gap-2">
          <button
            onClick={fetchInventoryReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Report
          </button>
          <PrintReportButton 
            reportRef={reportRef} 
            reportType="Inventory" 
          />
        </div>
      </div>

      {/* Inventory summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Inventory Value</h3>
            <div className="bg-blue-100 p-2 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {formatCurrency(parseFloat(reportData.summary.total_inventory_value))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Based on average unit costs
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</h3>
            <div className="bg-green-100 p-2 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {reportData.summary.total_items}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Different items in inventory
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Items</h3>
            <div className="bg-amber-100 p-2 rounded-full text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {reportData.summary.low_stock_count}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Items below stock limit
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Stock Level Status</h3>
          <DoughnutChart data={stockLevelData} height={250} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Most Used Parts</h3>
          <BarChart data={mostUsedPartsData} height={250} />
        </div>
      </div>

      {/* Low stock alert section */}
      {reportData.low_stock_items.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" />
            <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">
              Low Stock Alert
            </h3>
          </div>
          
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
            The following items are below their stock limits and should be restocked soon.
          </p>
          <ul className="space-y-2">
            {reportData.low_stock_items.map((item) => (
              <li key={item.inventory_id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{item.product_name}</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                    Current: <span className="font-medium text-red-600 dark:text-red-400">{item.current_stock}</span>
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stock limit: <span className="font-medium">{item.stock_limit}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Purchase History Section - Chart only, table removed */}
      {reportData.purchase_summary && reportData.purchase_summary.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Purchase History</h3>
          
          <div className="h-64">
            <BarChart 
              data={preparePurchaseHistoryData()} 
              height={180}
              options={{
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Items Purchased'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Total Cost (LKR)'
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReport;
