import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await api.post(
              '/api/verify-razorpay-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_type: planType
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            if (verifyResponse.data.success) {
              // Redirect to dashboard on successful payment
              navigate('/agent-dashboard');
            } else {
              throw new Error(verifyResponse.data.error || 'Payment verification failed');
            }
          } catch (error: any) {
            setError(error.response?.data?.error || 'Payment verification failed');
          }
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

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (token) {
          const response = await api.get('/api/wallet/balance', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to fetch wallet balance');
          }
        }
      } catch (error: any) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    fetchWalletBalance();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">KYC Verification Payment</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Plan</h2>
          <div className="space-y-4">
            <div className="flex items-center">
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
                <span className="font-medium">Trial Plan</span>
                <p className="text-sm text-gray-500">₹1 for 7 days</p>
              </label>
            </div>
            <div className="flex items-center">
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
                <span className="font-medium">Full Plan</span>
                <p className="text-sm text-gray-500">₹499 for lifetime access</p>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
          <div className="flex justify-between mb-2">
            <span>Plan Amount:</span>
            <span>₹{planType === 'trial' ? '1' : '499'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>GST (18%):</span>
            <span>₹{planType === 'trial' ? '0.18' : '89.82'}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span>₹{planType === 'trial' ? '1.18' : '588.82'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full mt-6 px-6 py-3 rounded-lg text-white ${
            loading ? 'bg-gray-400' : 'bg-[#2A5C54] hover:bg-[#1a3c36]'
          }`}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default Payment; 