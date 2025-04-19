import React, { useState, useEffect } from "react";
import axios from "axios";

const RegisterJobAndCustomer = () => {
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumbers: "", // Comma-separated phone numbers
  });

  const [job, setJob] = useState({
    repairDescription: "",
    repairStatus: "Pending", // Default value is "Pending"
    handoverDate: "",
    employeeID: "", // Assigned employee ID
  });

  const [product, setProduct] = useState({
    productName: "",
    model: "",
    modelNumber: "",
    productImage: null as string | null, // Update type to accept string (Cloudinary URL)
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // State for upload status
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState(""); // New state for phone number validation
  const [customerSearch, setCustomerSearch] = useState(""); // State for customer search input
  const [productSearch, setProductSearch] = useState(""); // State for general product search
  const [productNameSearch, setProductNameSearch] = useState(""); // State for product name search
  const [modelSearch, setModelSearch] = useState(""); // State for model search
  const [searchType, setSearchType] = useState<"combined" | "general">("general"); // Search type toggle
  const [isCustomerFound, setIsCustomerFound] = useState(false); // Tracks if customer exists
  const [isProductFound, setIsProductFound] = useState(false); // Tracks if product exists
  const [employees, setEmployees] = useState<
    { id: number; firstName: string; lastName: string }[]
  >([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/employees/all"
        );
        setEmployees(response.data); // Assuming the backend returns an array of employees
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchEmployees();
  }, []);

  const handleCustomerSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/customers?search=${customerSearch}`
      );
      if (response.data.length > 0) {
        const customerData = response.data[0];
        setCustomer({
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          phoneNumbers: customerData.phone_number || "",
        });
        setIsCustomerFound(true); // Mark customer as found
        setError("");
      } else {
        setIsCustomerFound(false); // Mark customer as not found
        setError("No customer found with the given search term.");
      }
    } catch (err: any) {
      setIsCustomerFound(false); // Mark customer as not found
      setError(
        err.response?.data?.error ||
          "An error occurred while searching for customers."
      );
    }
  };

  const handleProductSearch = async () => {
    try {
      let url = "http://localhost:5000/api/products?";
      let params = new URLSearchParams();
      
      if (searchType === "combined") {
        // Use specific product_name and/or model search
        if (productNameSearch) {
          params.append("product_name", productNameSearch);
        }
        
        if (modelSearch) {
          params.append("model", modelSearch);
        }
        
        if (!productNameSearch && !modelSearch) {
          setError("Please enter a product name and/or model to search.");
          return;
        }
      } else {
        // Use general search
        if (!productSearch.trim()) {
          setError("Please enter a search term.");
          return;
        }
        params.append("search", productSearch);
      }
      
      const response = await axios.get(`http://localhost:5000/api/products?${params}`);
      console.log("Product search response:", response.data);
      
      if (response.data.length > 0) {
        const productData = response.data[0];
        console.log("Selected product data:", productData);
        console.log("Product image URL:", productData.product_image);
        
        setProduct({
          productName: productData.product_name,
          model: productData.model,
          modelNumber: productData.model_number || "",
          productImage: productData.product_image || null,
        });
        
        // Set the image preview to show the Cloudinary image
        if (productData.product_image) {
          console.log("Setting image preview to:", productData.product_image);
          
          // Check if it's a valid URL
          try {
            new URL(productData.product_image); // This will throw an error if invalid
            setImagePreview(productData.product_image);
          } catch (e) {
            console.error("Invalid image URL:", productData.product_image);
            setImagePreview(null);
          }
        } else {
          console.log("No product image found, clearing preview");
          setImagePreview(null);
        }
        
        setIsProductFound(true); // Mark product as found
        setError("");
      } else {
        setIsProductFound(false); // Mark product as not found
        setError("No product found with the given search criteria.");
        setImagePreview(null); // Clear image preview
      }
    } catch (err: any) {
      console.error("Product search error:", err);
      setIsProductFound(false); // Mark product as not found
      setError(
        err.response?.data?.error ||
          "An error occurred while searching for products."
      );
      setImagePreview(null); // Clear image preview
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate phone numbers if the field being updated is "phoneNumbers"
    if (name === "phoneNumbers") {
      const phoneNumbersArray = value.split(",").map((phone) => phone.trim());
      const isValid = phoneNumbersArray.every((phone) =>
        /^07\d{8}$/.test(phone)
      );

      if (!isValid && value !== "") {
        setPhoneError(
          'Phone numbers must be valid and start with "07" followed by 8 digits.'
        );
      } else {
        setPhoneError("");
      }
    }

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJobChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setJob((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Selected File:", file); // Debug log

      // Validate file size and format
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size must be less than 5MB.");
        return;
      }

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Only JPEG and PNG formats are allowed.");
        return;
      }

      // Set local preview first for better UX
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      setIsUploading(true); // Start loading

      try {
        const formData = new FormData();
        formData.append("image", file);

        console.log("Uploading image to backend..."); // Debug log
        const response = await axios.post(
          "http://localhost:5000/api/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Check the response structure
        console.log("Upload response:", response.data); // Debug log
        
        // Get the image URL from the response
        const imageUrl = response.data.imageUrl;
        console.log("Uploaded Image URL:", imageUrl); // Debug log

        if (imageUrl) {
          // Update product state with the Cloudinary URL
          setProduct((prev) => ({
            ...prev,
            productImage: imageUrl,
          }));
          
          // Update image preview with the Cloudinary URL
          setImagePreview(imageUrl);
          setError(""); // Clear any previous errors
        } else {
          throw new Error("No image URL received from server");
        }
        
        setIsUploading(false); // Stop loading
      } catch (error: any) {
        console.error("Error uploading image:", error); // Debug log
        setError("Failed to upload image. Please try again.");
        setIsUploading(false); // Stop loading
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneError) {
      setError("Please fix the phone number errors before submitting.");
      return;
    }

    try {
      const formData = new FormData();

      let customerID = null;
      let productID = null;

      // If customer is found via search, use the existing customerID
      if (isCustomerFound) {
        const response = await axios.get(
          `http://localhost:5000/api/customers?search=${customerSearch}`
        );
        customerID = response.data[0].id; // Assuming the backend returns the customer ID
      } else {
        // Append customer data if not found via search
        formData.append("firstName", customer.firstName);
        formData.append("lastName", customer.lastName);
        formData.append("email", customer.email);
        const phoneNumbersArray = customer.phoneNumbers
          .split(",")
          .map((phone) => phone.trim());
        phoneNumbersArray.forEach((phone) =>
          formData.append("phone_number[]", phone)
        );
      }

      // If product is found via search, use the existing productID
      if (isProductFound) {
        let url = "http://localhost:5000/api/products?";
        let params = new URLSearchParams();
        
        if (searchType === "combined") {
          if (productNameSearch) params.append("product_name", productNameSearch);
          if (modelSearch) params.append("model", modelSearch);
        } else {
          params.append("search", productSearch);
        }
        
        const response = await axios.get(`http://localhost:5000/api/products?${params}`);
        const productData = response.data[0];
        productID = productData.product_id; // Corrected field name
        formData.append("product_name", productData.product_name); // Include product_name
      } else {
        // Append product data if not found via search
        formData.append("product_name", product.productName);
        formData.append("model", product.model);
        formData.append("model_no", product.modelNumber);
        if (product.productImage) {
          formData.append("product_image", product.productImage); // Cloudinary URL
          console.log("Sending Cloudinary URL:", product.productImage); // Debug log
        }
      }

      // Append job data (always required)
      formData.append("repairDescription", job.repairDescription);
      formData.append("repairStatus", job.repairStatus);
      formData.append("handoverDate", job.handoverDate);
      formData.append("employeeID", job.employeeID);

      // Include customerID and productID if they exist
      if (customerID) formData.append("customerID", customerID.toString());
      if (productID) formData.append("productID", productID.toString());

      // Debugging: Log the FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`); // Debug log
      }

      const response = await axios.post(
        "http://localhost:5000/api/jobCustomerProduct/registerAll",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message);
      setError("");
      setCustomer({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumbers: "",
      });
      setJob({
        repairDescription: "",
        repairStatus: "Pending",
        handoverDate: "",
        employeeID: "",
      });
      setProduct({
        productName: "",
        model: "",
        modelNumber: "",
        productImage: null,
      });
      setImagePreview(null);
      setIsCustomerFound(false); // Reset customer found flag
      setIsProductFound(false); // Reset product found flag
      setCustomerSearch(""); // Clear search fields
      setProductSearch("");
      setProductNameSearch("");
      setModelSearch("");
      setSearchType("general");
    } catch (err: any) {
      console.error("Form submission error:", err); // Debug log
      setMessage("");
      setError(err.response?.data?.error || "An unexpected error occurred");
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Register a Customer and New Job
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Customer Information Section */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Customer Information
          </h3>
          {/* Search Bar for Customer */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Search Existing Customer
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Search by name, email, or phone"
              />
              <button
                type="button"
                onClick={handleCustomerSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={customer.firstName}
              onChange={handleCustomerChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter first name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={customer.lastName}
              onChange={handleCustomerChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter last name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={customer.email}
              onChange={handleCustomerChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter email address"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Telephone Numbers
            </label>
            <input
              type="text"
              name="phoneNumbers"
              value={customer.phoneNumbers}
              onChange={handleCustomerChange}
              className={`w-full mt-1 p-2 border ${
                phoneError ? "border-red-500" : "border-gray-300"
              } rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200`}
              placeholder="Enter phone numbers (comma-separated)"
            />
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">{phoneError}</p>
            )}
          </div>
        </div>

        {/* Product and Job Details Section */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Product and Job Details
          </h3>
          
          {/* Enhanced Search Bar for Product */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Search Existing Product
            </label>
            
            <div className="flex gap-2 mb-3">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as "combined" | "general")}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="general">General Search</option>
                <option value="combined">Advanced Search</option>
              </select>
            </div>
            
            {searchType === "general" ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Search by name, model, or model number"
                />
                <button
                  type="button"
                  onClick={handleProductSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productNameSearch}
                    onChange={(e) => setProductNameSearch(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="Product name"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="Model"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleProductSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={product.productName}
              onChange={handleProductChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter product name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Model
            </label>
            <input
              type="text"
              name="model"
              value={product.model}
              onChange={handleProductChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter model"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Model Number
            </label>
            <input
              type="text"
              name="modelNumber"
              value={product.modelNumber}
              onChange={handleProductChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter model number"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Repair Description
            </label>
            <textarea
              name="repairDescription"
              value={job.repairDescription}
              onChange={handleJobChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter repair description"
              rows={3}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Repair Status
            </label>
            <select
              name="repairStatus"
              value={job.repairStatus}
              onChange={handleJobChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Handover Date
            </label>
            <input
              type="date"
              name="handoverDate"
              value={job.handoverDate}
              onChange={handleJobChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Assigned Employee
            </label>
            <select
              name="employeeID"
              value={job.employeeID}
              onChange={handleJobChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                    onLoad={() => console.log("Image loaded successfully")} // Debug
                    onError={(e) => {
                      console.error("Image load error:", e); // Debug
                      // Fallback image on error
                      (e.target as HTMLImageElement).onerror = null; // Prevent infinite loop
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    No Image
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className={`${isUploading ? 'bg-gray-500' : 'bg-blue-500'} text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                  <input 
                    type="file" 
                    hidden 
                    onChange={handleImageChange} 
                    disabled={isUploading}
                  />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setProduct(prev => ({ ...prev, productImage: null }));
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          onClick={() => {
            // Reset form
            setCustomer({
              firstName: "",
              lastName: "",
              email: "",
              phoneNumbers: "",
            });
            setJob({
              repairDescription: "",
              repairStatus: "Pending",
              handoverDate: "",
              employeeID: "",
            });
            setProduct({
              productName: "",
              model: "",
              modelNumber: "",
              productImage: null,
            });
            setImagePreview(null);
            setIsCustomerFound(false);
            setIsProductFound(false);
            setCustomerSearch("");
            setProductSearch("");
            setProductNameSearch("");
            setModelSearch("");
            setSearchType("general");
            setError("");
            setMessage("");
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleSubmit}
          disabled={isUploading}
        >
          Register
        </button>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default RegisterJobAndCustomer;