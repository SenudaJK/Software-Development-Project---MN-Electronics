import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Package,
  Search,
  Upload,
  Calendar,
  Smartphone,
  Mail,
  X,
  RefreshCw,
  Check,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
} from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/employees/all"
        );
        setEmployees(response.data); // Assuming the backend returns an array of employees
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleCustomerSearch = async () => {
    if (!customerSearch.trim()) {
      setError("Please enter a search term for customer");
      return;
    }
    
    setIsLoading(true);
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
        setMessage("Customer found successfully!");
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSearch = async () => {
    setIsLoading(true);
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
          setIsLoading(false);
          return;
        }
      } else {
        // Use general search
        if (!productSearch.trim()) {
          setError("Please enter a search term.");
          setIsLoading(false);
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
        setMessage("Product found successfully!");
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
    } finally {
      setIsLoading(false);
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

  const resetForm = () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneError) {
      setError("Please fix the phone number errors before submitting.");
      return;
    }

    setIsSubmitting(true);
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
      resetForm();
    } catch (err: any) {
      console.error("Form submission error:", err); // Debug log
      setMessage("");
      setError(err.response?.data?.error || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                New Repair Registration
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Register a new customer and job in one place
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                New Job
              </span>
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Customer Registration
              </span>
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Product Details
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Section: Customer Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Search */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <User className="text-white" size={20} />
                    <h2 className="text-xl font-semibold text-white">
                      Find Existing Customer
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      placeholder="Search by name, email, or phone"
                    />
                    <div className="absolute top-0 left-0 h-full flex items-center pl-3">
                      <Search className="text-gray-400" size={18} />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCustomerSearch}
                    disabled={isLoading || !customerSearch.trim()}
                    className={`mt-3 w-full flex items-center justify-center px-4 py-2 rounded-lg ${
                      isLoading || !customerSearch.trim()
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                        : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    } transition-colors duration-200`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="animate-spin mr-2" size={18} />
                        Searching...
                      </>
                    ) : (
                      "Search for Customer"
                    )}
                  </button>
                  
                  {isCustomerFound && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg dark:bg-green-900/30 dark:border-green-800">
                      <div className="flex items-start">
                        <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <p className="text-green-800 dark:text-green-300 text-sm font-medium">
                            Customer found!
                          </p>
                          <p className="text-green-700 dark:text-green-400 text-xs mt-1">
                            Customer details have been loaded.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <User className="text-white" size={20} />
                    <h2 className="text-xl font-semibold text-white">
                      Customer Details
                    </h2>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {/* Customer name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={customer.firstName}
                        onChange={handleCustomerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={customer.lastName}
                        onChange={handleCustomerChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="flex items-center">
                        <Mail size={16} className="mr-1" />
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customer.email}
                      onChange={handleCustomerChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      placeholder="customer@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="flex items-center">
                        <Smartphone size={16} className="mr-1" />
                        Phone Numbers
                      </span>
                    </label>
                    <input
                      type="text"
                      name="phoneNumbers"
                      value={customer.phoneNumbers}
                      onChange={handleCustomerChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200 ${
                        phoneError 
                          ? "border-red-500 dark:border-red-500" 
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="07XXXXXXXX, 07XXXXXXXX"
                    />
                    {phoneError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {phoneError}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Enter multiple numbers separated by commas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Product & Job Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Product Search */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Package className="text-white" size={20} />
                    <h2 className="text-xl font-semibold text-white">
                      Find Existing Product
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Search Type:</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        className="form-radio text-green-600 border-gray-300 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                        checked={searchType === "general"}
                        onChange={() => setSearchType("general")}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">General</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        className="form-radio text-green-600 border-gray-300 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                        checked={searchType === "combined"}
                        onChange={() => setSearchType("combined")}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Advanced</span>
                    </label>
                  </div>

                  {/* Search fields based on search type */}
                  {searchType === "general" ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200"
                        placeholder="Search by product name, model or model number"
                      />
                      <div className="absolute top-0 left-0 h-full flex items-center pl-3">
                        <Search className="text-gray-400" size={18} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={productNameSearch}
                          onChange={(e) => setProductNameSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200"
                          placeholder="Product name (e.g. Samsung TV)"
                        />
                        <div className="absolute top-0 left-0 h-full flex items-center pl-3">
                          <Search className="text-gray-400" size={18} />
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={modelSearch}
                          onChange={(e) => setModelSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-200"
                          placeholder="Model (e.g. UHD4K)"
                        />
                        <div className="absolute top-0 left-0 h-full flex items-center pl-3">
                          <Search className="text-gray-400" size={18} />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleProductSearch}
                    disabled={isLoading || (searchType === "general" ? !productSearch.trim() : (!productNameSearch.trim() && !modelSearch.trim()))}
                    className={`mt-3 w-full flex items-center justify-center px-4 py-2 rounded-lg ${
                      isLoading || (searchType === "general" ? !productSearch.trim() : (!productNameSearch.trim() && !modelSearch.trim()))
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                        : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                    } transition-colors duration-200`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="animate-spin mr-2" size={18} />
                        Searching...
                      </>
                    ) : (
                      "Search for Product"
                    )}
                  </button>
                  
                  {isProductFound && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg dark:bg-green-900/30 dark:border-green-800">
                      <div className="flex items-start">
                        <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <p className="text-green-800 dark:text-green-300 text-sm font-medium">
                            Product found!
                          </p>
                          <p className="text-green-700 dark:text-green-400 text-xs mt-1">
                            Product details have been loaded.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Package className="text-white" size={20} />
                    <h2 className="text-xl font-semibold text-white">
                      Product Details
                    </h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={product.productName}
                        onChange={handleProductChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        placeholder="Product name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Model
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={product.model}
                        onChange={handleProductChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        placeholder="Model"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model Number
                    </label>
                    <input
                      type="text"
                      name="modelNumber"
                      value={product.modelNumber}
                      onChange={handleProductChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      placeholder="Model number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-1/3">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Product"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error("Image load error");
                                (e.target as HTMLImageElement).onerror = null;
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=Error";
                              }}
                            />
                          ) : (
                            <div className="text-center p-4">
                              <Upload size={36} className="mx-auto text-gray-400 dark:text-gray-500" />
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                No image selected
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-full sm:w-2/3 flex flex-col gap-2">
                        <label
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600 text-center ${
                            isUploading
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                              : "bg-white text-purple-600 hover:bg-gray-50 dark:bg-gray-700 dark:text-purple-400 dark:hover:bg-gray-750"
                          }`}
                        >
                          {isUploading ? (
                            <>
                              <RefreshCw className="animate-spin" size={18} />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload size={18} />
                              Choose Image
                            </>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleImageChange}
                            accept="image/jpeg,image/png"
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
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50"
                          >
                            <X size={18} />
                            Remove Image
                          </button>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Upload JPEG or PNG image (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Job Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="text-white" size={20} />
                    <h2 className="text-xl font-semibold text-white">
                      Job Details
                    </h2>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Repair Description
                    </label>
                    <textarea
                      name="repairDescription"
                      value={job.repairDescription}
                      onChange={handleJobChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      placeholder="Describe the repair needed"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Repair Status
                      </label>
                      <div className="relative">
                        <select
                          name="repairStatus"
                          value={job.repairStatus}
                          onChange={handleJobChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          required
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          Expected Handover Date
                        </div>
                      </label>
                      <input
                        type="date"
                        name="handoverDate"
                        value={job.handoverDate}
                        onChange={handleJobChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assigned Employee
                    </label>
                    <div className="relative">
                      <select
                        name="employeeID"
                        value={job.employeeID}
                        onChange={handleJobChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        required
                      >
                        <option value="" disabled>Select an employee</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          {(message || error) && (
            <div className="mt-6">
              {message && (
                <div className="flex items-center p-4 mb-4 bg-green-50 border-l-4 border-green-600 rounded-lg dark:bg-green-900/30 dark:border-green-500">
                  <CheckCircle className="text-green-600 dark:text-green-400 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-green-800 dark:text-green-300 font-medium">Success</h3>
                    <p className="text-green-700 dark:text-green-400 text-sm">{message}</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex items-center p-4 mb-4 bg-red-50 border-l-4 border-red-600 rounded-lg dark:bg-red-900/30 dark:border-red-500">
                  <AlertCircle className="text-red-600 dark:text-red-400 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-red-800 dark:text-red-300 font-medium">Error</h3>
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-650"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={`px-6 py-2.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSubmitting || isUploading
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  <span>Registering...</span>
                </div>
              ) : (
                "Register Job & Customer"
              )}
            </button>
          </div>
        </form>

        {/* Help Card */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start">
            <Info className="text-blue-600 dark:text-blue-400 mr-4 mt-0.5 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-blue-800 dark:text-blue-300 font-medium text-lg mb-2">
                Tips for Registration
              </h3>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400 text-sm">
                <li>Search for existing customers by name, email, or phone number</li>
                <li>Search for existing products by name or model to avoid duplicates</li>
                <li>Upload clear images of products to help with identification</li>
                <li>Provide detailed repair descriptions for better service tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterJobAndCustomer;