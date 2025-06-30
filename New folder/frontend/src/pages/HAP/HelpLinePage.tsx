import React from 'react';
import { FaEnvelope, FaPhone, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const HelpLinePage: React.FC = () => {
  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Line Support</h1>
          <p className="text-lg text-gray-600">
            We're here to help you with any questions or concerns about HAP services
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaEnvelope className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="ml-4 text-xl font-semibold text-gray-900">Email Support</h2>
            </div>
            <p className="text-gray-600 mb-4">
              For general inquiries and support, please email us at:
            </p>
            <a 
              href="mailto:haslogin9@gmail.com"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              haslogin9@gmail.com
            </a>
            <p className="mt-4 text-sm text-gray-500">
              We typically respond within 24 hours
            </p>
          </div>

          {/* Phone Support */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <FaPhone className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="ml-4 text-xl font-semibold text-gray-900">Phone Support</h2>
            </div>
            <p className="text-gray-600 mb-4">
              For immediate assistance, call our support line:
            </p>
            <a 
              href="tel:+919876543210"
              className="text-green-600 hover:text-green-800 font-medium flex items-center"
            >
              +91 98765 43210
            </a>
            <p className="mt-4 text-sm text-gray-500">
              Available Monday to Friday, 9:00 AM - 6:00 PM IST
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Support Hours</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <FaClock className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Business Hours</p>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-gray-600">HAP Support Center, Gachibowli, Hyderabad, Telangana - 500032</p>
                <p className="text-sm text-gray-500 mt-1">Near Wipro Circle, Opposite DLF Cybercity</p>
              </div>
            </div>
          </div>

          {/* Support Tips */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Support Tips</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Please have your HAP ID ready when contacting support</li>
              <li>For technical issues, try clearing your browser cache first</li>
              <li>Check our FAQ section for common questions</li>
              <li>For urgent matters, please use the phone support</li>
              <li>Our support team is available in English, Hindi, and Telugu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpLinePage; 