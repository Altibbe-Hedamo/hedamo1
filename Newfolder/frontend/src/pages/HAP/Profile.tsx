import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../config/axios';

interface ProfileData {
  id?: number;
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  education_level?: string;
  field_of_study?: string;
  years_of_experience?: number;
  current_job_title?: string;
  current_employer?: string;
  previous_experience?: string;
  skills?: string;
  certifications?: string;
  languages_spoken?: string;
  references?: string;
  linkedin_profile?: string;
  portfolio_website?: string;
  github_profile?: string;
  additional_info?: string;
  profile_picture?: string;
  resume?: string;
  cover_letter?: string;
  id_document?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, [location.pathname]); // Refetch when location changes

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = sessionStorage.getItem('token');
      const response = await axios.get('/api/profiles/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile data fetched:', response.data);
      setProfile(response.data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 404) {
        setError('No profile found. Please create your profile first.');
      } else {
        setError('Failed to load profile data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/hap-portal/edit-profile');
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button
            onClick={() => navigate('/hap-portal/create-profile')}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No profile data available.</p>
          <button
            onClick={() => navigate('/hap-portal/create-profile')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">HAP Profile</h1>
        <div className="flex gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profile.status)}`}>
            {profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Unknown'}
          </span>
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <p className="mt-1 text-sm text-gray-900">{profile.first_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <p className="mt-1 text-sm text-gray-900">{profile.last_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{profile.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{profile.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(profile.date_of_birth)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="mt-1 text-sm text-gray-900">{profile.gender || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Address Information</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Address</label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{profile.address || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Education & Professional Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Education & Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Education Level</label>
              <p className="mt-1 text-sm text-gray-900">{profile.education_level || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
              <p className="mt-1 text-sm text-gray-900">{profile.years_of_experience || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Job Title</label>
              <p className="mt-1 text-sm text-gray-900">{profile.current_job_title || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills</label>
              <p className="mt-1 text-sm text-gray-900">{profile.skills || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Certifications</label>
              <p className="mt-1 text-sm text-gray-900">{profile.certifications || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Languages Spoken</label>
              <p className="mt-1 text-sm text-gray-900">{profile.languages_spoken || 'Not provided'}</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">References</label>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{profile.references || 'Not provided'}</p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Information</label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{profile.additional_info || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <p className="mt-1 text-sm text-gray-900">{profile.profile_picture ? 'Uploaded' : 'Not uploaded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Resume</label>
              <p className="mt-1 text-sm text-gray-900">{profile.resume ? 'Uploaded' : 'Not uploaded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cover Letter</label>
              <p className="mt-1 text-sm text-gray-900">{profile.cover_letter ? 'Uploaded' : 'Not uploaded'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Document</label>
              <p className="mt-1 text-sm text-gray-900">{profile.id_document ? 'Uploaded' : 'Not uploaded'}</p>
            </div>
          </div>
        </div>

        {/* Profile Metadata */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(profile.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(profile.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 