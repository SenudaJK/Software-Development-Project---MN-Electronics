import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { deviceTypes, commonIssues, availableTimeSlots } from '../../data/mockData';
import axios from 'axios';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  MessageCircle,
  Camera,
  Upload,
  CheckCircle,
  Laptop,
  Smartphone,
  Monitor,
  Tablet,
  Gamepad2,
  Cpu,
  AlertCircle,
  Radio, // For DVD player
  Fan,
  Utensils, // For Blender
  Microwave,
  Timer, // For Rice Cooker
  Music // For Amp
} from 'lucide-react';
import { format } from 'date-fns';

// Get the icon component by name
const getIconByName = (iconName: string) => {
  switch (iconName) {
    case 'smartphone':
      return <Smartphone size={36} />;
    case 'laptop':
      return <Laptop size={36} />;
    case 'monitor':
      return <Monitor size={36} />;
    case 'tablet':
      return <Tablet size={36} />;
    case 'microwave':
      return <Microwave size={36} />;
    case 'blender':
      return <Utensils size={36} />;
    case 'fan':
      return <Fan size={36} />;
    case 'dvd':
      return <Radio size={36} />;
    case 'rice-cooker':
      return <Timer size={36} />;
    case 'amp':
      return <Music size={36} />;
    case 'gamepad-2':
      return <Gamepad2 size={36} />;
    default:
      return <Cpu size={36} />;
  }
};

// Updated booking form data interface to match the products table schema
interface BookingFormData {
  deviceType: string; // Maps to product_name
  customDeviceType: string; // Used when 'other' is selected, also maps to product_name
  deviceModel: string; // Maps to model
  modelNumber: string; // Maps to model_number
  issueDescription: string;
  commonIssue: string;
  date: string;
  time: string;
  additionalNotes: string;
  productImage: File | null; // Maps to product_image
}

const NewBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerProducts, setCustomerProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Steps for the booking process
  const steps = [
    {
      title: 'Device Information',
      subtitle: 'Select your device type and provide details',
    },
    {
      title: 'Problem Description',
      subtitle: 'Tell us what\'s wrong with your device',
    },
    {
      title: 'Schedule Appointment',
      subtitle: 'Choose a convenient date and time',
    },
    {
      title: 'Review & Confirm',
      subtitle: 'Verify booking details before submitting',
    },
  ];

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BookingFormData>({
    deviceType: '',
    customDeviceType: '',
    deviceModel: '',
    modelNumber: '',
    issueDescription: '',
    commonIssue: '',
    date: '',
    time: '',
    additionalNotes: '',
    productImage: null
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch products associated with the logged-in customer
  useEffect(() => {
    const fetchCustomerProducts = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingProducts(true);
        console.log('Fetching customer products for user ID:', user.id);
        
        const response = await axios.get(
          `http://localhost:5000/api/products/customer/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        console.log('Customer products response:', response);
        setCustomerProducts(response.data);
      } catch (error: any) {
        console.error('Error fetching customer products:', error);
        
        // Log more detailed error information for debugging
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
        }
        
        // Set empty array to avoid UI issues
        setCustomerProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    fetchCustomerProducts();
  }, [user]);
  // Handle next step
  const handleNextStep = () => {
    setError(null); // Clear any previous errors
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    window.scrollTo(0, 0);
  };

  // Handle previous step
  const handlePrevStep = () => {
    setError(null); // Clear any previous errors
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  // Handle form data changes
  const updateFormData = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle device type selection
  const handleDeviceTypeSelect = (deviceType: string) => {
    // If selecting a non-'other' device type, clear customDeviceType
    if (deviceType !== 'other') {
      updateFormData('customDeviceType', '');
    }
    updateFormData('deviceType', deviceType);
  };

  // Handle common issue selection
  const handleCommonIssueSelect = (issue: string) => {
    updateFormData('commonIssue', issue);
    updateFormData('issueDescription', issue);
  };
  // Handle date selection
  const handleDateSelect = (date: string) => {
    // Clear any previous date validation errors
    setError(null);
    
    // Validate that the selected date is today or in the future
    if (date) {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to beginning of day for comparison
      
      if (selectedDate < today) {
        setError('Please select today or a future date');
        return;
      }
    }
    
    updateFormData('date', date);
    // Reset time when date changes
    updateFormData('time', '');
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    updateFormData('time', time);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateFormData('productImage', file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isCurrentStepValid() || !termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (!user || !user.id) {
      setError('You must be logged in to make a booking');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Format the date properly if it's a date object
      const formattedDate = typeof formData.date === 'string' 
        ? formData.date 
        : format(new Date(formData.date), 'EEEE, MMMM d, yyyy');

      // Create form data for file upload
      const bookingFormData = new FormData();

      // Add customer ID for the booking
      bookingFormData.append('customerId', user.id.toString());
      
      // If using an existing product, include its ID instead of creating a new one
      if (selectedProduct) {
        bookingFormData.append('existingProduct', 'true');
        bookingFormData.append('product_id', selectedProduct.product_id.toString());
      } else {
        // Add product info only if we're creating a new product
        bookingFormData.append('existingProduct', 'false');
        
        // Use customDeviceType if selected device type is 'other'
        const productName = formData.deviceType === 'other' && formData.customDeviceType 
          ? formData.customDeviceType 
          : formData.deviceType;
        bookingFormData.append('productName', productName);
        bookingFormData.append('model', formData.deviceModel);
        bookingFormData.append('modelNumber', formData.modelNumber || '');
        
        // Handle product images for new products
        if (formData.productImage) {
          bookingFormData.append('productImage', formData.productImage);
        }
      }

      // Add repair info (always needed)
      bookingFormData.append('repairDescription', formData.issueDescription);

      // Add appointment info (always needed)
      bookingFormData.append('date', formattedDate);
      bookingFormData.append('time', formData.time);
      bookingFormData.append('additionalNotes', formData.additionalNotes || '');

      // Send to backend
      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        bookingFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('Booking response:', response.data);

      // Navigate to confirmation page with booking details and backend response
      navigate('/booking-confirmation', {
        state: {
          booking: {
            ...formData,
            bookingReference: response.data.bookingReference,
            jobId: response.data.jobId,
            productId: response.data.productId,
            bookingId: response.data.bookingId,
            modelNumber: formData.modelNumber
          }
        }
      });

    } catch (err: any) {
      console.error('Booking error:', err);
      // Handle the specific conflict error from the backend
      if (err.response && err.response.status === 409) {
        setError('This time slot is already booked. Please select a different time.');
      } else {
        setError(err?.response?.data?.message || 'Failed to create booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  // Validation for the current step
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: // Device Information
        if (formData.deviceType === 'other') {
          return !!formData.customDeviceType && !!formData.deviceModel;
        }
        return !!formData.deviceType && !!formData.deviceModel;
      case 1: // Problem Description
        return !!formData.issueDescription;      case 2: // Schedule Appointment
        // Check if date is valid (today or future date)
        if (!formData.date) return false;
        
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to beginning of day for comparison
        const isDateValid = selectedDate >= today;
        
        if (!isDateValid) {
          setError('Please select today or a future date');
          return false;
        }
        
        return isDateValid && !!formData.time;
      case 3: // Review
        return termsAccepted;
      default:
        return true;
    }
  };

  // Handle selecting a product
  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);

    // Autofill form fields with selected product details
    setFormData((prev) => ({
      ...prev,
      deviceType: product.product_name || '',
      customDeviceType: '',
      deviceModel: product.model || '',
      modelNumber: product.model_number || '',
      productImage: null // Reset any new file uploads when selecting an existing product
    }));

    // Set image preview if product image exists
    if (product.product_image) {
      setImagePreview(product.product_image);
    } else {
      setImagePreview(null); // Clear preview if no image exists
    }
  };

  // Render the device information step
  const renderDeviceInformationStep = () => {
    return (
      <div>
        {isLoadingProducts ? (
          <div className="mb-6 p-4 text-center">
            <p className="text-text-secondary">Loading your previous devices...</p>
          </div>
        ) : customerProducts.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-text mb-4">Your Previous Devices</h3>
            <p className="text-text-secondary mb-4">Select a device you've previously booked to autofill details:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customerProducts.map((product) => (
                <div 
                  key={product.product_id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedProduct?.product_id === product.product_id
                      ? 'border-primary bg-primary bg-opacity-5'
                      : 'border-gray-200 hover:border-primary-light'
                  }`}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="flex items-center">
                    {product.product_image ? (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 mr-3 overflow-hidden flex-shrink-0">
                        <img 
                          src={product.product_image}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 mr-3 flex items-center justify-center flex-shrink-0">
                        {getIconByName(product.product_name.toLowerCase())}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-text">{product.product_name}</p>
                      <p className="text-sm text-text-secondary">{product.model} {product.model_number && `(${product.model_number})`}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-200"></div>
              <p className="mx-4 text-text-secondary text-sm">OR</p>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
          </div>
        ) : null}
        
        <h3 className="text-lg font-bold text-text mb-4">Select Your Device Type</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {deviceTypes.map((device) => (
            <div
              key={device.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                formData.deviceType === device.id
                  ? 'border-primary bg-primary bg-opacity-5'
                  : 'border-gray-200 hover:border-primary-light'
              }`}
              onClick={() => handleDeviceTypeSelect(device.id)}
            >
              <div className="flex justify-center mb-2 text-primary">
                {getIconByName(device.icon)}
              </div>
              <p className="font-medium text-text">{device.name}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {formData.deviceType === 'other' && (
            <Input
              id="custom-device-type"
              label="Specify Device Type"
              value={formData.customDeviceType}
              onChange={(e) => updateFormData('customDeviceType', e.target.value)}
              placeholder="e.g., Air Conditioner, Washing Machine, Toaster"
              required
            />
          )}
          
          <Input
            id="device-model"
            label="Device Model"
            value={formData.deviceModel}
            onChange={(e) => updateFormData('deviceModel', e.target.value)}
            placeholder="e.g., iPhone 13, Galaxy S22, XPS 15"
            required
          />

          <Input
            id="model-number"
            label="Model Number (If available)"
            value={formData.modelNumber}
            onChange={(e) => updateFormData('modelNumber', e.target.value)}
            placeholder="e.g., A2633, SM-S901U"
          />
        </div>
      </div>
    );
  };
  // Render the schedule step
  const renderScheduleStep = () => {
    return (
      <div>
        <h3 className="text-lg font-bold text-text mb-4">Schedule Your Appointment</h3>
        
        {error && (
          <div className="bg-error-light text-error p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="space-y-4">          <Input
            id="appointment-date"
            label="Select Date (Today or future dates only)"
            type="date"
            value={formData.date}
            onChange={(e) => handleDateSelect(e.target.value)}
            min={new Date().toISOString().split('T')[0]} // Set minimum date to today
            required
          />
          <Input
            id="appointment-time"
            label="Select Time"
            type="time"
            value={formData.time}
            onChange={(e) => handleTimeSelect(e.target.value)}
            required
          />
        </div>
      </div>
    );
  };

  // Render the problem description step with file upload
  const renderProblemDescriptionStep = () => {
    const selectedDeviceType = formData.deviceType;
    const issues = commonIssues[selectedDeviceType as keyof typeof commonIssues] || [];

    return (
      <div>
        <h3 className="text-lg font-bold text-text mb-4">What's the problem with your device?</h3>

        {issues.length > 0 && (
          <div className="mb-6">
            <p className="text-text-secondary mb-2">Common issues:</p>

            <div className="flex flex-wrap gap-2">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`py-1 px-3 rounded-full cursor-pointer border transition-all ${
                    formData.commonIssue === issue
                      ? 'border-primary bg-primary bg-opacity-5 text-primary'
                      : 'border-gray-200 hover:border-primary-light text-text-secondary'
                  }`}
                  onClick={() => handleCommonIssueSelect(issue)}
                >
                  {issue}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="mb-4">
            <label htmlFor="issueDescription" className="form-label">
              Describe the issue
            </label>
            <textarea
              id="issueDescription"
              rows={4}
              value={formData.issueDescription}
              onChange={(e) => updateFormData('issueDescription', e.target.value)}
              placeholder="Please provide as much detail as possible about the problem..."
              className="form-input"
              required
            ></textarea>
          </div>

          <div>
            <p className="form-label">Add photos (optional)</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="mb-4">
                  <img 
                    src={imagePreview} 
                    alt="Device preview" 
                    className="max-h-48 mx-auto rounded-md" 
                  />
                </div>
              ) : (
                <div className="flex justify-center mb-3">
                  <Camera size={36} className="text-text-secondary" />
                </div>
              )}
              <p className="text-text-secondary mb-2">
                Upload photos of the device or damage
              </p>
              <p className="text-sm text-text-secondary mb-4">
                This helps our technicians better understand the issue
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <span className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                  <Upload size={16} className="mr-2" />
                  {imagePreview ? 'Change Photo' : 'Upload Photos'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the review step with terms and conditions
  const renderReviewStep = () => {
    const selectedDevice = deviceTypes.find((d) => d.id === formData.deviceType);
    const deviceTypeName = formData.deviceType === 'other' && formData.customDeviceType
      ? formData.customDeviceType
      : selectedDevice?.name || formData.deviceType;
    const selectedDate = formData.date 
      ? format(new Date(formData.date), 'EEEE, MMMM d, yyyy')
      : '';

    return (
      <div>
        <h3 className="text-lg font-bold text-text mb-4">Review Your Booking Details</h3>

        {error && (
          <div className="bg-error-light text-error p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <Card padding="sm" className="border border-gray-200">
            <h4 className="font-medium text-text mb-3">Device Information</h4>

            <div className="grid grid-cols-2 gap-4">
              {selectedProduct && (
                <div className="col-span-2">
                  <p className="text-sm text-text-secondary mb-1">Using Previous Device</p>
                  <p className="font-medium text-primary mb-3">
                    {selectedProduct.product_name} - {selectedProduct.model}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-text-secondary">Device Type</p>
                <p className="font-medium text-text">{deviceTypeName}</p>
              </div>

              <div>
                <p className="text-sm text-text-secondary">Model</p>
                <p className="font-medium text-text">{formData.deviceModel}</p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-text-secondary">Model Number</p>
                <p className="font-medium text-text">{formData.modelNumber || 'Not provided'}</p>
              </div>
            </div>

            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-text-secondary mb-2">Device Photo</p>
                <img 
                  src={imagePreview} 
                  alt="Device" 
                  className="h-32 w-auto rounded-md border border-gray-200" 
                />
              </div>
            )}
          </Card>

          <Card padding="sm" className="border border-gray-200">
            <h4 className="font-medium text-text mb-3">Issue Description</h4>
            <p className="text-text">{formData.issueDescription}</p>
          </Card>

          <Card padding="sm" className="border border-gray-200">
            <h4 className="font-medium text-text mb-3">Appointment Details</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Date</p>
                <p className="font-medium text-text">{selectedDate}</p>
              </div>

              <div>
                <p className="text-sm text-text-secondary">Time</p>
                <p className="font-medium text-text">{formData.time}</p>
              </div>
            </div>

            {formData.additionalNotes && (
              <div className="mt-3">
                <p className="text-sm text-text-secondary">Additional Notes</p>
                <p className="text-text">{formData.additionalNotes}</p>
              </div>
            )}
          </Card>

          <Card padding="sm" className="border border-gray-200 bg-success-light">
            <div className="flex items-start">
              <CheckCircle size={24} className="text-success mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-text mb-1">No Payment Required Now</h4>
                <p className="text-sm text-text-secondary">
                  You'll receive a diagnostic fee estimate after we examine your device. No payment is required until you approve the repair.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="h-4 w-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-text-secondary">
              I agree to the{' '}
              <a href="#" className="text-primary hover:text-primary-dark">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:text-primary-dark">
                Privacy Policy
              </a>
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text font-heading">Book a Repair</h1>
        <p className="text-text-secondary">Schedule a repair service for your electronic device</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="hidden sm:block">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-text-secondary'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle size={16} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-text">{step.title}</p>
                    <p className="text-xs text-text-secondary">{step.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-3 h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: index < currentStep ? '100%' : '0%',
                      }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="sm:hidden">
          <div className="flex justify-between mb-2">
            <p className="text-sm font-medium text-text">Step {currentStep + 1} of {steps.length}</p>
            <p className="text-sm font-medium text-text">{steps[currentStep].title}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="mb-8">
        {currentStep === 0 && renderDeviceInformationStep()}
        {currentStep === 1 && renderProblemDescriptionStep()}
        {currentStep === 2 && renderScheduleStep()}
        {currentStep === 3 && renderReviewStep()}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          leftIcon={<ChevronLeft size={16} />}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            variant="primary"
            onClick={handleNextStep}
            rightIcon={<ChevronRight size={16} />}
            disabled={!isCurrentStepValid()}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewBookingPage;