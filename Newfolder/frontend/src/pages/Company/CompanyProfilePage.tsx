import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { AuthContext } from '../../context/AuthContext';

const CompanyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { refreshProfileStatus } = useContext(AuthContext);

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

        if (response.data.success) {
          setProfile(response.data.profile);
          setEditData(response.data.profile);
          if (refreshProfileStatus) {
            await refreshProfileStatus();
          }
        } else {
          setError('Failed to load profile');
          // Navigate to create profile if no profile exists
          navigate('/company-portal/create-profile');
        }
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
        // If 404, redirect to create profile
        if (err.response?.status === 404) {
          navigate('/company-portal/create-profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, refreshProfileStatus]);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '1900-01-01') return 'Not specified';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Not specified'
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...profile });
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
          setEditData(updatedResponse.data.profile);
        }
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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

  if (!profile) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Company Profile</h1>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors duration-200"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      )}

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
          </div>
        </div>

        <Section title="Personal Identification & Contact Details" icon="👤">
          <EditableField 
            label="Full Name" 
            value={profile.full_name || 'Not specified'} 
            name="full_name"
            editing={isEditing}
            editValue={editData.full_name || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Date of Birth" 
            value={formatDate(profile.date_of_birth)} 
            name="date_of_birth"
            editing={isEditing}
            editValue={editData.date_of_birth || ''}
            onChange={handleChange}
            type="date"
          />
          <EditableField 
            label="Gender" 
            value={profile.gender || 'Not specified'} 
            name="gender"
            editing={isEditing}
            editValue={editData.gender || ''}
            onChange={handleChange}
            options={['Not specified', 'Male', 'Female', 'Other']}
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
            type="email"
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

        <Section title="Identity Verification (KYC) & Financial Details" icon="🔍">
          <EditableField 
            label="ID Number" 
            value={profile.id_number || 'Not specified'} 
            name="id_number"
            editing={isEditing}
            editValue={editData.id_number || ''}
            onChange={handleChange}
          />
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

        <Section title="Professional & Educational Background" icon="🎓">
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
          <EditableField 
            label="Years of Experience" 
            value={profile.years_of_experience || 'Not specified'} 
            name="years_of_experience"
            editing={isEditing}
            editValue={editData.years_of_experience || ''}
            onChange={handleChange}
          />
          <EditableField 
            label="Current Occupation" 
            value={profile.current_occupation || 'Not specified'} 
            name="current_occupation"
            editing={isEditing}
            editValue={editData.current_occupation || ''}
            onChange={handleChange}
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
        </Section>

        <Section title="Compliance & Declarations" icon="📜">
          <Field label="Criminal Record" value={profile.criminal_record || 'Not specified'} />
          {profile.criminal_record === 'Yes' && (
            <Field label="Criminal Details" value={profile.criminal_details || 'None'} />
          )}
          <Field label="Conflict of Interest" value={profile.conflict_of_interest || 'None'} />
          <Field label="Code of Conduct Accepted" value={profile.accept_code_of_conduct ? 'Yes' : 'No'} />
        </Section>

        <Section title="Additional Information" icon="ℹ️">
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
            label="Comments" 
            value={profile.comments || 'None'} 
            name="comments"
            editing={isEditing}
            editValue={editData.comments || ''}
            onChange={handleChange}
            textarea
          />
        </Section>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
      <span className="mr-2">{icon}</span>
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-gray-800">{value}</p>
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
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
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
      <p className="text-gray-800 p-2 bg-gray-50 rounded-md">{value}</p>
    )}
  </div>
);

export default CompanyProfilePage; 