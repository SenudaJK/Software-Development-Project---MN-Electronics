import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { LucideIcon } from 'lucide-react';

interface CustomTabProps {
  value: string;
  icon?: React.ReactNode;
  label: string;
  activeValue: string;
  colorScheme?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
}

interface CustomTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
    colorScheme?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
    content: React.ReactNode;
  }>;
}

const getColorClasses = (colorScheme: string, isActive: boolean) => {
  const colorMap: Record<string, string> = {
    blue: isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : '',
    green: isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : '',
    amber: isActive ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : '',
    purple: isActive ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : '',
    red: isActive ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : '',
  };

  return colorMap[colorScheme] || colorMap.blue;
};

const CustomTab: React.FC<CustomTabProps> = ({ value, icon, label, activeValue, colorScheme = 'blue' }) => {
  const isActive = value === activeValue;
  const colorClasses = getColorClasses(colorScheme, isActive);
  
  return (
    <TabsTrigger 
      value={value} 
      className={`flex items-center gap-2 px-4 py-3 rounded-md whitespace-nowrap ${colorClasses} ${
        !isActive && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      }`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="text-sm">{label}</span>
    </TabsTrigger>
  );
};

export const CustomTabs: React.FC<CustomTabsProps> = ({ value, onValueChange, tabs }) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <TabsList className="flex space-x-4 bg-transparent">
          {tabs.map((tab) => (
            <CustomTab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
              activeValue={value}
              colorScheme={tab.colorScheme}
            />
          ))}
        </TabsList>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};