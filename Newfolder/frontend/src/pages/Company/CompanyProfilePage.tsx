import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/axios';

interface CompanyProfile {
  id: number;
  name: string;
  industry: string;
  size: string;
  website: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const CompanyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<CompanyProfile>>({});
  const [saving, setSaving] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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
          setEditData(response.data.profile);
        } else {
          setError('Failed to fetch company profile');
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Profile not found - this shouldn't happen for company users since we create it during signup
          setError('Company profile not found. Please contact support.');
        } else {
          setError(err.response?.data?.message || 'An error occurred while fetching the profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyProfile();
  }, [user, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profile || {});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profile || {});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await api.put(`/api/company/profile/${profile.id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProfile(response.data.profile);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No company profile found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">Manage your company information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Profile Header */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">{profile.name?.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.industry}</p>
              <p className="text-sm text-gray-500">Created: {formatDate(profile.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="p-6 space-y-6">
          <Section title="Company Information" icon="🏢">
            <Field label="Company Name" value={isEditing ? editData.name : profile.name} name="name" onChange={handleChange} editing={isEditing} />
            <Field label="Industry" value={isEditing ? editData.industry : profile.industry} name="industry" onChange={handleChange} editing={isEditing} />
            <Field label="Company Size" value={isEditing ? editData.size : profile.size} name="size" onChange={handleChange} editing={isEditing} />
            <Field label="Website" value={isEditing ? editData.website : profile.website} name="website" onChange={handleChange} editing={isEditing} disabled={true} />
          </Section>

          <Section title="Contact Information" icon="📞">
            <Field label="Contact Email" value={isEditing ? editData.contact_email : profile.contact_email} name="contact_email" onChange={handleChange} editing={isEditing} />
            <Field label="Contact Phone" value={isEditing ? editData.contact_phone : profile.contact_phone} name="contact_phone" onChange={handleChange} editing={isEditing} />
          </Section>

          <Section title="Address Information" icon="📍">
            <Field label="Address" value={isEditing ? editData.address : profile.address} name="address" onChange={handleChange} editing={isEditing} />
            <Field label="City" value={isEditing ? editData.city : profile.city} name="city" onChange={handleChange} editing={isEditing} disabled={true} />
            <Field label="State" value={isEditing ? editData.state : profile.state} name="state" onChange={handleChange} editing={isEditing} disabled={true} />
            <Field label="Zip Code" value={isEditing ? editData.zip_code : profile.zip_code} name="zip_code" onChange={handleChange} editing={isEditing} disabled={true} />
            <Field label="Country" value={isEditing ? editData.country : profile.country} name="country" onChange={handleChange} editing={isEditing} disabled={true} />
          </Section>

          <Section title="About the Company" icon="ℹ️">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.description || 'No description provided'}</p>
              )}
            </div>
          </Section>

          <Section title="Profile Status" icon="📊">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                profile.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile.status === 'active' ? 'Active' : 'Pending'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <p className="text-gray-900">{formatDate(profile.updated_at)}</p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="border-t pt-6 first:border-t-0">
    <div className="flex items-center mb-4">
      <span className="text-xl mr-2">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Field: React.FC<{ 
  label: string; 
  value: string | undefined; 
  name?: string; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  editing?: boolean;
  disabled?: boolean;
}> = ({ label, value, name, onChange, editing, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {editing ? (
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />
    ) : (
      <p className="text-gray-900">{value || 'Not specified'}</p>
    )}
  </div>
);

export default CompanyProfilePage; 