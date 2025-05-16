import React, { useState } from 'react';
import { CustomTabs } from '../components/ui/custom-tabs';
import OverviewReport from '../components/reports/OverviewReport';
import FinancialReport from '../components/reports/FinancialReport';
import InventoryReport from '../components/reports/InventoryReport';
import PerformanceReport from '../components/reports/PerformanceReport';
import CustomerReport from '../components/reports/CustomerReport';
import { BarChart3, DollarSign, Package, Users, UserCog } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      value: 'overview',
      label: 'Business Overview',
      icon: <BarChart3 className="h-5 w-5" />,
      colorScheme: 'blue' as const,
      content: <OverviewReport />
    },
    {
      value: 'financial',
      label: 'Financial Reports',
      icon: <DollarSign className="h-5 w-5" />,
      colorScheme: 'green' as const,
      content: <FinancialReport />
    },
    {
      value: 'inventory',
      label: 'Inventory Analytics',
      icon: <Package className="h-5 w-5" />,
      colorScheme: 'amber' as const,
      content: <InventoryReport />
    },
    {
      value: 'performance',
      label: 'Employee Performance',
      icon: <UserCog className="h-5 w-5" />,
      colorScheme: 'purple' as const,
      content: <PerformanceReport />
    },
    {
      value: 'customer',
      label: 'Customer Analysis',
      icon: <Users className="h-5 w-5" />,
      colorScheme: 'red' as const,
      content: <CustomerReport />
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Business Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analyze business performance through various metrics and statistics
          </p>
        </div>

        {/* Report tabs with horizontal navigation */}
        <div className="w-full">
          <CustomTabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            tabs={tabs}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
