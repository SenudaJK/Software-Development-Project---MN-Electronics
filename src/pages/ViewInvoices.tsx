import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/invoices/view-invoices");
        console.log("Fetched Invoices:", response.data); // Debugging
        setInvoices(response.data);
        setError("");
      } catch (err: any) {
        console.error("Error fetching invoices:", err);
        setError(err.response?.data?.error || "Failed to fetch invoices.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  console.log("isLoading:", isLoading, "error:", error, "invoices:", invoices); // Debugging

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading invoices...</div>
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
      <div className="container mx-auto max-w-7xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Invoices</h1>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <tr>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Assigned Employee</th>
                <th className="py-3 px-4">Repair Description</th>
                <th className="py-3 px-4">Total Parts Cost</th>
                <th className="py-3 px-4">Labour Cost</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Warranty Expiry</th>
                <th className="py-3 px-4">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.Invoice_Id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate(`/invoice/${invoice.Invoice_Id}`)}
                  >
                    <td className="py-3 px-4">{invoice.Invoice_Id}</td>
                    <td className="py-3 px-4">{invoice.Job_ID}</td>
                    <td className="py-3 px-4">{invoice.Customer_Name || "N/A"}</td>
                    <td className="py-3 px-4">{invoice.Owner_Name || "N/A"}</td>
                    <td className="py-3 px-4">{invoice.Assigned_Employee_Name || "N/A"}</td>
                    <td className="py-3 px-4">{invoice.Repair_Description || "N/A"}</td>
                    <td className="py-3 px-4">
                      Rs. {parseFloat(invoice.TotalCost_for_Parts || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      Rs. {parseFloat(invoice.Labour_Cost || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      Rs. {parseFloat(invoice.Total_Amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {invoice.Warranty_Expiry
                        ? new Date(invoice.Warranty_Expiry).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {invoice.Created_At
                        ? new Date(invoice.Created_At).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-4">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewInvoices;