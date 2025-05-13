// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useReactToPrint } from 'react-to-print';
// import {
//   Calendar, 
//   FileText, 
//   Download, 
//   RefreshCw, 
//   Printer, 
//   Filter, 
//   ChevronDown,
//   BarChart2,
//   AlertCircle,
//   DollarSign,
//   Package,
//   Users,
//   UserCheck
// } from 'lucide-react';

// // Import report components
// import OverviewReport from './OverviewReport';
// import FinancialReport from './FinancialReport';
// import InventoryReport from './InventoryReport';
// import PerformanceReport from '../components/reports/PerformanceReport';
// import CustomerReport from '../components/reports/CustomerReport';

// // Define report types
// const REPORT_TYPES = [
//   { id: 'overview', name: 'Business Overview', icon: <BarChart2 size={18} />, color: 'blue' },
//   { id: 'financial', name: 'Financial Report', icon: <DollarSign size={18} />, color: 'green' },
//   { id: 'inventory', name: 'Inventory Report', icon: <Package size={18} />, color: 'purple' },
//   { id: 'performance', name: 'Employee Performance', icon: <UserCheck size={18} />, color: 'orange' },
//   { id: 'customer', name: 'Customer Analysis', icon: <Users size={18} />, color: 'pink' },
// ];

// const ReportsPage = () => {
//   // State variables
//   const [activeReport, setActiveReport] = useState('overview');
//   const [reportData, setReportData] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [dateRange, setDateRange] = useState({
//     startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0]
//   });
  
//   // Print reference
//   const printRef = useRef(null);
  
//   // Handle printing
//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     documentTitle: `MN Electronics - ${REPORT_TYPES.find(r => r.id === activeReport)?.name} Report`,
//   });
  
//   // Fetch report data when report type or date range changes
//   useEffect(() => {
//     fetchReport();
//   }, [activeReport, dateRange]);
  
//   // Function to fetch report data
//   const fetchReport = async () => {
//     setIsLoading(true);
//     setError('');
    
//     try {
//       let url = `http://localhost:5000/api/reports/${activeReport}`;
      
//       // Add query parameters for reports that accept date ranges
//       if (['financial', 'performance'].includes(activeReport)) {
//         url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
//       }
      
//       const response = await axios.get(url);
//       setReportData(response.data);
//     } catch (err: any) {
//       console.error(`Error fetching ${activeReport} report:`, err);
//       setError(err.response?.data?.error || `Failed to load ${activeReport} report.`);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   // Format currency
//   const formatCurrency = (value: number) => {
//     return `Rs. ${value.toFixed(2)}`;
//   };
  
//   // Render the appropriate report component based on active report
//   const renderReport = () => {
//     if (!reportData) return null;
    
//     switch (activeReport) {
//       case 'overview':
//         return <OverviewReport data={reportData} formatCurrency={formatCurrency} />;
//       case 'financial':
//         return <FinancialReport data={reportData} formatCurrency={formatCurrency} />;
//       case 'inventory':
//         return <InventoryReport data={reportData} formatCurrency={formatCurrency} />;
//       case 'performance':
//         return <PerformanceReport data={reportData} formatCurrency={formatCurrency} />;
//       case 'customer':
//         return <CustomerReport data={reportData} formatCurrency={formatCurrency} />;
//       default:
//         return <div>Select a report type</div>;
//     }
//   };
  
//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Page Header */}
//         <div className="mb-8">
//           <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
//             <FileText className="mr-2 h-6 w-6" /> 
//             Business Reports
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">
//             Generate and analyze business performance metrics
//           </p>
//         </div>
        
//         {/* Report Type Selection */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
//           <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
//             Select Report Type
//           </h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//             {REPORT_TYPES.map((report) => (
//               <button
//                 key={report.id}
//                 onClick={() => setActiveReport(report.id)}
//                 className={`
//                   flex flex-col items-center justify-center p-4 rounded-lg border transition-all
//                   ${activeReport === report.id 
//                     ? `bg-${report.color}-50 border-${report.color}-200 text-${report.color}-700 dark:bg-${report.color}-900/20 dark:border-${report.color}-800 dark:text-${report.color}-400` 
//                     : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750 dark:text-gray-400'}
//                 `}
//               >
//                 <div className={`p-2 rounded-full mb-2 ${activeReport === report.id ? `bg-${report.color}-100 dark:bg-${report.color}-900/30` : 'bg-gray-100 dark:bg-gray-700'}`}>
//                   {report.icon}
//                 </div>
//                 <span className="text-sm font-medium">{report.name}</span>
//               </button>
//             ))}
//           </div>
//         </div>
        
//         {/* Controls Bar */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-200 dark:border-gray-700">
//           {/* Date Range Selector */}
//           {['financial', 'performance'].includes(activeReport) && (
//             <div className="flex items-center space-x-4 w-full md:w-auto">
//               <div className="flex items-center">
//                 <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
//                 <span className="text-sm text-gray-600 dark:text-gray-400">Date Range:</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <input 
//                   type="date" 
//                   value={dateRange.startDate}
//                   onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
//                   className="border border-gray-300 dark:border-gray-600 rounded-md p-1.5 text-sm dark:bg-gray-700 dark:text-gray-300"
//                 />
//                 <span className="text-gray-500 dark:text-gray-400">to</span>
//                 <input 
//                   type="date" 
//                   value={dateRange.endDate}
//                   onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
//                   className="border border-gray-300 dark:border-gray-600 rounded-md p-1.5 text-sm dark:bg-gray-700 dark:text-gray-300"
//                 />
//               </div>
//             </div>
//           )}
          
//           {/* Action Buttons */}
//           <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
//             <button 
//               onClick={fetchReport}
//               className="px-3 py-2 flex items-center text-sm bg-gray-100 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-650"
//             >
//               <RefreshCw className={`h-4 w-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
//               {isLoading ? 'Loading...' : 'Refresh'}
//             </button>
            
//             <button 
//               onClick={handlePrint}
//               className="px-3 py-2 flex items-center text-sm bg-green-50 text-green-700 rounded-md border border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
//             >
//               <Printer className="h-4 w-4 mr-1.5" />
//               Print
//             </button>
            
//             <button 
//               className="px-3 py-2 flex items-center text-sm bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
//               onClick={() => {
//                 // Export to CSV logic would go here
//               }}
//             >
//               <Download className="h-4 w-4 mr-1.5" />
//               Export CSV
//             </button>
//           </div>
//         </div>
        
//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 flex items-center dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
//             <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
//             <p>{error}</p>
//           </div>
//         )}
        
//         {/* Report Content */}
//         {isLoading ? (
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 flex items-center justify-center">
//             <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mr-3" />
//             <p className="text-gray-600 dark:text-gray-400">Loading report data...</p>
//           </div>
//         ) : (
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
//             <div ref={printRef} className="printable-report p-6">
//               {/* Report Title */}
//               <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
//                 <h2 className="text-xl font-bold text-gray-800 dark:text-white">
//                   {REPORT_TYPES.find(r => r.id === activeReport)?.name}
//                 </h2>
//                 {reportData?.report_period && (
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                     {reportData.report_period.month || 
//                      `${reportData.report_period.start_date} to ${reportData.report_period.end_date}`}
//                   </p>
//                 )}
//               </div>
              
//               {/* Render the appropriate report */}
//               {renderReport()}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ReportsPage;