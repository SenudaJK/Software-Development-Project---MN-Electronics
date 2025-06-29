import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, CalendarClock, User, Package, Clipboard,
  Mail, Phone, Check, X, AlertTriangle, Clock, CheckCircle, 
  XCircle, RefreshCw, Wrench
} from 'lucide-react';

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (status: string) => {
    setProcessing(true);
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, {
        status: status === 'accept' ? 'Accepted' : 'Cancelled'
      });
      
      // Update local state
      setBooking({
        ...booking,
        repair_status: status === 'accept' ? 'Accepted' : 'Cancelled'
      });
      
      // Show success message
      setSuccessMessage(`Booking successfully ${status === 'accept' ? 'accepted' : 'cancelled'}.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error(`Error updating booking status:`, error);
      setError(`Failed to update booking status. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
            <p>{error}</p>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/bookings')}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">Booking not found</p>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/bookings')}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPending = booking.repair_status === 'Booking Pending';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Bookings
          </button>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center animate-fadeIn">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                Booking #{id}
              </h1>
              
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                  booking.repair_status === 'Booking Pending' 
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300' 
                    : booking.repair_status === 'Accepted' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : booking.repair_status === 'Cancelled' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                }`}>
                  {booking.repair_status === 'Booking Pending' && <AlertTriangle className="h-4 w-4 mr-1.5" />}
                  {booking.repair_status === 'Accepted' && <Check className="h-4 w-4 mr-1.5" />}
                  {booking.repair_status === 'Cancelled' && <X className="h-4 w-4 mr-1.5" />}
                  {booking.repair_status === 'In Progress' && <Wrench className="h-4 w-4 mr-1.5" />}
                  {booking.repair_status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Booking Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Customer Info */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Customer Information
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="font-medium">{booking.firstName} {booking.lastName}</p>
                  </div>
                  
                  {booking.email && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={`mailto:${booking.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {booking.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {booking.phone_numbers && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <a href={`tel:${booking.phone_numbers.split(',')[0]}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {booking.phone_numbers.split(',')[0]}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Column - Product Info */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2 text-purple-500" />
                  Product Information
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Product Name</p>
                    <p className="font-medium">{booking.product_name}</p>
                  </div>
                  
                  {booking.model && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
                      <p>{booking.model}</p>
                    </div>
                  )}
                  
                  {booking.model_number && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Model Number</p>
                      <p>{booking.model_number}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Appointment Details */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <CalendarClock className="h-5 w-5 mr-2 text-amber-500" />
                Appointment Details
              </h2>
              
              <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium">{new Date(booking.Date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-medium">{booking.Time}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Repair Description */}
            {booking.repair_description && (
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Clipboard className="h-5 w-5 mr-2 text-green-500" />
                  Repair Description
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
                  <p className="whitespace-pre-line">{booking.repair_description}</p>
                </div>
              </div>
            )}
            
            {/* Action Buttons for Pending Bookings */}
            {isPending && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => updateBookingStatus('accept')}
                  disabled={processing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-medium flex items-center justify-center disabled:opacity-70"
                >
                  {processing ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  Accept Booking
                </button>
                
                <button
                  onClick={() => updateBookingStatus('cancel')}
                  disabled={processing}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 rounded-lg py-3 font-medium flex items-center justify-center disabled:opacity-70"
                >
                  {processing ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-5 w-5 mr-2" />
                  )}
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;