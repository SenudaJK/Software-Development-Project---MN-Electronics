import React, { useState } from 'react';
import axios from 'axios';

const InventoryForm = () => {
  const [formData, setFormData] = useState({
    product_name: '',
    stock_limit: '',
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/inventory/addInventory', formData);
      setMessage(response.data.message);
      setErrors({});
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setErrors(
          error.response.data.errors.reduce(
            (acc: { [key: string]: string }, err: { param: string; msg: string }) => ({
              ...acc,
              [err.param]: err.msg,
            }),
            {}
          )
        );
      } else {
        setMessage(error.response ? error.response.data.message : error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Add Inventory Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Product Name</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              className={`mt-1 w-full p-2 border ${
                errors.product_name ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`}
              placeholder="Enter product name"
            />
            {errors.product_name && <p className="text-sm text-red-500 mt-1">{errors.product_name}</p>}
          </div>

          {/* Stock Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Stock Limit</label>
            <input
              type="number"
              name="stock_limit"
              value={formData.stock_limit}
              onChange={handleChange}
              className={`mt-1 w-full p-2 border ${
                errors.stock_limit ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`}
              placeholder="Enter stock limit"
            />
            {errors.stock_limit && <p className="text-sm text-red-500 mt-1">{errors.stock_limit}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Add Inventory
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-center ${
              errors.product_name || errors.stock_limit ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default InventoryForm;