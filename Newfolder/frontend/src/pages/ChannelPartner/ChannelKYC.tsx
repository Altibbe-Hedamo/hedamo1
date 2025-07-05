import React, { useState } from 'react';
import { FaIdCard, FaCreditCard, FaUniversity } from 'react-icons/fa';
import api from '../../config/axios';

interface FormData {
  aadharNumber: string;
  aadharName: string;
  aadharDob: string;
  aadharFile: File | null;
  panNumber: string;
  panName: string;
  panDob: string;
  panFile: File | null;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

const ChannelKYC: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'aadhar' | 'pan' | 'bank'>('aadhar');
  const [formData, setFormData] = useState<FormData>({
    aadharNumber: '',
    aadharName: '',
    aadharDob: '',
    aadharFile: null,
    panNumber: '',
    panName: '',
    panDob: '',
    panFile: null,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'aadhar') {
        // Frontend validation
        if (!formData.aadharName || !formData.aadharNumber || !formData.aadharDob) {
          alert('Please fill all Aadhar fields.');
          return;
        }

        const response = await api.post(
          '/api/channel-partner/save-aadhar-details',
          {
            aadharNumber: formData.aadharNumber,
            aadharName: formData.aadharName,
            aadharDob: formData.aadharDob
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
          }
        );

        if (response.data.success) {
          alert('Aadhar details saved successfully!');
          // Reset form
          setFormData(prev => ({
            ...prev,
            aadharNumber: '',
            aadharName: '',
            aadharDob: ''
          }));
        } else {
          alert(response.data.error || 'Failed to save Aadhar details');
        }
      } else if (activeTab === 'pan') {
        // Frontend validation
        if (!formData.panNumber || !formData.panName || !formData.panDob) {
          alert('Please fill all PAN fields.');
          return;
        }

        const response = await api.post(
          '/api/channel-partner/save-pan-details',
          {
            panNumber: formData.panNumber,
            panName: formData.panName,
            panDob: formData.panDob
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
          }
        );

        if (response.data.success) {
          alert('PAN details saved successfully!');
          // Reset form
          setFormData(prev => ({
            ...prev,
            panNumber: '',
            panName: '',
            panDob: ''
          }));
        } else {
          alert(response.data.error || 'Failed to save PAN details');
        }
      } else if (activeTab === 'bank') {
        // Frontend validation
        if (!formData.bankName || !formData.accountNumber || !formData.ifscCode || !formData.accountHolderName) {
          alert('Please fill all Bank fields.');
          return;
        }

        const response = await api.post(
          '/api/channel-partner/save-bank-details',
          {
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode,
            accountHolderName: formData.accountHolderName
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
          }
        );

        if (response.data.success) {
          alert('Bank details saved successfully!');
          // Reset form
          setFormData(prev => ({
            ...prev,
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            accountHolderName: ''
          }));
        } else {
          alert(response.data.error || 'Failed to save Bank details');
        }
      }
    } catch (err: any) {
      console.error('Error saving details:', err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert(`Error saving ${activeTab} details. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Channel Partner KYC</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'aadhar' ? 'bg-[#2A5C54] text-white' : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveTab('aadhar')}
        >
          <FaIdCard className="mr-2" />
          Aadhar Details
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'pan' ? 'bg-[#2A5C54] text-white' : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveTab('pan')}
        >
          <FaCreditCard className="mr-2" />
          PAN Details
        </button>
        <button
          className={`flex items-center px-4 py-2 rounded-lg ${
            activeTab === 'bank' ? 'bg-[#2A5C54] text-white' : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveTab('bank')}
        >
          <FaUniversity className="mr-2" />
          Bank Details
        </button>
      </div>

      {/* Forms */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {activeTab === 'aadhar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name as per Aadhar</label>
                <input
                  type="text"
                  name="aadharName"
                  value={formData.aadharName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  placeholder="Enter Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  placeholder="Enter Aadhar Number"
                  maxLength={12}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="aadharDob"
                  value={formData.aadharDob}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  required
                />
              </div>
            </div>
          )}

          {activeTab === 'pan' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  placeholder="Enter PAN Number"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name as per PAN</label>
                <input
                  type="text"
                  name="panName"
                  value={formData.panName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  placeholder="Enter Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="panDob"
                  value={formData.panDob}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  required
                />
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  placeholder="Enter Bank Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  placeholder="Enter Account Number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  placeholder="Enter IFSC Code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A5C54]"
                  placeholder="Enter Account Holder Name"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2A5C54] text-white py-2 px-4 rounded-md hover:bg-[#1A3C34] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelKYC; 