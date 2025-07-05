import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';

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

const CompanyCreateProfile: React.FC = () => {
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sections = [
    'Personal Identification & Contact Details',
    'Professional & Educational Background',
    'Business Information',
    'Technology & Platform Readiness',
    'Compliance & Declarations',
    'Training & Availability',
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

    const token = sessionStorage.getItem('token');
    if (!token) {
      setError('Please log in to continue');
      setLoading(false);
      return;
    }

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
      const response = await api.post('/api/profiles', form, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSuccess('Profile submitted for approval');
        setTimeout(() => navigate('/company-portal/profile'), 2000);
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
        );
      case 1:
        return (
          <div>
            <h2 className="text-lg font-semibold mb-4">{sections[1]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                <label className="block text-sm font-medium mb-1">Certifications</label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
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
                <label className="block text-sm font-medium mb-1">References</label>
                <input
                  type="text"
                  name="references"
                  value={formData.references}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
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
              <div>
                <label className="block text-sm font-medium mb-1">Expected Audit Volume</label>
                <input
                  type="text"
                  name="expectedAuditVolume"
                  value={formData.expectedAuditVolume}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              {formData.criminalRecord === 'Yes' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Criminal Details</label>
                  <textarea
                    name="criminalDetails"
                    value={formData.criminalDetails}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Conflict of Interest</label>
                <textarea
                  name="conflictOfInterest"
                  value={formData.conflictOfInterest}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="acceptCodeOfConduct"
                  checked={formData.acceptCodeOfConduct}
                  onChange={handleInputChange}
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  I accept the code of conduct *
                </label>
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
                <label className="block text-sm font-medium mb-1">Training Willingness *</label>
                <select
                  name="trainingWillingness"
                  value={formData.trainingWillingness}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Training Mode</label>
                <input
                  type="text"
                  name="trainingMode"
                  value={formData.trainingMode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Availability</label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
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
                <label className="block text-sm font-medium mb-1">Additional Skills</label>
                <input
                  type="text"
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
            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Profile Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange(e, 'photo')}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Selfie with ID *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileChange(e, 'selfie')}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resume *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={e => handleFileChange(e, 'resume')}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cancelled Cheque *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleFileChange(e, 'cancelled_cheque')}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Certifications (multiple)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={e => handleFileChange(e, 'certifications', true)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Other Documents (multiple)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={e => handleFileChange(e, 'otherDocuments', true)}
                  className="w-full"
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Company Profile</h1>
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">Progress: {progress}%</div>
        </div>
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
        <form onSubmit={handleSubmit}>
          {renderSection()}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              Previous
            </button>
            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyCreateProfile; 