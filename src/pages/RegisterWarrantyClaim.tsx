import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarIcon, ArrowLeftIcon, ClipboardCheckIcon, UserIcon, BriefcaseIcon } from 'lucide-react';

interface JobDetails {
  job_id: string;
  repair_description: string;
  repair_status: string;
  handover_date: string;
  warranty_eligible: boolean;
  assigned_employee: string;
  assigned_employee_name: string;
  customer_id: string;
  customer_firstName: string;
  customer_lastName: string;
  customer_email: string;
  phone_numbers: string;
  product_name: string;
  product_id: string;
  model: string;
  model_number: string;
  product_image: string | null;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const RegisterWarrantyClaim: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [repairDescription, setRepairDescription] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [employeesLoading, setEmployeesLoading] = useState(true);

  // Fetch job details
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch job details
        const jobResponse = await axios.get(`http://localhost:5000/api/jobs/job-details/${jobId}`);
        console.log("Raw job details from API:", jobResponse.data);
        
        // Check if the product_id field exists in the response
        if (!jobResponse.data.product_id) {
          console.warn("Warning: No product_id found in API response");
        }
        
        setJobDetails(jobResponse.data);
        
        // Set the previously assigned employee as default if available
        if (jobResponse.data.assigned_employee) {
          setSelectedEmployeeId(jobResponse.data.assigned_employee);
        }

        // Fetch employees list
        fetchEmployees();
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch required data');
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    } else {
      setError('No job ID provided');
      setIsLoading(false);
    }
  }, [jobId]);

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/employees/all');
      setEmployees(response.data);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      // Don't set error state here to avoid blocking the main functionality
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Update the handleSubmit function to handle missing product_id
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobDetails) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Log the entire jobDetails object to see all properties
      console.log("Job details:", JSON.stringify(jobDetails, null, 2));
      
      // Check for missing product_id and handle it
      if (!jobDetails.product_id) {
        setError('Product ID is missing from job details. Cannot proceed.');
        setIsSubmitting(false);
        return;
      }
      
      // Specific debug for the values we're sending
      console.log("customer_id type:", typeof jobDetails.customer_id, "value:", jobDetails.customer_id);
      console.log("product_id type:", typeof jobDetails.product_id, "value:", jobDetails.product_id);
      
      // Check if values are numeric but stored as strings
      const customerIdValue = Number(jobDetails.customer_id);
      const productIdValue = Number(jobDetails.product_id);
      
      console.log("customerIdValue:", customerIdValue, "isNaN:", isNaN(customerIdValue));
      console.log("productIdValue:", productIdValue, "isNaN:", isNaN(productIdValue));
      
      const payload = {
        previousJobId: jobId,
        customerId: customerIdValue,
        productId: productIdValue,
        repairDescription,
        // Set the repair status to indicate a warranty claim
        repairStatus: 'Warranty-Claimed', // Changed from 'Pending' to 'Warranty-Claimed'
        warrantyEligible: true,
        employeeId: selectedEmployeeId,
        receivedDate
      };
      
      // Log the payload we're about to send
      console.log("Sending payload:", JSON.stringify(payload, null, 2));
      
      const response = await axios.post('http://localhost:5000/api/jobs/register-warranty-claim', payload);
      
      // Log the full response object
      console.log("Full API response:", JSON.stringify(response.data, null, 2));
      
      setSuccessMessage('Warranty claim registered successfully!');
      
      // Navigate to the job details page after successful submission
      setTimeout(() => {
        navigate(`/jobs/${response.data.jobId}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error details:", err.response?.data);
      setError(err.response?.data?.message || 'Failed to register warranty claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        <div className="container mx-auto max-w-3xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="container mx-auto max-w-3xl bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Register Warranty Claim</h1>
        </div>
        
        {successMessage && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-md mb-6">
            <p>{successMessage}</p>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Original Job Details</h2>
          <div className="flex flex-wrap gap-4">
            <p className="text-blue-600 dark:text-blue-400">
              <span className="font-medium">Job ID:</span> {jobDetails?.job_id}
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              <span className="font-medium">Status:</span> {jobDetails?.repair_status}
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              <span className="font-medium">Handover Date:</span> {jobDetails?.handover_date && new Date(jobDetails.handover_date).toLocaleDateString()}
            </p>
            {jobDetails?.assigned_employee_name && (
              <p className="text-blue-600 dark:text-blue-400">
                <span className="font-medium">Previous Technician:</span> {jobDetails.assigned_employee_name}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              Customer Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong>Name:</strong> {jobDetails?.customer_firstName} {jobDetails?.customer_lastName}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong>Email:</strong> {jobDetails?.customer_email}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Phone:</strong> {jobDetails?.phone_numbers}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <ClipboardCheckIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              Product Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong>Name:</strong> {jobDetails?.product_name}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong>Model:</strong> {jobDetails?.model}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Model Number:</strong> {jobDetails?.model_number}
            </p>
          </div>
        </div>

        {jobDetails?.product_image && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Product Image</h2>
            <img 
              src={jobDetails.product_image} 
              alt={jobDetails.product_name} 
              className="max-w-xs rounded-md shadow-md" 
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
              New Warranty Job Details
            </h2>
            
            <div className="mb-4">
              <label htmlFor="repairDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repair Description *
              </label>
              <textarea
                id="repairDescription"
                value={repairDescription}
                onChange={(e) => setRepairDescription(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                rows={4}
                required
                placeholder="Please describe the issue that requires warranty service..."
              />
            </div>

            <div className="mb-4">
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigned Employee *
              </label>
              
              {employeesLoading ? (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                  Loading employees...
                </div>
              ) : (
                <select
                  id="employeeId"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  required
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} ({employee.role})
                    </option>
                  ))}
                </select>
              )}
              
              {jobDetails?.assigned_employee_name && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Recommended: Use the same technician - {jobDetails.assigned_employee_name}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="receivedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" /> Received Date *
              </label>
              <input
                type="date"
                id="receivedDate"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-300 disabled:opacity-50 flex items-center"
              disabled={isSubmitting}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" /> Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 disabled:opacity-50 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Submitting...
                </>
              ) : (
                <>Register Warranty Claim</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterWarrantyClaim;