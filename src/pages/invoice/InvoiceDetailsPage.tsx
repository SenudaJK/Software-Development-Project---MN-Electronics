import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import axios from 'axios';
import { 
  ArrowLeft, 
  Printer, 
  Clock, 
  Package, 
  CreditCard, 
  AlertCircle,
  ShieldCheck,
  X,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../../components/payment/StripePaymentForm';

// Load Stripe outside of component render to avoid recreating Stripe object on every render
// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_your_publishable_key');

interface InvoiceDetails {
  Invoice_Id: number;
  Job_ID: number;
  TotalCost_for_Parts: string;
  Labour_Cost: string;
  Total_Amount: string;
  Warranty_Expiry: string | null;
  Created_At: string;
  Customer_Name: string;
  Owner_Name: string;
  Assigned_Employee_Name: string;
  Repair_Description: string;
  Product_Name: string;
  Product_Model: string;
  inventoryDetails: InventoryItem[];
  totalInventoryCost: string;
  advanceDetails: AdvancePayment[];
  totalAdvanceAmount: string;
  remainingBalance: string;
}

interface InventoryItem {
  Inventory_ID: number;
  Batch_No: string;
  Quantity_Used: number;
  Total_Amount: string;
  item_name: string;
}

interface AdvancePayment {
  Advance_Id: number;
  Advance_Amount: string;
  Paid_At: string;
}

const InvoiceDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Add payment state variables
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

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
        .print-hidden {
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
      if (!jobId || !user?.id) {
        setError("Invalid job ID or user not authenticated");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // First try to get the invoice ID for this job
        const invoiceIdResponse = await axios.get(`http://localhost:5000/api/invoices/get-invoice-id/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Invoice ID response:', invoiceIdResponse.data);
        
        if (invoiceIdResponse.data && invoiceIdResponse.data.Invoice_Id) {
          // If we have an invoice ID, fetch the invoice details
          const invoiceResponse = await axios.get(`http://localhost:5000/api/invoices/invoice-details/${invoiceIdResponse.data.Invoice_Id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          console.log('Invoice details response:', invoiceResponse.data);
          setInvoice(invoiceResponse.data);
        } else {
          setError("No invoice found for this job");
        }
        
      } catch (err: any) {
        console.error("Error fetching invoice details:", err);
        setError(err.response?.data?.message || "Failed to fetch invoice details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [jobId, user]);

  const handlePrint = () => {
    window.print();
  };

  // Add payment handlers
  const handlePayNow = async () => {
    if (!invoice) return;
    
    try {
      setIsProcessingPayment(true);
      
      // Create payment intent on your backend
      const response = await axios.post(
        'http://localhost:5000/api/payments/create-payment-intent',
        {
          amount: parseFloat(invoice.remainingBalance),
          invoiceId: invoice.Invoice_Id,
          jobId: invoice.Job_ID
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setIsPaymentModalOpen(true);
      } else {
        setPaymentError("Failed to initialize payment. Please try again.");
      }
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      setPaymentError(err.response?.data?.message || "Payment setup failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };
  
  // Handler for successful payment
  const handlePaymentSuccess = async () => {
    setPaymentSuccess(true);
    setIsPaymentModalOpen(false);
    
    // Refresh invoice data to show updated payment status
    if (jobId && user?.id) {
      try {
        const invoiceIdResponse = await axios.get(`http://localhost:5000/api/invoices/get-invoice-id/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (invoiceIdResponse.data && invoiceIdResponse.data.Invoice_Id) {
          const invoiceResponse = await axios.get(`http://localhost:5000/api/invoices/invoice-details/${invoiceIdResponse.data.Invoice_Id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          setInvoice(invoiceResponse.data);
        }
      } catch (err) {
        console.error("Error refreshing invoice data:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="page-container flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Card className="text-center py-12">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text mb-2">Invoice Not Available</h3>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft size={18} />}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="page-container">
        <Card className="text-center py-12">
          <h3 className="text-xl font-bold text-text mb-2">No Invoice Found</h3>
          <p className="text-text-secondary mb-6">We couldn't find an invoice for this repair job.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft size={18} />}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate totals from invoice data
  const partsTotal = parseFloat(invoice.TotalCost_for_Parts || '0');
  const labourCost = parseFloat(invoice.Labour_Cost || '0');
  const subtotal = partsTotal + labourCost;
  const totalAdvance = parseFloat(invoice.totalAdvanceAmount || '0');
  const totalAmount = parseFloat(invoice.Total_Amount || '0');
  const remainingBalance = parseFloat(invoice.remainingBalance || '0');

  return (
    <div className="page-container">
      {/* Non-printable controls */}      <div className="flex justify-between items-center mb-6 print-hidden">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft size={18} />}
        >
          Back
        </Button>
        <div className="flex space-x-3">
          <Button
            variant="primary"
            onClick={handlePrint}
            leftIcon={<Printer size={18} />}
          >
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Payment success message */}
      {paymentSuccess && (
        <div className="bg-success-light text-success p-4 rounded-lg mb-6 flex items-center">
          <CheckCircle className="mr-2" size={20} />
          <span>Payment completed successfully! Thank you for your payment.</span>
        </div>
      )}
      
      {/* Payment error message */}
      {paymentError && (
        <div className="bg-error-light text-error p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="mr-2" size={20} />
          <span>{paymentError}</span>
          <button 
            onClick={() => setPaymentError("")}
            className="ml-auto text-error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Printable invoice */}
      <Card className="print:shadow-none" id="invoice-printable">
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-text">INVOICE</h1>
            <p className="text-text-secondary mt-1">Invoice #: {invoice.Invoice_Id}</p>
            <p className="text-text-secondary mt-1">Job #: {invoice.Job_ID}</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-2xl font-semibold text-text">MN Electronics</div>
            <p className="text-text-secondary">1B Jayathilaka Road</p>
            <p className="text-text-secondary">Panadura, Sri Lanka</p>
            <p className="text-text-secondary">contact@mnelectronics.com</p>
            <p className="text-text-secondary">+94 71 230 2138</p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-text mb-3 border-b border-gray-200 pb-2">Customer Information</h2>
            <p className="font-medium text-text">{invoice.Customer_Name}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text mb-3 border-b border-gray-200 pb-2">Invoice Details</h2>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-text-secondary">Invoice Date:</p>
              <p className="text-text text-right">
                {new Date(invoice.Created_At).toLocaleDateString()}
              </p>
              
              <p className="text-text-secondary">Job ID:</p>
              <p className="text-text text-right">{invoice.Job_ID}</p>
              
              <p className="text-text-secondary">Warranty Until:</p>
              <p className="text-text text-right">
                {invoice.Warranty_Expiry ? new Date(invoice.Warranty_Expiry).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-text mb-3 border-b border-gray-200 pb-2">Service Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">Description</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text">
                      {invoice.Repair_Description}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      Product: {invoice.Product_Name || "N/A"} {invoice.Product_Model ? `(${invoice.Product_Model})` : ""}
                    </div>
                    <div className="text-sm text-text-secondary">
                      Technician: {invoice.Assigned_Employee_Name || "N/A"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">-</td>
                </tr>
                
                {/* Inventory items used in repair */}
                {invoice.inventoryDetails && invoice.inventoryDetails.length > 0 && (
                  <>
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="px-4 py-2 text-sm font-medium text-text-secondary">
                        <div className="flex items-center">
                          <Package size={16} className="mr-2" />
                          Parts Used
                        </div>
                      </td>
                    </tr>
                    {invoice.inventoryDetails.map((item, index) => (
                      <tr key={`inv-${index}`} className="border-b border-gray-200">
                        <td className="px-4 py-2 pl-8 text-sm text-text-secondary">
                          {item.item_name} (Qty: {item.Quantity_Used})
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-text-secondary">
                          Rs. {parseFloat(item.Total_Amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
                
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-text">Parts Cost</td>
                  <td className="px-4 py-3 text-right text-text">
                    Rs. {partsTotal.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-text">Labour Cost</td>
                  <td className="px-4 py-3 text-right text-text">
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
            <h2 className="text-lg font-semibold text-text mb-3 border-b border-gray-200 pb-2">
              <div className="flex items-center">
                <CreditCard size={18} className="mr-2" />
                Advance Payments
              </div>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-text-secondary">Payment ID</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-text-secondary">Date</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-text-secondary">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.advanceDetails.map((payment, index) => (
                    <tr key={`payment-${index}`} className="border-b border-gray-200">
                      <td className="px-4 py-2 text-sm text-text-secondary">
                        {payment.Advance_Id}
                      </td>
                      <td className="px-4 py-2 text-sm text-text-secondary">
                        {new Date(payment.Paid_At).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-text-secondary">
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
        <div className="border-t border-gray-200 pt-4 mb-8">
          <div className="flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2">
                <span className="font-medium text-text-secondary">Subtotal:</span>
                <span className="text-text">
                  Rs. {subtotal.toFixed(2)}
                </span>
              </div>
              
              {/* Show advance payment if available */}
              {totalAdvance > 0 && (
                <div className="flex justify-between py-2 text-success">
                  <span className="flex items-center">
                    <CreditCard size={16} className="mr-2" />
                    Advance Payments:
                  </span>
                  <span>- Rs. {totalAdvance.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-t border-gray-200">
                <span className="font-semibold text-text">Total Amount:</span>
                <span className="font-semibold text-text">
                  Rs. {totalAmount.toFixed(2)}
                </span>
              </div>
              
              {/* Display "Amount Due" if there was an advance payment */}
              {totalAdvance > 0 && (
                <div className="flex justify-between py-2 border-t border-gray-200 font-bold text-lg">
                  <span className="text-text">Remaining Balance:</span>
                  <span className="text-text">
                    Rs. {remainingBalance.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Warranty Info */}
        {invoice.Warranty_Expiry && (
          <div className="mb-6 p-4 bg-primary bg-opacity-5 rounded-lg">
            <div className="flex items-start">
              <ShieldCheck size={24} className="text-primary mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-text">Warranty Information</h3>
                <p className="text-text-secondary flex items-center mt-1">
                  <Clock size={16} className="mr-2" />
                  Warranty valid until {new Date(invoice.Warranty_Expiry).toLocaleDateString()}
                </p>
                <p className="text-text-secondary mt-2 text-sm">
                  Please keep this invoice as proof of warranty. Warranty covers manufacturing defects and workmanship issues.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h2 className="text-lg font-semibold text-text mb-3">Notes</h2>
          <p className="text-text-secondary">
            This invoice was generated by {invoice.Owner_Name || "MN Electronics"} on {new Date(invoice.Created_At).toLocaleDateString()}.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-text-secondary border-t border-gray-200 pt-6">
          <p>Thank you for choosing MN Electronics for your repair needs.</p>
          <p className="mt-1">If you have any questions, please contact us at customer-service@mnelectronics.com</p>
        </div>
      </Card>

      {/* Stripe Payment Modal */}
      {isPaymentModalOpen && clientSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button 
              onClick={closePaymentModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-text mb-6">Pay Invoice</h2>
            <div className="mb-4 p-3 bg-primary bg-opacity-5 rounded flex items-center justify-between">
              <span className="text-text-secondary">Amount to Pay:</span>
              <span className="text-lg font-bold text-primary">Rs. {remainingBalance.toFixed(2)}</span>
            </div>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm 
                amount={remainingBalance}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={(msg) => {
                  setPaymentError(msg);
                  setIsPaymentModalOpen(false);
                }}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailsPage;