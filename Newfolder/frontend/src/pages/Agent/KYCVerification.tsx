import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FormData {
  aadharNumber: string;
  aadharName: string;
  aadharDob: string;
  panNumber: string;
  panName: string;
  panDob: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

const KYCVerification: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'aadhar' | 'pan' | 'bank' | 'payment'>('aadhar');
  const [formData, setFormData] = useState<FormData>({
    aadharNumber: '',
    aadharName: '',
    aadharDob: '',
    panNumber: '',
    panName: '',
    panDob: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [planType, setPlanType] = useState<'trial' | 'full'>('trial');
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Check if user is already verified
    const checkVerificationStatus = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await api.get('/agent/verification-status', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.isVerified) {
          navigate('/agent-dashboard');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    checkVerificationStatus();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep === 'aadhar') {
      setCurrentStep('pan');
    } else if (currentStep === 'pan') {
      setCurrentStep('bank');
    } else if (currentStep === 'bank') {
      setCurrentStep('payment');
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('bank');
    } else if (currentStep === 'bank') {
      setCurrentStep('pan');
    } else if (currentStep === 'pan') {
      setCurrentStep('aadhar');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create Razorpay order
      const orderResponse = await api.post(
        '/api/create-razorpay-order',
        {
          amount: planType === 'trial' ? 1 : 499,
          plan_type: planType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.error || 'Failed to create payment order');
      }

      const { orderId, amount, currency } = orderResponse.data;

      // Initialize Razorpay payment
      const options = {
        key: 'rzp_live_1GFDo8lemzf1gj',
        amount: amount,
        currency: currency,
        name: 'KYC Verification',
        description: `KYC Verification - ${planType === 'trial' ? 'Trial' : 'Full'} Plan`,
        order_id: orderId,
        handler: function () {
          // Navigate directly to process page after payment
          navigate('/process');
        },
        prefill: {
          name: 'Agent Name',
          email: 'agent@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#2A5C54'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Submit Aadhar details
      const aadharResponse = await api.post(
        '/api/save-aadhar-details',
        {
          fullName: formData.aadharName,
          aadharNumber: formData.aadharNumber,
          dateOfBirth: formData.aadharDob
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Submit PAN details
      const panResponse = await api.post(
        '/api/save-pan-details',
        {
          fullName: formData.panName,
          panNumber: formData.panNumber,
          dateOfBirth: formData.panDob
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Submit Bank details
      const bankResponse = await api.post(
        '/api/save-bank-details',
        {
          accountHolderName: formData.accountHolderName,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (aadharResponse.data.success && panResponse.data.success && bankResponse.data.success) {
        setSuccess('KYC details submitted successfully');
        // Move to payment step
        setCurrentStep('payment');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to submit KYC details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">KYC Verification</h1>

      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        <div className={`flex items-center ${currentStep === 'aadhar' ? 'text-[#2A5C54]' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'aadhar' ? 'bg-[#2A5C54] text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="ml-2">Aadhar</span>
        </div>
        <div className={`flex items-center ${currentStep === 'pan' ? 'text-[#2A5C54]' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'pan' ? 'bg-[#2A5C54] text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <span className="ml-2">PAN</span>
        </div>
        <div className={`flex items-center ${currentStep === 'bank' ? 'text-[#2A5C54]' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'bank' ? 'bg-[#2A5C54] text-white' : 'bg-gray-200'
          }`}>
            3
          </div>
          <span className="ml-2">Bank</span>
        </div>
        <div className={`flex items-center ${currentStep === 'payment' ? 'text-[#2A5C54]' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'payment' ? 'bg-[#2A5C54] text-white' : 'bg-gray-200'
          }`}>
            4
          </div>
          <span className="ml-2">Payment</span>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Forms */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 'aadhar' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Aadhar Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                  pattern="[0-9]{12}"
                  maxLength={12}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name (as on Aadhar)</label>
                <input
                  type="text"
                  name="aadharName"
                  value={formData.aadharName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="aadharDob"
                  value={formData.aadharDob}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'pan' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">PAN Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name (as on PAN)</label>
                <input
                  type="text"
                  name="panName"
                  value={formData.panName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="panDob"
                  value={formData.panDob}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'bank' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Bank Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                  pattern="[0-9]{9,18}"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                  pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2A5C54] focus:ring-[#2A5C54]"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Select Payment Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trial Plan */}
              <div 
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  planType === 'trial' 
                    ? 'border-[#2A5C54] bg-[#2A5C54]/5' 
                    : 'border-gray-200 hover:border-[#2A5C54]/50'
                }`}
                onClick={() => setPlanType('trial')}
              >
                <div className="flex items-center mb-4">
                  <input
                    type="radio"
                    id="trial"
                    name="plan"
                    value="trial"
                    checked={planType === 'trial'}
                    onChange={() => setPlanType('trial')}
                    className="h-4 w-4 text-[#2A5C54] focus:ring-[#2A5C54]"
                  />
                  <label htmlFor="trial" className="ml-2">
                    <span className="font-medium text-lg">Trial Plan</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan Price:</span>
                    <span className="font-semibold">₹1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Commission Cut:</span>
                    <span className="font-semibold text-red-600">₹498</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500">
                      ₹498 will be deducted from your future commission earnings
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Plan */}
              <div 
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  planType === 'full' 
                    ? 'border-[#2A5C54] bg-[#2A5C54]/5' 
                    : 'border-gray-200 hover:border-[#2A5C54]/50'
                }`}
                onClick={() => setPlanType('full')}
              >
                <div className="flex items-center mb-4">
                  <input
                    type="radio"
                    id="full"
                    name="plan"
                    value="full"
                    checked={planType === 'full'}
                    onChange={() => setPlanType('full')}
                    className="h-4 w-4 text-[#2A5C54] focus:ring-[#2A5C54]"
                  />
                  <label htmlFor="full" className="ml-2">
                    <span className="font-medium text-lg">Full Plan</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan Price:</span>
                    <span className="font-semibold">₹499</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Commission Cut:</span>
                    <span className="font-semibold text-green-600">₹0</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500">
                      No commission deduction from your earnings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {currentStep !== 'aadhar' && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Back
            </button>
          )}
          {currentStep === 'payment' ? (
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white ml-auto ${
                loading ? 'bg-gray-400' : 'bg-[#2A5C54] hover:bg-[#1a3c36]'
              }`}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          ) : currentStep !== 'bank' ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 rounded-lg bg-[#2A5C54] text-white hover:bg-[#1a3c36] ml-auto"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white ml-auto ${
                loading ? 'bg-gray-400' : 'bg-[#2A5C54] hover:bg-[#1a3c36]'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit KYC Details'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default KYCVerification; 