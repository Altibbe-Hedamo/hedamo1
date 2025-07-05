import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyProfilePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800">Company Profile</h1>
      <button
        onClick={() => navigate('/company-portal/edit-profile')}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
      >
        Edit Profile
      </button>
    </div>
  );
};

export default CompanyProfilePage; 