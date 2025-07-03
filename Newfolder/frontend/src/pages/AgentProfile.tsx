import React, { useState } from 'react';
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';

const AgentProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    emailAddress: '',
    currentAddress: '',
    permanentAddress: '',
    highestQualification: '',
    institution: '',
    yearOfCompletion: '',
    certifications: '',
    yearsOfExperience: '',
    currentOccupation: '',
    references: '',
    primarySectors: '',
    regionsCovered: '',
    languagesSpoken: '',
    clientBaseSize: '',
    expectedAuditVolume: '',
    devicesAvailable: '',
    internetQuality: '',
    digitalToolComfort: '',
    criminalRecord: 'No',
    criminalDetails: '',
    conflictOfInterest: '',
    acceptCodeOfConduct: 'true',
    trainingWillingness: '',
    trainingMode: '',
    availability: '',
    additionalSkills: '',
    comments: '',
  });
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (resume) {
      data.append('resume', resume);
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('User not authenticated.');
        return;
      }
      await api.post('/api/profiles', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/waiting-approval');
    } catch (err) {
      setError('Failed to submit profile. Please try again.');
      console.error('Profile submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Fields (Simplified for Brevity) */}
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email Address</label>
          <input
            type="email"
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Mobile Number</label>
          <input
            type="text"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Resume</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {/* Add other fields as needed */}
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Submit Profile'}
        </button>
      </form>
    </div>
  );
};

export default AgentProfile;