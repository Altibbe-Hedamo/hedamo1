import React, { useState, useEffect } from 'react';
import api from '../../config/axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface Hap {
  id: number;
  user_id: number;
  full_name: string;
  email_address: string;
  status: 'pending' | 'approved' | 'rejected';
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  hasProfile?: boolean;
  profile?: any;
  signup_type?: string;
  mobile_number?: string;
  current_address?: string;
  permanent_address?: string;
  id_number?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  highest_qualification?: string;
  institution?: string;
  year_of_completion?: string;
  date_of_birth?: string;
  gender?: string;
  rejection_reason?: string;
  profile_id?: number;
}

const HapSection: React.FC = () => {
  const [haps, setHaps] = useState<Hap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHaps = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching HAPs...');
      
      const response = await api.get('/api/admin/profiles');
      console.log('Raw API response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.profiles)) {
        // Log all profiles before filtering
        console.log('All profiles before filtering:', response.data.profiles);
        
        // Filter for HAP profiles
        const hapProfiles = response.data.profiles.filter((profile: any) => {
          console.log('Checking profile:', {
            id: profile.id,
            signup_type: profile.signup_type,
            isHap: profile.signup_type === 'hap'
          });
          return profile.signup_type === 'hap';
        });
        
        console.log('Filtered HAP profiles:', hapProfiles);
        
        // Process the profiles
        const processedHaps = hapProfiles.map((hap: any) => {
          const processed = {
            ...hap,
            id: hap.profile_id || hap.user_id,
            status: hap.status || 'pending',
            full_name: hap.full_name || `${hap.first_name} ${hap.last_name}`,
            email_address: hap.email_address || hap.email
          };
          console.log('Processed HAP:', processed);
          return processed;
        });

        console.log('All processed HAPs:', processedHaps);
        setHaps(processedHaps);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching HAPs:', error);
      setError('Failed to fetch HAPs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHaps();
  }, []);

  const handleVerify = async (hapId: number, status: 'approved' | 'rejected', rejectionReason?: string) => {
    console.log('Attempting to approve/reject HAP:', { hapId, status, rejectionReason });
    try {
      const hap = haps.find((h) => h.id === hapId);
      if (!hap) {
        console.error('HAP not found:', hapId);
        return;
      }

      console.log('Found HAP:', hap);

      // First, update the user's status
      const userResponse = await fetch(`${API_URL}/api/admin/users/${hap.user_id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status,
          rejectionReason,
        }),
      });

      console.log('User status update response:', userResponse);

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error('Error updating user status:', errorData);
        throw new Error(errorData.message || 'Failed to update user status');
      }

      const userData = await userResponse.json();
      console.log('User status updated:', userData);

      // If approved, create a profile
      if (status === 'approved') {
        console.log('Creating profile for approved HAP...');
        const formData = new FormData();
        formData.append('userId', hap.user_id.toString());
        formData.append('fullName', hap.full_name);
        formData.append('dateOfBirth', hap.date_of_birth || new Date().toISOString().split('T')[0]);
        formData.append('gender', hap.gender || 'not_specified');
        formData.append('mobileNumber', hap.mobile_number || '+1234567890');
        formData.append('emailAddress', hap.email);
        formData.append('currentAddress', hap.current_address || 'Default Address');
        formData.append('permanentAddress', hap.permanent_address || 'Default Address');
        formData.append('idNumber', hap.id_number || '123456789');
        formData.append('bankAccountNumber', hap.bank_account_number || '1234567890');
        formData.append('ifscCode', hap.ifsc_code || 'SBIN0001234');
        formData.append('highestQualification', hap.highest_qualification || 'Bachelor\'s Degree');
        formData.append('institution', hap.institution || 'Default University');
        formData.append('yearOfCompletion', hap.year_of_completion || '2020');
        formData.append('yearsOfExperience', '0');
        formData.append('primarySectors', 'General');
        formData.append('regionsCovered', 'All');
        formData.append('languagesSpoken', 'English');
        formData.append('devicesAvailable', 'Smartphone');
        formData.append('internetQuality', 'Good');
        formData.append('digitalToolComfort', 'Comfortable');
        formData.append('criminalRecord', 'No');
        formData.append('acceptCodeOfConduct', 'true');
        formData.append('trainingWillingness', 'Yes');
        formData.append('trainingMode', 'Online');
        formData.append('availability', 'Full-time');
        formData.append('additionalSkills', 'Basic computer skills');
        formData.append('comments', 'Profile created by admin');

        // Create default files with actual content
        const createDefaultFile = (filename: string, mimeType: string) => {
          const file = new File(
            [new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])], // Valid PNG header
            filename,
            { type: mimeType }
          );
          return file;
        };

        // Add default files
        const defaultPhoto = createDefaultFile('default_photo.jpg', 'image/jpeg');
        const defaultSelfie = createDefaultFile('default_selfie.jpg', 'image/jpeg');
        const defaultResume = createDefaultFile('default_resume.pdf', 'application/pdf');
        const defaultCheque = createDefaultFile('default_cheque.jpg', 'image/jpeg');

        formData.append('photo', defaultPhoto);
        formData.append('selfie', defaultSelfie);
        formData.append('resume', defaultResume);
        formData.append('cancelled_cheque', defaultCheque);

        console.log('Sending profile creation request...');
        const profileResponse = await fetch(`${API_URL}/api/profiles`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
          body: formData,
        });

        console.log('Profile creation response:', profileResponse);

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          console.error('Error creating profile:', errorData);
          throw new Error(errorData.message || 'Failed to create profile');
        }

        const profileData = await profileResponse.json();
        console.log('Profile created successfully:', profileData);

        // Update local state only if both user status is active and profile is created
        if (userData.user.status === 'active' && profileData.success) {
          setHaps((prevHaps) =>
            prevHaps.map((h) =>
              h.id === hapId
                ? {
                    ...h,
                    status: 'approved',
                    profile_id: profileData.profileId,
                  }
                : h
            )
          );
          alert('HAP approved and profile created successfully');
        } else {
          throw new Error('Failed to complete approval process');
        }
      } else {
        // If rejected, just update the status
        setHaps((prevHaps) =>
          prevHaps.map((h) =>
            h.id === hapId
              ? {
                  ...h,
                  status: 'rejected',
                  rejection_reason: rejectionReason,
                }
              : h
          )
        );
        alert('HAP rejected successfully');
      }
    } catch (error) {
      console.error('Error in handleVerify:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleReject = async (id: number) => {
    console.log('handleReject called with id:', id);
    
    // Find the HAP to verify the ID exists
    const hap = haps.find(h => h.id === id);
    if (!hap) {
      console.error('HAP not found for id:', id);
      setError('HAP not found');
      return;
    }

    const rejectionReason = prompt('Please enter rejection reason:');
    if (!rejectionReason) return;

    try {
      setError(null);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing');
        return;
      }

      // Ensure id is a number and positive
      const numericId = Number(id);
      if (isNaN(numericId) || numericId <= 0) {
        console.error('Invalid ID:', {
          id,
          numericId,
          isNaN: isNaN(numericId),
          isPositive: numericId > 0
        });
        setError('Invalid ID. Must be a positive number.');
        return;
      }

      // If the HAP has a profile, use the profile approval endpoint
      // Otherwise, use the user approval endpoint
      const endpoint = hap.hasProfile ? 
        `/api/admin/profiles/${numericId}/approve` :
        `/api/admin/users/${numericId}/approve`;

      const response = await api.post(endpoint, 
        { 
          status: 'rejected',
          rejectionReason
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setHaps(prevHaps => 
          prevHaps.map(hap => 
            hap.id === numericId ? { ...hap, status: 'rejected' } : hap
          )
        );
      } else {
        throw new Error(response.data.error || 'Failed to reject HAP');
      }
    } catch (error: any) {
      console.error('Error rejecting HAP:', error);
      setError(error.response?.data?.error || 'Failed to reject HAP');
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">HAP Approval Section</h1>
        <p className="text-gray-600">Review and manage HAP profiles</p>
      </div>

      {haps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No HAPs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {haps.map(hap => (
            <div key={hap.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{hap.full_name}</p>
                  <p className="text-sm text-gray-500">{hap.email_address}</p>
                  <p className="text-xs text-gray-400">
                    Joined: {new Date(hap.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {hap.hasProfile ? 'Profile ID' : 'User ID'}: {hap.id}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    hap.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : hap.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {hap.status}
                </span>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                {hap.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleVerify(hap.id, 'approved')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(hap.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HapSection; 