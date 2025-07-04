import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/axios';

const CompanyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      try {
        const token = sessionStorage.getItem('token');
        const response = await api.get(`/api/company/profile/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setProfile(response.data.profile);
        } else {
          setError('Failed to fetch company profile. Please create one if it does not exist.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred while fetching the profile.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyProfile();
  }, [user]);

  if (loading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }
  
  if (!profile) {
    return <div className="p-8">No company profile found.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-3xl text-blue-600">{profile.name?.charAt(0)}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
          <p className="text-gray-600">{profile.industry}</p>
        </div>
      </div>
      
      {/* Profile Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <Section title="Company Information">
          <Field label="Company Name" value={profile.name} />
          <Field label="Industry" value={profile.industry} />
          <Field label="Company Size" value={`${profile.size} employees`} />
          <Field label="Website" value={<a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.website}</a>} />
        </Section>
        
        <Section title="Contact Details">
          <Field label="Contact Email" value={profile.contact_email} />
          <Field label="Contact Phone" value={profile.contact_phone} />
          <Field label="Address" value={`${profile.address}, ${profile.city}, ${profile.state} ${profile.zip_code}, ${profile.country}`} />
        </Section>
        
        <Section title="About the Company">
          <p className="text-gray-700 leading-relaxed">{profile.description}</p>
        </Section>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-t pt-6 first:border-t-0">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="text-base text-gray-900 mt-1">{value || 'Not specified'}</p>
  </div>
);

export default CompanyProfilePage; 