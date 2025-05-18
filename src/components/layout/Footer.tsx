import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About section */}
          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">MN Electronics</h3>
            <p className="text-sm mb-4">
              Professional electronics repair services with over 20 years of experience.
              We fix Microwave, Fans, Ampliefires, Rice Cookers, TVs, and more.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-accent-light transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-accent-light transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-accent-light transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-accent-light transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent-light transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/repair-status" className="hover:text-accent-light transition-colors">Check Repair Status</Link>
              </li>
              <li>
                <Link to="/new-booking" className="hover:text-accent-light transition-colors">Book a Repair</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-accent-light transition-colors">Customer Login</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-accent-light transition-colors">Create Account</Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-accent-light transition-colors">Microwave Repair</li>
              <li className="hover:text-accent-light transition-colors">Fan Repair</li>
              <li className="hover:text-accent-light transition-colors">Rice Cooker Repair</li>
              <li className="hover:text-accent-light transition-colors">DVD Repair</li>
              <li className="hover:text-accent-light transition-colors">TV Repair</li>
              <li className="hover:text-accent-light transition-colors">Amplifier Repair</li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>1B Jayathilaka Road, Panadura, Sri Lanka</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>+94 71 2 302 138</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>info@mnelectronics.com</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <div>Mon-Fri: 7:00 AM - 7:00 PM</div>
                  <div>Sat: 10:00 AM - 5:00 PM</div>
                  <div>Sun: 10:00 AM - 12.30 PM</div>
                  <div>Closed on Poya Days</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-primary-light text-sm text-center">
          <p>&copy; {new Date().getFullYear()} MN Electronics Repair Services. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;