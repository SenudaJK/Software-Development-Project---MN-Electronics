import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, CreditCard, FileText, Calendar, User, Package, X, Printer } from "lucide-react";

const ViewAdvancePayments: React.FC = () => {
  const [advancePayments, setAdvancePayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({
    key: "Paid_At",
    direction: "desc"
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdvancePayments();
  }, []);

  useEffect(() => {
    if (advancePayments.length > 0) {
      let filtered = [...advancePayments];

      // Apply status filter
      if (filterStatus !== "all") {
        filtered = filtered.filter(payment => payment.repair_status === filterStatus);
      }

      // Apply search filter
      if (searchTerm) {
        const lowercasedSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(payment => 
          payment.Customer_Name?.toLowerCase().includes(lowercasedSearch) ||
          payment.Job_ID?.toString().includes(lowercasedSearch) ||
          payment.product_name?.toLowerCase().includes(lowercasedSearch) ||
          payment.model?.toLowerCase().includes(lowercasedSearch) ||
          payment.repair_description?.toLowerCase().includes(lowercasedSearch) ||
          payment.Advance_Amount?.toString().includes(lowercasedSearch)
        );
      }

      // Apply sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        });
      }

      setFilteredPayments(filtered);
    }
  }, [advancePayments, searchTerm, sortConfig, filterStatus]);

  const fetchAdvancePayments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/invoices/view-advance-payments");
      setAdvancePayments(response.data);
      setError("");
    } catch (err: any) {
      console.error("Error fetching advance payments:", err);
      setError(err.response?.data?.message || "Failed to fetch advance payments.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    }
    return <ChevronDown size={16} className="text-gray-300" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleRowClick = async (payment: any) => {
    try {
      // Fetch detailed payment information including job details
      const response = await axios.get(`http://localhost:5000/api/invoices/payment-details/${payment.Advance_Id}`);
      setSelectedPayment(response.data);
      setIsViewModalOpen(true);
    } catch (err: any) {
      console.error("Error fetching payment details:", err);
      alert(err.response?.data?.message || "Failed to fetch payment details.");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = document.getElementById('advance-payment-receipt')?.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Advance Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; }
            .section-title { font-size: 18px; font-weight: bold; margin-top: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .amount { font-weight: bold; font-size: 18px; }
            .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; text-align: center; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Calculate total advance amount
  const totalAdvanceAmount = filteredPayments.reduce(
    (sum, payment) => sum + parseFloat(payment.Advance_Amount),
    0
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading advance payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 md:mb-0">
              Advance Payments
            </h1>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total Advance Amount</p>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                    Rs. {totalAdvanceAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 dark:bg-green-500/20 rounded-lg">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-green-700 dark:text-green-300">Total Jobs</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-200">
                    {new Set(filteredPayments.map(p => p.Job_ID)).size}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-purple-700 dark:text-purple-300">Total Payments</p>
                  <p className="text-xl font-bold text-purple-800 dark:text-purple-200">
                    {filteredPayments.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800">
                <CreditCard size={48} className="mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">No advance payments found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort("Advance_Id")}>
                        Payment ID {getSortIcon("Advance_Id")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort("Customer_Name")}>
                        Customer {getSortIcon("Customer_Name")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort("Job_ID")}>
                        Job ID {getSortIcon("Job_ID")}
                      </div>
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort("product_name")}>
                        Product {getSortIcon("product_name")}
                      </div>
                    </th>
                    <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort("repair_status")}>
                        Status {getSortIcon("repair_status")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort("Paid_At")}>
                        Date {getSortIcon("Paid_At")}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort("Advance_Amount")}>
                        Amount {getSortIcon("Advance_Amount")}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.Advance_Id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                      onClick={() => navigate(`/advance-payment/${payment.Job_ID}`)} // Pass Job_ID to InvoiceDetails
                    >
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        #{payment.Advance_Id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        {payment.Customer_Name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        #{payment.Job_ID}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        {payment.product_name} {payment.model ? `(${payment.model})` : ""}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            payment.repair_status === "Completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : payment.repair_status === "In Progress"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : payment.repair_status === "Pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {payment.repair_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {formatDate(payment.Paid_At)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-right text-green-600 dark:text-green-400 whitespace-nowrap">
                        Rs. {parseFloat(payment.Advance_Amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {isViewModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Advance Payment Receipt
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  aria-label="Print receipt"
                >
                  <Printer size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  aria-label="Close modal"
                >
                  <X size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6" id="advance-payment-receipt">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">ADVANCE PAYMENT</h1>
                  <p className="text-gray-600 dark:text-gray-400">Receipt #{selectedPayment.Advance_Id}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-xl font-semibold text-gray-800 dark:text-gray-100">MN Electronics</div>
                  <p className="text-gray-600 dark:text-gray-400">1B Jayathilaka Road</p>
                  <p className="text-gray-600 dark:text-gray-400">Panadura, Sri Lanka</p>
                  <p className="text-gray-600 dark:text-gray-400">contact@mnelectronics.com</p>
                  <p className="text-gray-600 dark:text-gray-400">+94 71 230 2138</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Information</h3>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{selectedPayment.Customer_Name}</p>
                  {selectedPayment.Customer_Email && (
                    <p className="text-gray-600 dark:text-gray-400">{selectedPayment.Customer_Email}</p>
                  )}
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">Date:</p>
                    <p className="text-gray-800 dark:text-gray-200">{formatDate(selectedPayment.Paid_At)}</p>
                    
                    <p className="text-gray-600 dark:text-gray-400">Recorded by:</p>
                    <p className="text-gray-800 dark:text-gray-200">{selectedPayment.Owner_Name}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">Job Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Job ID:</p>
                    <p className="text-gray-800 dark:text-gray-200">#{selectedPayment.Job_ID}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Status:</p>
                    <span className={`px-2 py-1 text-xs rounded-full inline-block ${
                      selectedPayment.repair_status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      selectedPayment.repair_status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                      selectedPayment.repair_status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {selectedPayment.repair_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Product:</p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {selectedPayment.product_name} {selectedPayment.model ? `(${selectedPayment.model})` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Service:</p>
                    <p className="text-gray-800 dark:text-gray-200">{selectedPayment.repair_description}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8 bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Amount Details</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Advance Amount Paid:</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Rs. {parseFloat(selectedPayment.Advance_Amount).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="text-center text-gray-600 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                <p>This is an advance payment receipt for the repair services at MN Electronics.</p>
                <p className="mt-1">Thank you for your payment!</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex justify-end">
              <button 
                onClick={() => navigate(`/job/${selectedPayment.Job_ID}`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                View Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAdvancePayments;