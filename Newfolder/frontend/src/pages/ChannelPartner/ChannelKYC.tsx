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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'aadhar') {
      // Frontend validation
      if (!formData.aadharName || !formData.aadharNumber || !formData.aadharDob) {
        alert('Please fill all Aadhar fields.');
        return;
      }
      try {
        const response = await api.post(
          '/api/channel-partner/save-aadhar-details',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
          }
        );
        if (response.data.success) {
          alert('Aadhar details saved successfully!');
        } else {
          alert(response.data.error || 'Failed to save Aadhar details');
        }
      } catch (err) {
        alert('Error saving Aadhar details');
      }
    } else if (activeTab === 'pan') {
      console.log('PAN form submitted!');
      // Frontend validation
      if (!formData.panNumber || !formData.panName || !formData.panDob) {
        alert('Please fill all PAN fields.');
        return;
      }
      try {
        const response = await api.post(
          '/api/channel-partner/save-pan-details',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
          }
        );
        if (response.data.success) {
          alert('PAN details saved successfully!');
        } else {
          alert(response.data.error || 'Failed to save PAN details');
        }
      } catch (err) {
        alert('Error saving PAN details');
      }
    } else if (activeTab === 'bank') {
      console.log('Bank form submitted!');
      // Frontend validation
      if (!formData.bankName || !formData.accountNumber || !formData.ifscCode || !formData.accountHolderName) {
        alert('Please fill all Bank fields.');
        return;
      }
      try {
        const response = await api.post(
          '/api/channel-partner/save-bank-details',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
          }
        );
        if (response.data.success) {
          alert('Bank details saved successfully!');
        } else {
          alert(response.data.error || 'Failed to save Bank details');
        }
      } catch (err) {
        alert('Error saving Bank details');
      }
    } else {
      console.log('Form submitted:', formData);
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
        {activeTab === 'aadhar' && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button type="submit" className="px-4 py-2 bg-[#2A5C54] text-white rounded-md">Submit</button>
          </form>
        )}

        {activeTab === 'pan' && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
          </form>
        )}

        {activeTab === 'bank' && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
          </form>
        )}

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-[#2A5C54] text-white py-2 px-4 rounded-md hover:bg-[#1A3C34] transition-colors"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelKYC; 