import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../config/axios';

interface CompanyProfile {
  id: number;
  full_name: string;
  date_of_birth: string;
  gender: string;
  mobile_number: string;
  email_address: string;
  current_address: string;
  permanent_address: string;
  id_number: string;
  bank_account_number: string;
  ifsc_code: string;
  highest_qualification: string;
  institution: string;
  year_of_completion: string;
  certifications: string;
  years_of_experience: string;
  current_occupation: string;
  reference_details: string;
  primary_sectors: string;
  regions_covered: string;
  languages_spoken: string;
  client_base_size: string;
  expected_audit_volume: string;
  devices_available: string;
  internet_quality: string;
  digital_tool_comfort: string;
  criminal_record: string;
  criminal_details: string;
  conflict_of_interest: string;
  accept_code_of_conduct: boolean;
  training_willingness: string;
  training_mode: string;
  availability: string;
  additional_skills: string;
  comments: string;
  completion_percentage: number;
  status: string;
  created_at: string;
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
      console.log('Current user context:', user);
      console.log('User type:', user?.type, 'User signup_type:', user?.signup_type);
      
      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      try {
        const token = sessionStorage.getItem('token');
        
        // Get the full profile data directly from profiles table
        const response = await api.get(`/api/profiles/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setProfile(response.data.profile);
          setEditData(response.data.profile);
        } else {
          setError('Failed to fetch company profile');
        }
      } catch (err: any) {
        console.error('Company profile fetch error:', err);
        console.error('Error response:', err.response);
        if (err.response?.status === 404) {
          setError('Company profile not found. Please contact support.');
        } else if (err.response?.status === 403) {
          setError('Access denied. Please ensure you are logged in as a company user.');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setEditData({ ...editData, [name]: fieldValue });
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await api.put(`/api/profiles/${profile.id}`, editData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Fetch updated profile
        const updatedResponse = await api.get(`/api/profiles/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (updatedResponse.data.success) {
          setProfile(updatedResponse.data.profile);
        }
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '1900-01-01') return 'Not specified';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Not specified'
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
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
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Company Profile</h1>
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Profile Header */}
        <div className="flex items-center mb-8">
          <div className="w-24 h-24 rounded-full mr-4 border-2 border-blue-500 bg-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10V9a2 2 0 012-2h2a2 2 0 012 2v10M9 21h4"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{profile.full_name || 'Company Name'}</h2>
            <p className="text-gray-600">{profile.email_address || 'Email not specified'}</p>
            <p className="text-sm text-gray-500">Status: {profile.status}</p>
          </div>
        </div>

        <Section title="Basic Information" icon="🏢">
          <EditableField 
            label="Company/Full Name" 
            value={profile.full_name || 'Not specified'} 
            name="full_name"
            editing={isEditing}
            editValue={editData.full_name || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Mobile Number" 
            value={profile.mobile_number || 'Not specified'} 
            name="mobile_number"
            editing={isEditing}
            editValue={editData.mobile_number || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Email Address" 
            value={profile.email_address || 'Not specified'} 
            name="email_address"
            editing={isEditing}
            editValue={editData.email_address || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Current Address" 
            value={profile.current_address || 'Not specified'} 
            name="current_address"
            editing={isEditing}
            editValue={editData.current_address || ''}
            onChange={handleChange}
            textarea
          />
          <EditableField 
            label="Permanent Address" 
            value={profile.permanent_address || 'Not specified'} 
            name="permanent_address"
            editing={isEditing}
            editValue={editData.permanent_address || ''}
            onChange={handleChange}
            textarea
          />
        </Section>

        <Section title="Business Information" icon="💼">
          <EditableField 
            label="Current Occupation/Business Type" 
            value={profile.current_occupation || 'Not specified'} 
            name="current_occupation"
            editing={isEditing}
            editValue={editData.current_occupation || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Primary Sectors" 
            value={profile.primary_sectors || 'Not specified'} 
            name="primary_sectors"
            editing={isEditing}
            editValue={editData.primary_sectors || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Regions Covered" 
            value={profile.regions_covered || 'Not specified'} 
            name="regions_covered"
            editing={isEditing}
            editValue={editData.regions_covered || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Languages Spoken" 
            value={profile.languages_spoken || 'Not specified'} 
            name="languages_spoken"
            editing={isEditing}
            editValue={editData.languages_spoken || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Client Base Size" 
            value={profile.client_base_size || 'Not specified'} 
            name="client_base_size"
            editing={isEditing}
            editValue={editData.client_base_size || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Expected Audit Volume" 
            value={profile.expected_audit_volume || 'Not specified'} 
            name="expected_audit_volume"
            editing={isEditing}
            editValue={editData.expected_audit_volume || ''}
            onChange={handleChange}
          />
        </Section>

        <Section title="Financial Details" icon="💳">
          <EditableField 
            label="Bank Account Number" 
            value={profile.bank_account_number || 'Not specified'} 
            name="bank_account_number"
            editing={isEditing}
            editValue={editData.bank_account_number || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="IFSC Code" 
            value={profile.ifsc_code || 'Not specified'} 
            name="ifsc_code"
            editing={isEditing}
            editValue={editData.ifsc_code || ''}
            onChange={handleChange}
          />
        </Section>

        <Section title="Professional Background" icon="🎓">
          <EditableField 
            label="Years of Experience" 
            value={profile.years_of_experience || 'Not specified'} 
            name="years_of_experience"
            editing={isEditing}
            editValue={editData.years_of_experience || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Highest Qualification" 
            value={profile.highest_qualification || 'Not specified'} 
            name="highest_qualification"
            editing={isEditing}
            editValue={editData.highest_qualification || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Institution" 
            value={profile.institution || 'Not specified'} 
            name="institution"
            editing={isEditing}
            editValue={editData.institution || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Year of Completion" 
            value={profile.year_of_completion || 'Not specified'} 
            name="year_of_completion"
            editing={isEditing}
            editValue={editData.year_of_completion || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Certifications" 
            value={profile.certifications || 'None'} 
            name="certifications"
            editing={isEditing}
            editValue={editData.certifications || ''}
            onChange={handleChange}
            textarea
          />
        </Section>

        <Section title="Technology & Availability" icon="💻">
          <EditableField 
            label="Devices Available" 
            value={profile.devices_available || 'Not specified'} 
            name="devices_available"
            editing={isEditing}
            editValue={editData.devices_available || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Internet Quality" 
            value={profile.internet_quality || 'Not specified'} 
            name="internet_quality"
            editing={isEditing}
            editValue={editData.internet_quality || ''}
            onChange={handleChange}
            options={['Not specified', 'Poor', 'Average', 'Good', 'Excellent']}
          />
          <EditableField 
            label="Digital Tool Comfort" 
            value={profile.digital_tool_comfort || 'Not specified'} 
            name="digital_tool_comfort"
            editing={isEditing}
            editValue={editData.digital_tool_comfort || ''}
            onChange={handleChange}
            options={['Not specified', 'Beginner', 'Intermediate', 'Advanced', 'Expert']}
          />
          <EditableField 
            label="Availability" 
            value={profile.availability || 'Not specified'} 
            name="availability"
            editing={isEditing}
            editValue={editData.availability || ''}
            onChange={handleChange}
          />
        </Section>

        <Section title="Additional Information" icon="📋">
          <EditableField 
            label="Additional Skills" 
            value={profile.additional_skills || 'None'} 
            name="additional_skills"
            editing={isEditing}
            editValue={editData.additional_skills || ''}
            onChange={handleChange}
            textarea
          />
          <EditableField 
            label="References" 
            value={profile.reference_details || 'None'} 
            name="reference_details"
            editing={isEditing}
            editValue={editData.reference_details || ''}
            onChange={handleChange}
            textarea
          />
          <EditableField 
            label="Comments" 
            value={profile.comments || 'None'} 
            name="comments"
            editing={isEditing}
            editValue={editData.comments || ''}
            onChange={handleChange}
            textarea
          />
        </Section>

        <Section title="Compliance" icon="⚖️">
          <Field
            label="Criminal Record"
            value={profile.criminal_record || 'No'}
          />
          {profile.criminal_record === 'Yes' && profile.criminal_details && (
            <Field
              label="Criminal Details"
              value={profile.criminal_details}
            />
          )}
          <Field
            label="Conflict of Interest"
            value={profile.conflict_of_interest || 'No'}
          />
          <Field
            label="Accept Code of Conduct"
            value={profile.accept_code_of_conduct ? 'Yes' : 'No'}
          />
          <Field
            label="Training Willingness"
            value={profile.training_willingness || 'Not specified'}
          />
          {profile.training_mode && (
            <Field
              label="Training Mode"
              value={profile.training_mode}
            />
          )}
        </Section>

        {/* Profile Status */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Profile Status</h3>
              <p className="text-gray-600">Completion: {profile.completion_percentage}%</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile.status === 'approved' ? 'bg-green-100 text-green-800' :
              profile.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${profile.completion_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
      <span className="mr-2">{icon}</span>
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="text-gray-900">{value}</div>
  </div>
);

const EditableField: React.FC<{
  label: string;
  value: string;
  name: string;
  editing: boolean;
  editValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  textarea?: boolean;
  options?: string[];
}> = ({ label, value, name, editing, editValue, onChange, type = 'text', textarea = false, options }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {editing ? (
      options ? (
        <select
          name={name}
          value={editValue}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          name={name}
          value={editValue}
          onChange={onChange}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={editValue}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )
    ) : (
      <div className="text-gray-900 p-2 bg-gray-50 rounded-md">{value}</div>
    )}
  </div>
);

export default CompanyProfilePage; 