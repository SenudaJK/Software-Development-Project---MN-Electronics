// Modifications to handle updated backend query fields and multipart form data
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditJob = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState({
    repairDescription: "",
    repairStatus: "Pending",
    handoverDate: "",
    employeeID: "",
  });

  const [product, setProduct] = useState({
    productId: "", // Added to store the product_id for backend updates
    productName: "",
    model: "",
    modelNumber: "",
    productImage: null as string | null,
  });

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumbers: [] as string[],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<
    { id: number; firstName: string; lastName: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Fetch job details and employees when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching job with ID:", jobId); // Debug log
        
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/edit-job/${jobId}`);
        console.log("Job data:", jobResponse.data); // Debug log
        
        const jobData = jobResponse.data;
        
        // Format date from ISO format to YYYY-MM-DD for input
        const formattedDate = jobData.handover_date ? 
          jobData.handover_date.split('T')[0] : "";
        
        // Set job data
        setJob({
          repairDescription: jobData.repair_description || "",
          repairStatus: jobData.repair_status || "Pending",
          handoverDate: formattedDate,
          employeeID: jobData.assigned_employee?.toString() || "",
        });
        
        // Set product data - now storing product_id
        setProduct({
          productId: jobData.product_id || "", // Store product_id for update
          productName: jobData.product_name || "",
          model: jobData.model || "",
          modelNumber: jobData.model_number || "",
          productImage: jobData.product_image || null,
        });
        
        // Set image preview if product has an image
        if (jobData.product_image) {
          setImagePreview(jobData.product_image);
        }
        
        // Set customer data (for display only, not editable)
        setCustomer({
          firstName: jobData.customer_first_name || "",
          lastName: jobData.customer_last_name || "",
          email: jobData.customer_email || "",
          phoneNumbers: jobData.customer_phones || [],
        });
        
        // Fetch employees for dropdown
        const employeesResponse = await axios.get("http://localhost:5000/api/employees/all");
        setEmployees(employeesResponse.data);
        
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching job data:", err);
        // More detailed error logging
        if (err.response) {
          console.error("Error response status:", err.response.status);
          console.error("Error response data:", err.response.data);
        }
        setError("Failed to load job data. Please try again.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

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

      // Validate file size and format
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB.");
        return;
      }

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Only JPEG and PNG formats are allowed.");
        return;
      }

      // Set local preview for better UX
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await axios.post(
          "http://localhost:5000/api/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const imageUrl = response.data.imageUrl;

        if (imageUrl) {
          setProduct((prev) => ({
            ...prev,
            productImage: imageUrl,
          }));
          setImagePreview(imageUrl);
          setError("");
        } else {
          throw new Error("No image URL received from server");
        }
        
        setIsUploading(false);
      } catch (error: any) {
        console.error("Error uploading image:", error);
        setError("Failed to upload image. Please try again.");
        setIsUploading(false);
      }
    }
  };

  const toggleImageModal = () => {
    setIsImageModalOpen(!isImageModalOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create FormData object for multipart/form-data submission
      const formData = new FormData();
      
      // Add job data
      formData.append("repair_description", job.repairDescription);
      formData.append("repair_status", job.repairStatus);
      formData.append("handover_date", job.handoverDate);
      formData.append("assigned_employee", job.employeeID);
      
      // Add product data
      formData.append("product_name", product.productName);
      formData.append("model", product.model);
      formData.append("model_number", product.modelNumber);
      
      // Add product_id if available
      if (product.productId) {
        formData.append("product_id", product.productId.toString());
      }
      
      // Add product image URL if we have one from Cloudinary
      if (product.productImage) {
        formData.append("product_image", product.productImage);
      }
      
      console.log("Updating job with FormData"); // Debug log

      const response = await axios.put(
        `http://localhost:5000/api/jobs/update/${jobId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update image preview if server returns new image URL
      if (response.data.image_url) {
        setImagePreview(response.data.image_url);
        setProduct(prev => ({
          ...prev,
          productImage: response.data.image_url
        }));
      }

      setMessage(response.data.message || "Job updated successfully!");
      setError("");
      
      // Navigate back to job list after short delay
      setTimeout(() => {
        navigate("/jobs");
      }, 2000);
    } catch (err: any) {
      console.error("Error updating job:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
      }
      setError(err.response?.data?.error || "Failed to update job. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading job details...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Edit Job
      </h2>

      {/* Customer Information (Read-only) */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</p>
            <p className="text-base text-gray-800 dark:text-gray-200">
              {customer.firstName} {customer.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
            <p className="text-base text-gray-800 dark:text-gray-200">{customer.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Numbers</p>
            {customer.phoneNumbers && customer.phoneNumbers.length > 0 ? (
              <ul className="text-base text-gray-800 dark:text-gray-200">
                {customer.phoneNumbers.map((phone, index) => (
                  <li key={index}>{phone}</li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-gray-800 dark:text-gray-200">No phone numbers found</p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Details Section */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Product Details
          </h3>
          
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
              Product Image
            </label>
            <div className="flex items-center gap-4">
              <div 
                className="w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden"
                onClick={() => imagePreview && toggleImageModal()}
                style={{ cursor: imagePreview ? 'pointer' : 'default' }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
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
                    name="product_image" // Match the field name expected by multer
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
            {/* Add helper text to indicate the image is clickable */}
            {imagePreview && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Click on the image to view larger
              </p>
            )}
          </div>
        </div>

        {/* Job Details Section */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Job Details
          </h3>
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
        </div>
      </form>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          onClick={() => navigate("/jobs")}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleSubmit}
          disabled={isUploading}
        >
          Update Job
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

      {/* Image Preview Modal */}
      {isImageModalOpen && imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={toggleImageModal}>
          <div className="relative bg-white dark:bg-gray-800 p-2 rounded-lg max-w-3xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none" 
              onClick={toggleImageModal}
            >
              ×
            </button>
            <img 
              src={imagePreview} 
              alt="Product Preview" 
              className="max-w-full max-h-[85vh] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400?text=Image+Not+Available";
              }}
            />
            <div className="mt-3 text-center">
              <p className="text-gray-700 dark:text-gray-200">{product.productName || 'Product'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{product.model} {product.modelNumber}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditJob;