import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const FullInvoice = () => {
  const [jobId, setJobId] = useState('');
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [inventoryDetails, setInventoryDetails] = useState<any[]>([]);
  const [labourCost, setLabourCost] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('0');
  const [totalInventoryCost, setTotalInventoryCost] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [warrantyEligible, setWarrantyEligible] = useState<boolean | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const navigate = useNavigate();
  // Get employee data from localStorage
  const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
  const { id: ownerId, role } = employeeData;

  // Check if user is authorized (owner)
  useEffect(() => {
    if (!employeeData || !employeeData.id) {
      setError('You must be logged in to create invoices');
      return;
    }

    if (role !== 'owner') {
      setError('Only owners can create invoices');
      return;
    }
  }, [employeeData, role]);

  // Update calculations when values change
  useEffect(() => {
    if (labourCost) {
      calculateTotals();
    }
  }, [labourCost, advanceAmount, totalInventoryCost]);

  // Log job details when they change
  useEffect(() => {
    if (jobDetails) {
      console.log('Job Details:', jobDetails);
      console.log('Repair Status:', jobDetails.repair_status);
    }
  }, [jobDetails]);

  // Calculate total and remaining amounts
  const calculateTotals = () => {
    const labour = parseFloat(labourCost) || 0;
    const advance = parseFloat(advanceAmount) || 0;
    
    // Total is parts + labour (advance is not added to total)
    const total = totalInventoryCost + labour;
    setTotalAmount(total);
    
    // Remaining is total - advance
    const remaining = total - advance;
    setRemainingAmount(remaining);
  };

  // Fetch job details and inventory details by Job ID
  const fetchJobDetails = async () => {
    if (!jobId) {
      setError('Please enter a Job ID');
      return;
    }
  
    setIsLoading(true);
    setError('');
    setMessage('');
  
    try {
      // Fetch job details
      const response = await axios.get(`http://localhost:5000/api/invoices/job-invoice/${jobId}`);
      const data = response.data;
  
      setJobDetails(data.jobDetails); // Set job details
      setInventoryDetails(data.inventoryDetails || []); // Set inventory details
      setTotalInventoryCost(parseFloat(data.totalInventoryCost) || 0); // Set total inventory cost
      setAdvanceAmount(data.advanceAmount || '0'); // Set advance amount
      setLabourCost(''); // Reset labour cost after fetching job details
      calculateTotals(); // Recalculate totals
    } catch (err: any) {
      console.error('Error fetching job details:', err);
      setError(err.response?.data?.message || 'Error fetching job details');
      setJobDetails(null);
      setInventoryDetails([]);
      setAdvanceAmount('0'); // Reset advance amount on error
      setTotalAmount(0);
      setRemainingAmount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!jobDetails) {
      setError("Please fetch job details first");
      return;
    }

    // Validate labour cost
    if (!labourCost || parseFloat(labourCost) <= 0) {
      setError("Labour cost must be greater than 0.");
      return;
    }

    if (!ownerId) {
      setError("Owner information missing. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/invoices/create",
        {
          jobId: parseInt(jobDetails.job_id),
          customerId: parseInt(jobDetails.customer_id || 0),
          ownerId, // Logged-in employee ID
          totalCostForParts: totalInventoryCost.toString(),
          labourCost: parseFloat(labourCost) || 0,
          totalAmount: totalAmount.toFixed(2),
          warrantyEligible,
        }
      );

      setMessage(response.data.message || "Invoice created successfully!");
      setJobDetails((prevDetails: any) => ({
        ...prevDetails,
        warranty_expiry: response.data.warrantyExpiry,
      }));
      setError("");
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      setError(err.response?.data?.message || "Error creating invoice");
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabourCostChange = (value: string) => {
    const parsedValue = parseFloat(value);

    if (parsedValue <= 0 || isNaN(parsedValue)) {
      setError('Labour cost must be greater than 0.');
    } else {
      setError(''); // Clear error if the value is valid
    }

    setLabourCost(value);
  };

  // Function to generate PDF
  const generatePDF = async () => {
    const invoiceElement = document.getElementById('invoice-section');
    if (!invoiceElement) {
      setError('Invoice section not found');
      return;
    }

    console.log(invoiceElement.innerHTML); // Debug: Check if the content is present
    try {
      const canvas = await html2canvas(invoiceElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${jobId}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  // Redirect to login if not authenticated
  const redirectToLogin = () => {
    navigate('/login');
  };

  // Show unauthorized message if not owner
  if (employeeData?.id && role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex justify-center items-center">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Unauthorized Access
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Only owners can create invoices.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show login prompt if not logged in
  if (!employeeData?.id) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex justify-center items-center">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            You must be logged in to create invoices.
          </p>
          <button
            onClick={redirectToLogin}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-5xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Full Invoice</h1>

        {/* Job ID Input */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Find Job</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Job ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Enter Job ID"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="self-end">
              <button
                onClick={fetchJobDetails}
                className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-blue-300"
                disabled={isLoading || !jobId}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : 'Fetch Details'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-md dark:bg-green-900 dark:border-green-700 dark:text-green-200">
            {message}
          </div>
        )}

        {/* Job Details */}
        {jobDetails && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Job Details</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Job ID:</span> {jobDetails.job_id}
                  </p>
                  <p className="mb-2 text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Repair Description:</span> {jobDetails.repair_description}
                  </p>
                  <p className="mb-2 text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Customer:</span> {jobDetails.customer_name}
                  </p>
                  <p className="mb-2 text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Email:</span> {jobDetails.email}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Assigned Employee:</span> {jobDetails.assigned_employee || 'None'}
                  </p>
                  <p className="mb-2 text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Product Name:</span> {jobDetails.product_name || 'N/A'}
                  </p>
                  <p className="mb-2 text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Model:</span> {jobDetails.model || 'N/A'}
                  </p>
                  {jobDetails.warranty_eligible && (
                    <p className="mb-2 text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">Warranty Expiry:</span> {jobDetails.warranty_expiry || 'N/A'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Details */}
        {jobDetails && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Inventory Items Used</h2>
            {inventoryDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                      <th className="text-left px-4 py-2 text-gray-700 dark:text-gray-200">Item Name</th>
                      <th className="text-left px-4 py-2 text-gray-700 dark:text-gray-200">Quantity</th>
                      <th className="text-right px-4 py-2 text-gray-700 dark:text-gray-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryDetails.map((item, index) => (
                      <tr key={index} className="border-b border-gray-300 dark:border-gray-600">
                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.item_name || 'N/A'}</td>
                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.Quantity_Used}</td>
                        <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">
                          Rs. {parseFloat(item.Total_Amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 dark:bg-gray-600 font-semibold">
                      <td colSpan={2} className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">
                        Total Parts Cost:
                      </td>
                      <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">
                        Rs. {totalInventoryCost.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center text-gray-600 dark:text-gray-400">
                No inventory items used for this job
              </div>
            )}
          </div>
        )}

        {/* Warranty Eligibility */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Warranty Eligibility</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="warrantyEligible"
                value="true"
                checked={warrantyEligible === true}
                onChange={() => setWarrantyEligible(true)}
                className="mr-2"
              />
              <span className="text-gray-800 dark:text-gray-200">Eligible</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="warrantyEligible"
                value="false"
                checked={warrantyEligible === false}
                onChange={() => setWarrantyEligible(false)}
                className="mr-2"
              />
              <span className="text-gray-800 dark:text-gray-200">Not Eligible</span>
            </label>
          </div>
        </div>

        {/* Invoice Calculation */}
        {jobDetails && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Invoice Calculation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Labour Cost
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                    Rs.
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={labourCost}
                    onChange={(e) => handleLabourCostChange(e.target.value)}
                    className="w-full pl-12 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="Enter labour cost"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter the cost of labour and any other additional expenses
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Parts Cost:</span>
                    <span className="text-gray-800 dark:text-gray-200">Rs. {totalInventoryCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Labour Cost:</span>
                    <span className="text-gray-800 dark:text-gray-200">Rs. {parseFloat(labourCost || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="text-gray-800 dark:text-gray-200 font-semibold">Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Advance Paid:</span>
                    <span className="text-gray-800 dark:text-gray-200">- Rs. {parseFloat(advanceAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 font-bold">
                    <span className="text-gray-800 dark:text-gray-200">Balance Due:</span>
                    <span className="text-gray-800 dark:text-gray-200">Rs. {remainingAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Section */}
        {jobDetails && (
          <div id="invoice-section" className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Invoice Details</h2>
            {/* Add your invoice details here */}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          
          <button
            onClick={handleCreateInvoice}
            disabled={isLoading || !jobDetails || !labourCost || parseFloat(labourCost) <= 0}
            className={`w-full sm:w-auto px-4 py-2 text-white rounded-md focus:outline-none focus:ring ${
              isLoading || !jobDetails || !labourCost || parseFloat(labourCost) <= 0
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 focus:ring-green-300"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Create Invoice"
            )}
          </button>

          {/* <button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className={`w-full sm:w-auto px-4 py-2 text-white rounded-md focus:outline-none focus:ring ${
              isGeneratingPDF ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300'
            }`}
          ></button> */}
          {/* {jobDetails && (
            // <button
            //   onClick={generatePDF}
            //   className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
            // >
            //   Generate PDF
            // </button>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default FullInvoice;