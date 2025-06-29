import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Printer, Clock, Package, CreditCard } from "lucide-react";

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #invoice-printable, #invoice-printable * {
          visibility: visible;
        }
        #invoice-printable {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .print-hidden, .sidebar, nav, header, footer {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/invoices/invoice-details/${id}`);
        setInvoice(response.data);
        setError("");
      } catch (err: any) {
        console.error("Error fetching invoice details:", err);
        setError(err.response?.data?.message || "Failed to fetch invoice details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [id]);

  const handlePrint = () => {
    // Small delay to ensure styles are applied
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading invoice...</div>
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

  if (!invoice) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Invoice not found</div>
      </div>
    );
  }

  // Calculate totals from invoice data
  const partsTotal = parseFloat(invoice.TotalCost_for_Parts || 0);
  const labourCost = parseFloat(invoice.Labour_Cost || 0);
  const subtotal = partsTotal + labourCost;
  const totalAdvance = parseFloat(invoice.totalAdvanceAmount || 0);
  const totalAmount = parseFloat(invoice.Total_Amount || 0);
  const remainingBalance = parseFloat(invoice.remainingBalance || 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* Non-printable controls */}
      <div className="container mx-auto max-w-5xl mb-6 print-hidden">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/view-invoices")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <ArrowLeft size={18} />
            Back to Invoices
          </button>
          <div className="flex gap-2">
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

      {/* Printable invoice */}
      <div className="container mx-auto max-w-5xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 print:shadow-none print:p-0" id="invoice-printable">
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">INVOICE</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Invoice #: {invoice.Invoice_Id}</p>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Job #: {invoice.Job_ID}</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-2xl font-semibold text-gray-800 dark:text-gray-100">MN Electronics</div>
            <p className="text-gray-600 dark:text-gray-400">1B Jayathilaka Road</p>
            <p className="text-gray-600 dark:text-gray-400">Panadura, Sri Lanka</p>
            <p className="text-gray-600 dark:text-gray-400">contact@mnelectronics.com</p>
            <p className="text-gray-600 dark:text-gray-400">+94 71 230 2138</p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Customer Information</h2>
            <p className="font-medium text-gray-800 dark:text-gray-200">{invoice.Customer_Name}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Invoice Details</h2>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-600 dark:text-gray-400">Invoice Date:</p>
              <p className="text-gray-800 dark:text-gray-200 text-right">
                {new Date(invoice.Created_At).toLocaleDateString()}
              </p>
              
              <p className="text-gray-600 dark:text-gray-400">Job ID:</p>
              <p className="text-gray-800 dark:text-gray-200 text-right">{invoice.Job_ID}</p>
              
              <p className="text-gray-600 dark:text-gray-400">Warranty Until:</p>
              <p className="text-gray-800 dark:text-gray-200 text-right">
                {invoice.Warranty_Expiry ? new Date(invoice.Warranty_Expiry).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Service Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {invoice.Repair_Description}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Product: {invoice.Product_Name || "N/A"} {invoice.Product_Model ? `(${invoice.Product_Model})` : ""}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Technician: {invoice.Assigned_Employee_Name || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">-</td>
                </tr>
                
                {/* Inventory items used in repair */}
                {invoice.inventoryDetails && invoice.inventoryDetails.length > 0 && (
                  <>
                    <tr className="bg-gray-50 dark:bg-gray-750">
                      <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <Package size={16} className="mr-2" />
                          Parts Used
                        </div>
                      </td>
                    </tr>
                    {invoice.inventoryDetails.map((item: any, index: number) => (
                      <tr key={`inv-${index}`} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2 pl-8 text-sm text-gray-700 dark:text-gray-300">
                          {item.item_name} (Qty: {item.Quantity_Used})
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300">
                          Rs. {parseFloat(item.Total_Amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
                
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">Parts Cost</td>
                  <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">
                    Rs. {partsTotal.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">Labour Cost</td>
                  <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">
                    Rs. {labourCost.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Advance Payments */}
        {invoice.advanceDetails && invoice.advanceDetails.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
              <div className="flex items-center">
                <CreditCard size={18} className="mr-2" />
                Advance Payments
              </div>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Payment ID</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.advanceDetails.map((payment: any, index: number) => (
                    <tr key={`payment-${index}`} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {payment.Advance_Id}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(payment.Paid_At).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300">
                        Rs. {parseFloat(payment.Advance_Amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-8">
          <div className="flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Subtotal:</span>
                <span className="text-gray-800 dark:text-gray-200">
                  Rs. {subtotal.toFixed(2)}
                </span>
              </div>
              
              {/* Show advance payment if available */}
              {totalAdvance > 0 && (
                <div className="flex justify-between py-2 text-green-600 dark:text-green-400">
                  <span className="flex items-center">
                    <CreditCard size={16} className="mr-2" />
                    Advance Payments:
                  </span>
                  <span>- Rs. {totalAdvance}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Total Amount:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Rs. {totalAmount.toFixed(2)}
                </span>
              </div>
              
              {/* Display "Amount Due" if there was an advance payment */}
              {totalAdvance > 0 && (
                <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700 font-bold text-lg">
                  <span className="text-gray-800 dark:text-gray-200">Remaining Balance:</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    Rs. {remainingBalance}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Notes</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This invoice was generated by {invoice.Owner_Name || "MN Electronics"} on {new Date(invoice.Created_At).toLocaleDateString()}.
          </p>
          {invoice.Warranty_Expiry && (
            <p className="text-gray-600 dark:text-gray-400 flex items-center mt-2">
              <Clock size={16} className="mr-2" />
              Warranty valid until {new Date(invoice.Warranty_Expiry).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
          <p>Thank you for choosing MN Electronics for your repair needs.</p>
          <p className="mt-1">If you have any questions, please contact us at customer-service@mnelectronics.com</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
