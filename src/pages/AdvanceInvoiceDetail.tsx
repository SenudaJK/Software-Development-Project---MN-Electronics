import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Printer, CreditCard, User, Package, FileText } from "lucide-react";

const AdvanceInvoiceDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>(); // Job ID
  const [advanceDetails, setAdvanceDetails] = useState<any[]>([]);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [totalAdvance, setTotalAdvance] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Add print styles
  useEffect(() => {
    // Create style element for print-only styling
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        /* Hide everything except the printable area */
        body * {
          visibility: hidden;
        }
        #advance-receipt-printable, #advance-receipt-printable * {
          visibility: visible;
        }
        #advance-receipt-printable {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px !important;
          margin: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background-color: white !important;
        }

        /* Hide all navigation elements */
        .print-hidden, header, footer, nav, .sidebar, 
        [role="banner"], [role="navigation"], [role="complementary"] {
          display: none !important;
        }
        
        /* Reset text colors for printing */
        #advance-receipt-printable * {
          color: black !important;
          border-color: #ddd !important;
          background-color: transparent !important;
        }
        
        /* Ensure status badges remain visible */
        #advance-receipt-printable .status-badge {
          border: 1px solid #ddd !important;
          padding: 2px 6px !important;
        }
        
        /* Improve table appearance for printing */
        #advance-receipt-printable table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        
        #advance-receipt-printable table th,
        #advance-receipt-printable table td {
          border-bottom: 1px solid #ddd !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Cleanup
    return () => {
      const styleElem = document.getElementById('print-styles');
      if (styleElem) document.head.removeChild(styleElem);
    };
  }, []);

  useEffect(() => {
    const fetchAdvanceDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/invoices/job-advance-payments/${jobId}`);
        setAdvanceDetails(response.data.advancePayments);
        setTotalAdvance(parseFloat(response.data.totalAdvance));
        setJobDetails(response.data.advancePayments[0]); // Assuming all payments belong to the same job
        setError("");
      } catch (err: any) {
        console.error("Error fetching advance payment details:", err);
        setError(err.response?.data?.message || "Failed to fetch advance payment details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvanceDetails();
  }, [jobId]);

  const handlePrint = () => {
    // Add a slight delay to ensure styles are applied
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading advance payment details...</div>
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

  if (!jobDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">No advance payments found for this job</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* Non-printable controls */}
      <div className="container mx-auto max-w-5xl mb-6 print-hidden">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/view-advance-payments")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <ArrowLeft size={18} />
            Back to Advance Payments
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/invoice-details/${jobId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <FileText size={18} />
              View Invoice
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Printable advance payment receipt */}
      <div className="container mx-auto max-w-5xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 print:shadow-none print:p-0" id="advance-receipt-printable">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">ADVANCE PAYMENTS</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Job #: {jobDetails.Job_ID}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Status: 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full inline-block status-badge ${
                jobDetails.repair_status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                jobDetails.repair_status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                jobDetails.repair_status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {jobDetails.repair_status}
              </span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">MN Electronics</div>
            <p className="text-gray-600 dark:text-gray-400">1B Jayathilaka Road</p>
            <p className="text-gray-600 dark:text-gray-400">Panadura, Sri Lanka</p>
            <p className="text-gray-600 dark:text-gray-400">contact@mnelectronics.com</p>
            <p className="text-gray-600 dark:text-gray-400">+94 71 230 2138</p>
          </div>
        </div>

        {/* Customer and Job Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Customer Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
              <User size={18} className="mr-2" />
              Customer Information
            </h2>
            <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200 font-medium">{jobDetails.Customer_Name}</p>
              {jobDetails.Customer_Email && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium">Email:</span> {jobDetails.Customer_Email}
                </p>
              )}
              {jobDetails.Customer_Phone && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium">Phone:</span> {jobDetails.Customer_Phone}
                </p>
              )}
              {jobDetails.Customer_Address && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium">Address:</span> {jobDetails.Customer_Address}
                </p>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
              <Package size={18} className="mr-2" />
              Product Details
            </h2>
            <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-medium">Product:</span> {jobDetails.product_name} {jobDetails.model ? `(${jobDetails.model})` : ""}
              </p>
              {jobDetails.serial_number && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium">Serial No:</span> {jobDetails.serial_number}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                <span className="font-medium">Service:</span> {jobDetails.repair_description}
              </p>
            </div>
          </div>
        </div>

        {/* Advance Payments Table */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            <CreditCard size={18} className="mr-2" />
            Advance Payments
          </h2>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Received By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {advanceDetails.map((payment) => (
                <tr key={payment.Advance_Id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">#{payment.Advance_Id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{formatDate(payment.Paid_At)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{payment.Owner_Name || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                    Rs. {parseFloat(payment.Advance_Amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-750">
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200 text-right">
                  Total Advance
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800 dark:text-gray-200">
                  Rs. {totalAdvance.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Note</h2>
          <p className="text-blue-700 dark:text-blue-400 text-sm">
            This document summarizes all advance payments made for Job #{jobDetails.Job_ID}. The total amount paid will be 
            deducted from the final invoice amount upon job completion.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <p>Thank you for choosing MN Electronics for your repair needs.</p>
          <p className="mt-1">If you have any questions, please contact us at customer-service@mnelectronics.com</p>
        </div>
      </div>

      {/* Action Buttons - Non-printable */}
      <div className="container mx-auto max-w-5xl mt-6 flex justify-end gap-4 print-hidden">
        <button
          onClick={() => navigate(`/job/${jobId}`)}
          className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          View Job Details
        </button>
      </div>
    </div>
  );
};

export default AdvanceInvoiceDetail;