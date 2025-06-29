import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeft,
  Save,
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  Package,
  FileEdit,
  CheckCircle,
  Bell
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Booking {
  BookingID: number;
  Date: string;
  Time: string;
  job_id: number;
  repair_description: string;
  repair_status: string;
  handover_date?: string;
  product_id: number;
  product_name: string;
  model?: string;
  model_number?: string;
  product_image?: string;
  customer_id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone_numbers?: string;
}

const EditBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Form state
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingTime, setBookingTime] = useState<string>('');
  const [repairDescription, setRepairDescription] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [modelNumber, setModelNumber] = useState<string>('');
  const [sendNotification, setSendNotification] = useState<boolean>(true);
  
  // Available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];
  
  useEffect(() => {
    const fetchBookingDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Improved booking fetch strategy
        // Try multiple approaches to find the booking

        // Approach 1: Direct search by ID first (assuming backend supports numeric ID search)
        let foundBooking = null;
        
        // Try just using the main bookings endpoint with a large limit
        const response = await axios.get(`http://localhost:5000/api/bookings`, {
          params: {
            page: 1,
            limit: 100, // Use a larger limit to ensure we find it
            sortBy: 'BookingID', // Sort by ID to help find it faster
          }
        });
        
        if (response.data.bookings && response.data.bookings.length > 0) {
          // Find the exact booking by ID
          foundBooking = response.data.bookings.find(
            (b: Booking) => b.BookingID === parseInt(id || '0')
          );
        }
        
        // If the booking is still not found, try the search method
        if (!foundBooking) {
          console.log("Trying alternative search method for booking ID:", id);
          const searchResponse = await axios.get(`http://localhost:5000/api/bookings`, {
            params: {
              page: 1,
              limit: 100,
              search: id // Use the ID as a search term
            }
          });
          
          if (searchResponse.data.bookings && searchResponse.data.bookings.length > 0) {
            foundBooking = searchResponse.data.bookings.find(
              (b: Booking) => b.BookingID === parseInt(id || '0')
            );
          }
        }
        
        // If booking is found, set the form values
        if (foundBooking) {
          console.log("Found booking:", foundBooking);
          setBooking(foundBooking);
          
          // Initialize form fields
          const bookingDate = new Date(foundBooking.Date);
          setBookingDate(bookingDate);
          setBookingTime(foundBooking.Time);
          setRepairDescription(foundBooking.repair_description || '');
          setProductName(foundBooking.product_name || '');
          setModel(foundBooking.model || '');
          setModelNumber(foundBooking.model_number || '');
        } else {
          console.error("Booking not found with ID:", id);
          setError(`Booking with ID ${id} not found. Please try again or go back to the bookings list.`);
        }
      } catch (err: any) {
        console.error('Error fetching booking details:', err);
        setError(err.response?.data?.error || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking || !bookingDate) {
      setError('Missing required information');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Format date for API using the expected format in helper function
      const formattedDate = bookingDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      
      // Prepare data for API
      const updateData = {
        date: formattedDate,
        time: bookingTime,
        repairDescription,
        productId: booking.product_id,
        productName,
        model,
        modelNumber,
        sendNotification
      };
      
      console.log("Updating booking with data:", updateData);
      
      // Update booking
      const response = await axios.put(`http://localhost:5000/api/bookings/book/${booking.BookingID}`, updateData);
      
      console.log("Update response:", response.data);
      
      if (response.data.success) {
        setSuccess(true);
        
        // Redirect after success
        setTimeout(() => {
          navigate(`/bookings/${booking.BookingID}`);
        }, 1500);
      } else {
        setError('Failed to update booking');
      }
    } catch (err: any) {
      console.error('Error updating booking:', err);
      if (err.response?.status === 409) {
        // Special handling for conflict (time slot already booked)
        setError(err.response?.data?.message || 'This time slot is already booked. Please select a different time.');
      } else {
        setError(err.response?.data?.message || 'Failed to update booking');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }
  
  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Booking Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <button
                onClick={() => navigate('/bookings')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/bookings/${id}`)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Booking Details
        </button>
        
        {/* Form Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Booking #{booking?.BookingID}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update booking details for {booking?.firstName} {booking?.lastName}
          </p>
        </div>
        
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-md flex items-center mb-4">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>Booking updated successfully! Redirecting...</p>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-md flex items-center mb-4">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Edit Form */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-x border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Appointment Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Booking Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={bookingDate}
                      onChange={(date) => setBookingDate(date)}
                      minDate={new Date()}
                      placeholderText="Select date"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      dateFormat="MMMM d, yyyy"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Time Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Booking Time
                  </label>
                  <div className="relative">
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <Clock className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-500" />
                Product Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                {/* Model Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FileEdit className="h-5 w-5 mr-2 text-green-500" />
                Repair Details
              </h2>
              
              {/* Repair Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Repair Description / Issue
                </label>
                <textarea
                  value={repairDescription}
                  onChange={(e) => setRepairDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[100px]"
                  placeholder="Describe the issue or repair needed..."
                />
              </div>
            </div>
            
            {/* Notification Option */}
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendNotification"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="sendNotification" className="ml-2 flex items-center text-blue-700 dark:text-blue-300">
                  <Bell className="h-4 w-4 mr-2" />
                  Send email notification to customer about this update
                </label>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 ml-6">
                The customer will receive an email with the updated booking details
              </p>
            </div>
          </form>
        </div>
        
        {/* Action Buttons */}
        <div className="bg-gray-50 dark:bg-gray-750 rounded-b-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={() => navigate(`/bookings/${id}`)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !bookingDate || !bookingTime}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center ${
              (saving || !bookingDate || !bookingTime) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBooking;