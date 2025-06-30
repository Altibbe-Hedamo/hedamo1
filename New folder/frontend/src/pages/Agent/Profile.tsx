import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { AuthContext } from '../../context/AuthContext';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
          // Refresh the profile status in the context
          await refreshProfileStatus();
        } else {
          setError('Failed to load profile');
          navigate('/agent-dashboard/create-profile');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
        navigate('/agent-dashboard/create-profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, refreshProfileStatus]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Not specified'
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Agent Profile</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Profile Header with Image */}
        <div className="flex items-center mb-8">
          <img
            src={`/Uploads/profiles/${profile.photo_path}`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mr-4 border-2 border-blue-500"
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Profile')}
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{profile.full_name || 'Agent Name'}</h2>
            <p className="text-gray-600">{profile.email_address || 'Email not specified'}</p>
          </div>
        </div>

        <Section title="Personal Identification & Contact Details" icon="👤">
          <Field label="Full Name" value={profile.full_name || 'Not specified'} />
          <Field label="Date of Birth" value={formatDate(profile.date_of_birth)} />
          <Field label="Gender" value={profile.gender || 'Not specified'} />
          <Field label="Mobile Number" value={profile.mobile_number || 'Not specified'} />
          <Field label="Email Address" value={profile.email_address || 'Not specified'} />
          <Field label="Current Address" value={profile.current_address || 'Not specified'} />
          <Field label="Permanent Address" value={profile.permanent_address || 'Not specified'} />
        </Section>

        <Section title="Identity Verification (KYC) & Financial Details" icon="🔍">
          <Field label="ID Number" value={profile.id_number || 'Not specified'} />
          <Field label="Bank Account Number" value={profile.bank_account_number || 'Not specified'} />
          <Field label="IFSC Code" value={profile.ifsc_code || 'Not specified'} />
          <Field
            label="Photo ID"
            value={
              profile.photo_path ? (
                <a href={`/Uploads/profiles/${profile.photo_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View
                </a>
              ) : (
                'Not uploaded'
              )
            }
          />
          <Field
            label="Selfie with ID"
            value={
              profile.selfie_path ? (
                <a href={`/Uploads/profiles/${profile.selfie_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View
                </a>
              ) : (
                'Not uploaded'
              )
            }
          />
          <Field
            label="Cancelled Cheque"
            value={
              profile.cancelled_cheque_path ? (
                <a href={`/Uploads/profiles/${profile.cancelled_cheque_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View
                </a>
              ) : (
                'Not uploaded'
              )
            }
          />
        </Section>

        <Section title="Professional & Educational Background" icon="🎓">
          <Field label="Highest Qualification" value={profile.highest_qualification || 'Not specified'} />
          <Field label="Institution" value={profile.institution || 'Not specified'} />
          <Field label="Year of Completion" value={profile.year_of_completion || 'Not specified'} />
          <Field label="Certifications" value={profile.certifications || 'None'} />
          <Field label="Years of Experience" value={profile.years_of_experience || 'Not specified'} />
          <Field label="Current Occupation" value={profile.current_occupation || 'Not specified'} />
          <Field label="References" value={profile.reference_details || 'None'} />
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
          <Field label="Additional Skills" value={profile.additional_skills || 'None'} />
          <Field label="Comments" value={profile.comments || 'None'} />
          <Field
            label="Resume"
            value={
              profile.resume_path ? (
                <a href={`/Uploads/profiles/${profile.resume_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View
                </a>
              ) : (
                'Not uploaded'
              )
            }
          />
          <Field
            label="Other Documents"
            value={
              profile.other_documents ? (
                profile.other_documents.split(',').map((doc: string, index: number) => (
                  <a
                    key={index}
                    href={`/Uploads/profiles/${doc.trim()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline"
                  >
                    Document {index + 1}
                  </a>
                ))
              ) : (
                'None'
              )
            }
          />
        </Section>

        <button
          onClick={() => navigate('/agent-dashboard/edit-profile')}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <span className="mr-2">{icon}</span>
      {title}
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start">
    <strong className="text-gray-600 w-40">{label}:</strong>
    <span className="text-gray-800 flex-1">{value}</span>
  </div>
);

export default Profile;