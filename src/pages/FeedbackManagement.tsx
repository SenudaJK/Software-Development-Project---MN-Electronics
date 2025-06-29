import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Search, 
  RefreshCw, 
  User, 
  Wrench, 
  Package,
  Filter,
  Clock
} from 'lucide-react';

interface Feedback {
  Feedback_ID: number;
  Job_ID: number;
  feedback: string;
  repair_description: string;
  repair_status: string;
  customer_firstName: string;
  customer_lastName: string;
  product_name: string;
  model: string;
  model_number: string;
}

const FeedbackManagement = () => {
  // State for feedbacks and UI controls
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  
  // Filter states
  const [filterByCustomer, setFilterByCustomer] = useState('');
  const [filterByJob, setFilterByJob] = useState('');
  const [filterByStatus, setFilterByStatus] = useState('');
  
  // Fetch all feedbacks
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:5000/api/feedback');
      setFeedbacks(response.data);
      setFilteredFeedbacks(response.data);
    } catch (err: any) {
      console.error('Error fetching feedbacks:', err);
      setError(err.response?.data?.message || 'Error fetching feedback data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent feedbacks
  const fetchRecentFeedbacks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:5000/api/feedback/recent/ten');
      setFeedbacks(response.data);
      setFilteredFeedbacks(response.data);
      setSuccess('Showing 10 most recent feedbacks');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error fetching recent feedbacks:', err);
      setError(err.response?.data?.message || 'Error fetching recent feedback data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch feedback details
  const fetchFeedbackDetails = async (id: number) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`http://localhost:5000/api/feedback/${id}`);
      setSelectedFeedback(response.data);
    } catch (err: any) {
      console.error(`Error fetching feedback details for ID ${id}:`, err);
      setError(err.response?.data?.message || 'Error fetching feedback details');
    } finally {
      setLoading(false);
    }
  };

  // Load feedbacks on component mount
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Apply search and filters
  useEffect(() => {
    let result = feedbacks;
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(feedback => 
        feedback.customer_firstName.toLowerCase().includes(query) ||
        feedback.customer_lastName.toLowerCase().includes(query) ||
        feedback.product_name.toLowerCase().includes(query) ||
        feedback.model.toLowerCase().includes(query) ||
        feedback.model_number.toLowerCase().includes(query) ||
        feedback.repair_description.toLowerCase().includes(query) ||
        feedback.feedback.toLowerCase().includes(query)
      );
    }
    
    // Apply customer filter
    if (filterByCustomer) {
      result = result.filter(feedback => 
        `${feedback.customer_firstName} ${feedback.customer_lastName}`.toLowerCase().includes(filterByCustomer.toLowerCase())
      );
    }
    
    // Apply job filter
    if (filterByJob) {
      result = result.filter(feedback => 
        feedback.Job_ID.toString() === filterByJob
      );
    }
    
    // Apply status filter
    if (filterByStatus) {
      result = result.filter(feedback => 
        feedback.repair_status.toLowerCase() === filterByStatus.toLowerCase()
      );
    }
    
    setFilteredFeedbacks(result);
  }, [feedbacks, searchQuery, filterByCustomer, filterByJob, filterByStatus]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterByCustomer('');
    setFilterByJob('');
    setFilterByStatus('');
    setFilteredFeedbacks(feedbacks);
  };

  // Get unique repair status values for filter dropdown
  const uniqueStatuses = Array.from(new Set(feedbacks.map(f => f.repair_status)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <MessageSquare className="mr-2" size={28} />
            Customer Feedback Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and analyze customer feedback for repair jobs
          </p>
        </div>
        
        {/* Error and Success messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-center text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md flex items-center text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div>{success}</div>
          </div>
        )}
        
        {/* Actions and search bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search feedback by customer, product, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={fetchFeedbacks}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh All
              </button>
              
              <button 
                onClick={fetchRecentFeedbacks}
                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                <Clock className="mr-2 h-4 w-4" />
                Recent 10
              </button>
              
              <button 
                onClick={resetFilters}
                className="flex items-center px-4 py-2 border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Advanced filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Customer
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Customer name..."
                  value={filterByCustomer}
                  onChange={(e) => setFilterByCustomer(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Job ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Wrench className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Job ID..."
                  value={filterByJob}
                  onChange={(e) => setFilterByJob(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Repair Status
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={filterByStatus}
                  onChange={(e) => setFilterByStatus(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status, idx) => (
                    <option key={idx} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Feedback List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-3">Feedback ID</th>
                  <th className="px-4 py-3">Job ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Repair Status</th>
                  <th className="px-4 py-3">Feedback</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p>Loading feedback data...</p>
                    </td>
                  </tr>
                ) : filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>No feedback found matching your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <tr 
                      key={feedback.Feedback_ID}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-4 font-medium text-gray-800 dark:text-gray-200">
                        #{feedback.Feedback_ID}
                      </td>
                      <td className="px-4 py-4">
                        #{feedback.Job_ID}
                      </td>
                      <td className="px-4 py-4">
                        {feedback.customer_firstName} {feedback.customer_lastName}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium">{feedback.product_name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {feedback.model} {feedback.model_number && `(${feedback.model_number})`}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${feedback.repair_status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                            feedback.repair_status.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                            feedback.repair_status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                          {feedback.repair_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <div className="truncate">{feedback.feedback}</div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => fetchFeedbackDetails(feedback.Feedback_ID)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Feedback Detail Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Feedback #{selectedFeedback.Feedback_ID}
                  </h2>
                  <button 
                    onClick={() => setSelectedFeedback(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer</h3>
                    <p className="text-base text-gray-900 dark:text-white">
                      {selectedFeedback.customer_firstName} {selectedFeedback.customer_lastName}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Job ID</h3>
                    <p className="text-base text-gray-900 dark:text-white">#{selectedFeedback.Job_ID}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Product</h3>
                    <p className="text-base text-gray-900 dark:text-white">
                      {selectedFeedback.product_name} {selectedFeedback.model} 
                      {selectedFeedback.model_number && ` (${selectedFeedback.model_number})`}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Repair Status</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${selectedFeedback.repair_status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        selectedFeedback.repair_status.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                        selectedFeedback.repair_status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                    >
                      {selectedFeedback.repair_status}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Repair Description</h3>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200">
                    {selectedFeedback.repair_description}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Customer Feedback</h3>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-gray-800 dark:text-gray-200">
                    <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400 mb-2" />
                    <p>{selectedFeedback.feedback}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default FeedbackManagement;