import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Printer,
  Download,
  ChevronRight,
  Cpu,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Tv,
  Gamepad2
} from 'lucide-react';
import { format } from 'date-fns';
import { deviceTypes } from '../../data/mockData';

// Add this helper function at the top of your component
const formatDateFromString = (dateString: string): string => {
  try {
    // If it's already formatted, return as is
    if (dateString.includes(',')) return dateString;
    
    // Otherwise try to format it
    return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if formatting fails
  }
};

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || { booking: null };
  
  // Redirect to booking page if no booking data
  React.useEffect(() => {
    if (!booking) {
      navigate('/new-booking');
    }
  }, [booking, navigate]);
  
  if (!booking) {
    return null;
  }
  
  const selectedDevice = deviceTypes.find((d) => d.id === booking.deviceType);
  const selectedDate = booking.date ? formatDateFromString(booking.date) : '';
  
  // Generate a random booking reference
  const bookingReference = booking.bookingReference || `MN-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Get icon component based on device type
  const getDeviceIcon = () => {
    if (!selectedDevice) return <Cpu size={32} className="text-primary" />;
    
    switch (selectedDevice.icon) {
      case 'smartphone':
        return <Smartphone size={32} className="text-primary" />;
      case 'laptop':
        return <Laptop size={32} className="text-primary" />;
      case 'monitor':
        return <Monitor size={32} className="text-primary" />;
      case 'tablet':
        return <Tablet size={32} className="text-primary" />;
      case 'tv':
        return <Tv size={32} className="text-primary" />;
      case 'gamepad-2':
        return <Gamepad2 size={32} className="text-primary" />;
      default:
        return <Cpu size={32} className="text-primary" />;
    }
  };
  
  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success bg-opacity-10 text-success mb-4">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text font-heading mb-2">Booking Confirmed!</h1>
          <p className="text-text-secondary text-lg">
            Your repair appointment has been successfully scheduled
          </p>
        </div>
        
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start border-b border-gray-200 pb-6 mb-6">
            <div className="rounded-full bg-primary bg-opacity-10 p-4 mb-4 sm:mb-0 sm:mr-6">
              {getDeviceIcon()}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-text-secondary mb-1">Booking Reference</p>
              <h2 className="text-xl font-bold text-text mb-1">{bookingReference}</h2>
              <p className="text-text-secondary">
                {selectedDevice?.name} • {booking.deviceBrand} {booking.deviceModel}
              </p>
              {booking.modelNumber && (
                <p className="text-sm text-text-secondary mt-1">
                  Model #: {booking.modelNumber}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-bold text-text mb-3">Appointment Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Date</p>
                    <p className="font-medium text-text">{selectedDate}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Time</p>
                    <p className="font-medium text-text">{booking.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Location</p>
                    <p className="font-medium text-text">1B Jayathilaka Road</p>
                    <p className="text-text-secondary">Panadura, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-text mb-3">Service Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Issue Description</p>
                  <p className="text-text">{booking.issueDescription}</p>
                </div>
                
                {booking.additionalNotes && (
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Additional Notes</p>
                    <p className="text-text">{booking.additionalNotes}</p>
                  </div>
                )}
                
                
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-text mb-3">What's Next?</h3>
            
            <ol className="space-y-3">
              <li className="flex">
                <span className="bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 mt-0.5">1</span>
                <p className="text-text-secondary">
                  We'll send a confirmation email with your booking details. Please bring your device to our service center at the scheduled time.
                </p>
              </li>
              <li className="flex">
                <span className="bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 mt-0.5">2</span>
                <p className="text-text-secondary">
                  Our technicians will diagnose your device and provide a detailed cost estimate before proceeding with the repair.
                </p>
              </li>
              <li className="flex">
                
              </li>
            </ol>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card className="bg-primary-light bg-opacity-10">
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-text mb-1">Need to Reschedule?</h3>
                <p className="text-text-secondary mb-3">
                  Call us at 071 2 302 138 or use your account dashboard to change your appointment.
                </p>
                <Button variant="primary" size="sm">
                  Contact Us
                </Button>
              </div>
            </div>
          </Card>
          
          {/* <Card className="bg-primary-light bg-opacity-10">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-text mb-1">Add to Calendar</h3>
                <p className="text-text-secondary mb-3">
                  Don't forget your appointment! Save it to your calendar.
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Google
                  </Button>
                  <Button variant="outline" size="sm">
                    Outlook
                  </Button>
                  <Button variant="outline" size="sm">
                    iCal
                  </Button>
                </div>
              </div>
            </div>
          </Card> */}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          {/* <Button
            variant="outline"
            className="flex-1"
            leftIcon={<Printer size={18} />}
          >
            Print Confirmation
          </Button> */}
          
          {/* <Button
            variant="outline"
            className="flex-1"
            leftIcon={<Download size={18} />}
          >
            Download Confirmation
          </Button> */}
          
          <Link to="/dashboard" className="flex-1">
            <Button
              variant="primary"
              className="w-full"
              rightIcon={<ChevronRight size={18} />}
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;