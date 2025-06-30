import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';

const LinkGenerator: React.FC = () => {
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralLink = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching referral link...');
        
        // Log the token being used
        const token = sessionStorage.getItem('token');
        console.log('Auth token present:', !!token);
        
        // Log the full URL being called
        const apiUrl = axios.defaults.baseURL;
        const endpoint = '/api/channel-partner/referral-link';
        console.log('Making request to:', `${apiUrl}${endpoint}`);
        
        const res = await axios.get(endpoint);
        console.log('Response received:', res.data);
        
        if (res.data && res.data.referralLink) {
          setReferralLink(res.data.referralLink);
          console.log('Referral link set successfully');
        } else {
          console.error('Invalid response format:', res.data);
          setError('Invalid response format from server');
        }
      } catch (err: any) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers,
          config: {
            url: err.config?.url,
            baseURL: err.config?.baseURL,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('Access denied. Only channel partners can access referral links.');
        } else if (err.response?.status === 404) {
          setError('Referral code not found. Please contact support.');
        } else {
          setError(err.response?.data?.error || 'Could not fetch referral link. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReferralLink();
  }, []);

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A5C54]"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Link Generator</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}
      {!error && (
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-lg"
          />
          <button
            onClick={handleCopy}
            className="bg-[#2A5C54] text-white px-4 py-2 rounded-md hover:bg-[#1A3C34] transition-colors"
            disabled={!referralLink}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
      <p className="mt-4 text-gray-500 text-sm">
        Share this link with agents to let them sign up under your channel partner account.
      </p>
    </div>
  );
};

export default LinkGenerator; 