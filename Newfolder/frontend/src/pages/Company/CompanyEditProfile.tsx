import { useState, useEffect, type FormEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { AuthContext } from '../../context/AuthContext';

interface FormDataType {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  mobileNumber: string;
  emailAddress: string;
  currentAddress: string;
  permanentAddress: string;
  idNumber: string;
  bankAccountNumber: string;
  ifscCode: string;
  highestQualification: string;
  institution: string;
  yearOfCompletion: string;
  certifications: string;
  yearsOfExperience: string;
  currentOccupation: string;
  references: string;
  primarySectors: string;
  regionsCovered: string;
  languagesSpoken: string;
  clientBaseSize: string;
  expectedAuditVolume: string;
  devicesAvailable: string;
  internetQuality: string;
  digitalToolComfort: string;
  criminalRecord: string;
  criminalDetails: string;
  conflictOfInterest: string;
  acceptCodeOfConduct: boolean;
  trainingWillingness: string;
  trainingMode: string;
  availability: string;
  additionalSkills: string;
  comments: string;
}

const CompanyEditProfile: React.FC = () => {
  const [formData, setFormData] = useState<FormDataType>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    emailAddress: '',
    currentAddress: '',
    permanentAddress: '',
    idNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
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
    acceptCodeOfConduct: false,
    trainingWillingness: 'Yes',
    trainingMode: '',
    availability: '',
    additionalSkills: '',
    comments: '',
  });
  const [profileId, setProfileId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('Please log in to continue');
          navigate('/Login');
          return;
        }

        const response = await api.get('/api/profiles/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success && response.data.profile) {
          const profile = response.data.profile;
          setProfileId(profile.id);
          setFormData({
            fullName: profile.full_name || '',
            dateOfBirth: profile.date_of_birth || '',
            gender: profile.gender || '',
            mobileNumber: profile.mobile_number || '',
            emailAddress: profile.email_address || '',
            currentAddress: profile.current_address || '',
            permanentAddress: profile.permanent_address || '',
            idNumber: profile.id_number || '',
            bankAccountNumber: profile.bank_account_number || '',
            ifscCode: profile.ifsc_code || '',
            highestQualification: profile.highest_qualification || '',
            institution: profile.institution || '',
            yearOfCompletion: profile.year_of_completion || '',
            certifications: profile.certifications || '',
            yearsOfExperience: profile.years_of_experience || '',
            currentOccupation: profile.current_occupation || '',
            references: profile.reference_details || '',
            primarySectors: profile.primary_sectors || '',
            regionsCovered: profile.regions_covered || '',
            languagesSpoken: profile.languages_spoken || '',
            clientBaseSize: profile.client_base_size || '',
            expectedAuditVolume: profile.expected_audit_volume || '',
            devicesAvailable: profile.devices_available || '',
            internetQuality: profile.internet_quality || '',
            digitalToolComfort: profile.digital_tool_comfort || '',
            criminalRecord: profile.criminal_record || 'No',
            criminalDetails: profile.criminal_details || '',
            conflictOfInterest: profile.conflict_of_interest || '',
            acceptCodeOfConduct: profile.accept_code_of_conduct || false,
            trainingWillingness: profile.training_willingness || 'Yes',
            trainingMode: profile.training_mode || '',
            availability: profile.availability || '',
            additionalSkills: profile.additional_skills || '',
            comments: profile.comments || '',
          });
        } else {
          setError('Profile not found. Please create a profile first.');
          navigate('/company-portal/create-profile');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
        navigate('/company-portal/create-profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Please log in to continue');
      setSaving(false);
      return;
    }

    if (!profileId) {
      setError('Profile ID not found');
      setSaving(false);
      return;
    }

    try {
      const response = await api.put(`/api/profiles/${profileId}`, formData, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });
      if (response.data.success) {
        setSuccess('Profile updated successfully');
        setTimeout(() => navigate('/company-portal/profile'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Company Profile</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Address *</label>
                <textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Permanent Address</label>
                <textarea
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Highest Qualification *</label>
                <input
                  type="text"
                  name="highestQualification"
                  value={formData.highestQualification}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Institution *</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year of Completion *</label>
                <input
                  type="text"
                  name="yearOfCompletion"
                  value={formData.yearOfCompletion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience *</label>
                <input
                  type="text"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Occupation</label>
                <input
                  type="text"
                  name="currentOccupation"
                  value={formData.currentOccupation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Certifications</label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary Sectors *</label>
                <input
                  type="text"
                  name="primarySectors"
                  value={formData.primarySectors}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Regions Covered *</label>
                <input
                  type="text"
                  name="regionsCovered"
                  value={formData.regionsCovered}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Languages Spoken *</label>
                <input
                  type="text"
                  name="languagesSpoken"
                  value={formData.languagesSpoken}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Base Size</label>
                <input
                  type="text"
                  name="clientBaseSize"
                  value={formData.clientBaseSize}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Technology Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Technology & Platform</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Devices Available *</label>
                <input
                  type="text"
                  name="devicesAvailable"
                  value={formData.devicesAvailable}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Internet Quality *</label>
                <select
                  name="internetQuality"
                  value={formData.internetQuality}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Quality</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Digital Tool Comfort *</label>
                <select
                  name="digitalToolComfort"
                  value={formData.digitalToolComfort}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Level</option>
                  <option value="Expert">Expert</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Beginner">Beginner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Additional Skills</label>
                <textarea
                  name="additionalSkills"
                  value={formData.additionalSkills}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comments</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/company-portal/profile')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyEditProfile; 