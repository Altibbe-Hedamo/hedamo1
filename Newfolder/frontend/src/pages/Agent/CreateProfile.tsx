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

interface FilesType {
  photo: File | null;
  selfie: File | null;
  resume: File | null;
  cancelled_cheque: File | null;
  certifications: File[];
  otherDocuments: File[];
}

const CreateProfile: React.FC = () => {
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
  const [files, setFiles] = useState<FilesType>({
    photo: null,
    selfie: null,
    resume: null,
    cancelled_cheque: null,
    certifications: [],
    otherDocuments: [],
  });
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(false); // Set initial loading to false
  const navigate = useNavigate();
  const { profileStatus, setProfileStatus } = useContext(AuthContext);

  const sections = [
    'Personal Identification & Contact Details',
    'Professional & Educational Background',
    'Sector & Regional Details',
    'Technology & Platform Readiness',
    'Compliance & Declarations',
    'Onboarding & Training',
    'Additional Information',
  ];

  const calculateProgress = () => {
    const fields: (keyof FormDataType)[] = [
      'fullName', 'dateOfBirth', 'mobileNumber', 'emailAddress', 'currentAddress',
      'idNumber', 'bankAccountNumber', 'ifscCode',
      'highestQualification', 'institution', 'yearOfCompletion', 'yearsOfExperience',
      'primarySectors', 'regionsCovered', 'languagesSpoken', 'devicesAvailable',
      'internetQuality', 'digitalToolComfort', 'acceptCodeOfConduct', 'trainingWillingness',
    ];
    const requiredFiles: (keyof FilesType)[] = ['photo', 'selfie', 'resume', 'cancelled_cheque'];
    let filledFields = 0;

    fields.forEach(field => {
      if (field === 'acceptCodeOfConduct') {
        if (formData[field]) filledFields++;
      } else if (formData[field]) {
        filledFields++;
      }
    });

    requiredFiles.forEach(file => {
      if (files[file]) filledFields++;
    });

    const totalFields = fields.length + requiredFiles.length;
    return Math.round((filledFields / totalFields) * 100);
  };

  useEffect(() => {
    setProgress(calculateProgress());
  }, [formData, files]);

  // Check profile status on mount to ensure correct navigation
  useEffect(() => {
    if (profileStatus && profileStatus !== null) {
      // If a profile already exists, redirect based on status
      if (profileStatus === 'pending' || profileStatus === 'rejected') {
        navigate('/agent-dashboard/view-profile', { replace: true });
      }
    }
  }, [profileStatus, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FilesType,
    multiple = false
  ) => {
    if (e.target.files) {
      if (multiple) {
        setFiles(prev => ({ ...prev, [field]: Array.from(e.target.files!) }));
      } else {
        setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value.toString());
    });
    if (files.photo) form.append('photo', files.photo);
    if (files.selfie) form.append('selfie', files.selfie);
    if (files.resume) form.append('resume', files.resume);
    if (files.cancelled_cheque) form.append('cancelled_cheque', files.cancelled_cheque);
    files.certifications.forEach(file => form.append('certifications', file));
    files.otherDocuments.forEach(file => form.append('other_documents', file));

    try {
      const token = sessionStorage.getItem('token');
      const response = await api.post('/api/profiles', form, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
      if (response.data.success) {
        setSuccess('Profile submitted for approval');
        setProfileStatus('pending'); // Update context to reflect new profile status
        setTimeout(() => navigate('/agent-dashboard/view-profile'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
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

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">{sections[0]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Residential Address *</label>
                <textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Permanent Address</label>
                <textarea
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ID Number (e.g., Aadhaar, Passport) *</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bank Account Number *</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IFSC Code *</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profile Photo *</label>
                <input
                  type="file"
                  name="photo"
                  onChange={(e) => handleFileChange(e, 'photo')}
                  accept="image/jpeg,image/png"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Selfie *</label>
                <input
                  type="file"
                  name="selfie"
                  onChange={(e) => handleFileChange(e, 'selfie')}
                  accept="image/jpeg,image/png"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cancelled Cheque *</label>
                <input
                  type="file"
                  name="cancelled_cheque"
                  onChange={(e) => handleFileChange(e, 'cancelled_cheque')}
                  accept="image/jpeg,image/png,application/pdf"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">{sections[1]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Highest Educational Qualification *</label>
                <input
                  type="text"
                  name="highestQualification"
                  value={formData.highestQualification}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year of Completion *</label>
                <input
                  type="number"
                  name="yearOfCompletion"
                  value={formData.yearOfCompletion}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Relevant Certifications</label>
                <input
                  type="file"
                  name="certifications"
                  onChange={(e) => handleFileChange(e, 'certifications', true)}
                  accept="image/jpeg,image/png,application/pdf"
                  multiple
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience *</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Occupation</label>
                <input
                  type="text"
                  name="currentOccupation"
                  value={formData.currentOccupation}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Professional References</label>
                <textarea
                  name="references"
                  value={formData.references}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">{sections[2]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary Sectors of Expertise *</label>
                <select
                  name="primarySectors"
                  value={formData.primarySectors}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Geographical Regions Covered *</label>
                <select
                  name="regionsCovered"
                  value={formData.regionsCovered}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Africa">Africa</option>
                  <option value="South America">South America</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Languages Spoken *</label>
                <select
                  name="languagesSpoken"
                  value={formData.languagesSpoken}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Client Base Size</label>
                <input
                  type="number"
                  name="clientBaseSize"
                  value={formData.clientBaseSize}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expected Monthly Audit Volume</label>
                <input
                  type="number"
                  name="expectedAuditVolume"
                  value={formData.expectedAuditVolume}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">{sections[3]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Devices Available *</label>
                <select
                  name="devicesAvailable"
                  value={formData.devicesAvailable}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Smartphone">Smartphone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Internet Connectivity Quality *</label>
                <select
                  name="internetQuality"
                  value={formData.internetQuality}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comfort with Digital Tools *</label>
                <select
                  name="digitalToolComfort"
                  value={formData.digitalToolComfort}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">{sections[4]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Criminal Record *</label>
                <select
                  name="criminalRecord"
                  value={formData.criminalRecord}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              {formData.criminalRecord === 'Yes' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Criminal Record Details</label>
                  <textarea
                    name="criminalDetails"
                    value={formData.criminalDetails}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  ></textarea>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Conflict of Interest</label>
                <textarea
                  name="conflictOfInterest"
                  value={formData.conflictOfInterest}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="acceptCodeOfConduct"
                  checked={formData.acceptCodeOfConduct}
                  onChange={handleInputChange}
                  required
                  className="mr-2"
                />
                <label className="text-sm font-medium">Accept Code of Conduct *</label>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">{sections[5]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Willingness to Undergo Training *</label>
                <select
                  name="trainingWillingness"
                  value={formData.trainingWillingness}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Training Mode</label>
                <select
                  name="trainingMode"
                  value={formData.trainingMode}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Online">Online</option>
                  <option value="In-person">In-person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">{sections[6]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skills & Languages</label>
                <textarea
                  name="additionalSkills"
                  value={formData.additionalSkills}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Questions/Comments</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resume/CV *</label>
                <input
                  type="file"
                  name="resume"
                  onChange={(e) => handleFileChange(e, 'resume')}
                  accept="application/pdf"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Other Relevant Documents</label>
                <input
                  type="file"
                  name="otherDocuments"
                  onChange={(e) => handleFileChange(e, 'otherDocuments', true)}
                  accept="image/jpeg,image/png,application/pdf"
                  multiple
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Profile Completion: {progress}%</p>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        {renderSection()}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className={`px-4 py-2 rounded ${currentSection === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            Previous
          </button>
          {currentSection < sections.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded ${loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
                }`}
            >
              {loading ? 'Submitting...' : 'Submit Profile'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateProfile;