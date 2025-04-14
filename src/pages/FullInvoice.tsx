import React from 'react';

const FullInvoice = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-5xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Invoice</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Details Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Job Details</h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Job ID</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Enter Job ID"
                />
                <button className="absolute right-2 top-2 text-gray-500 dark:text-gray-300">
                  {/* Professional Search Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 10a6 6 0 1112 0 6 6 0 01-12 0zm-7 7l4-4"
                    />
                  </svg>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Product Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Enter Product Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Model Number</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Enter Model Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Repair Description</label>
                <textarea
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Enter Repair Description"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Used Inventory Items Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Used Inventory Items</h3>
            <div className="overflow-x-auto bg-gray-100 dark:bg-gray-700 rounded-md shadow">
              <table className="w-full text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  <tr>
                    <th className="py-2 px-4">Item Name</th>
                    <th className="py-2 px-4">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Example row */}
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    <td className="py-2 px-4">Example Item</td>
                    <td className="py-2 px-4">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Customer ID</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Enter Customer ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Customer Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Enter Customer Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Enter Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Telephone Number</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Enter Telephone Number"
              />
            </div>
          </div>
        </div>

        {/* Billing Information Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Billing Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Cost For Parts Used
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Enter Total Cost"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Labour Cost and Other Expenses
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Enter Labour Cost"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Advance Amount</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Enter Advance Amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Total Amount</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Enter Total Amount"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="w-full py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800">
            Save Invoice as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullInvoice;