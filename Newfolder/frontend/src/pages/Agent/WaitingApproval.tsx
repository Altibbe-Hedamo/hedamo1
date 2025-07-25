import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WaitingApproval: React.FC = () => {
  const { profileStatus, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/agent-dashboard/create-profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">
          {profileStatus === 'pending' ? 'Profile Pending Approval' : 'Profile Rejected'}
        </h1>
        <p className="text-gray-600 mb-6">
          {profileStatus === 'pending'
            ? 'Your profile is currently under review by the admin. You will be notified once it is active.'
            : 'Your profile has been rejected by the admin. Please update your profile and resubmit for approval.'}
        </p>
        <div className="space-y-4">
          {profileStatus === 'rejected' && (
            <button
              onClick={handleEditProfile}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>
          )}
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingApproval;