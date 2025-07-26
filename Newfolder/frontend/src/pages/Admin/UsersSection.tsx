import React, { useState, useEffect } from 'react';
import { User, Building, Package, Users, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../config/axios';

interface Company {
  company_id: number;
  company_name: string;
  company_status: string;
  products: Product[];
  created_at: string;
}

interface Product {
  product_id: number;
  product_name: string;
  product_status: string;
  report_status: string;
}

interface UserProfile {
  id: number;
  user_id: number;
  full_name: string;
  email_address: string;
  status: string;
  email: string;
  first_name: string;
  last_name: string;
  signup_type: string;
  phone?: string;
  linkedin_url?: string;
  experience_years?: string;
  company_name?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  companies: Company[];
  created_at: string;
  updated_at: string;
  hasProfile: boolean;
  profile?: any;
  years_of_experience?: string;
}

const UsersSection: React.FC = () => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('Authentication error');
          setLoading(false);
          return;
        }

        // Fetch all approved users
        const response = await api.get('/api/admin/users');
        
        if (response.data.success && Array.isArray(response.data.users)) {
          const approvedUsers = response.data.users.filter((user: any) => user.status === 'active');
          
                     // Fetch additional details for each user type
           const usersWithDetails = await Promise.all(
             approvedUsers.map(async (user: any) => {
               let additionalDetails: any = {};
               
               // For agents, get profile details
               if (user.signup_type === 'agent') {
                 try {
                   const profileResponse = await api.get('/api/admin/profiles');
                   if (profileResponse.data.success) {
                     const agentProfile = profileResponse.data.profiles.find(
                       (p: any) => p.user_id === user.id
                     );
                     if (agentProfile) {
                       additionalDetails = {
                         ...agentProfile,
                         companies: agentProfile.companies || []
                       };
                     }
                   }
                 } catch (err) {
                   console.log('No profile found for agent:', user.id);
                 }
               }
               
               return {
                 ...user,
                 ...additionalDetails,
                 full_name: user.first_name + ' ' + user.last_name,
                 email_address: user.email,
                 signup_type: user.signup_type,
                 companies: additionalDetails.companies || []
               };
             })
           );
          
          setAllUsers(usersWithDetails);
        } else {
          setError('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getUserTypeLabel = (signupType: string) => {
    switch (signupType) {
      case 'agent':
        return 'Agent';
      case 'slp':
        return 'Service Partner (SLP)';
      case 'channel_partner':
        return 'Channel Partner';
      case 'company':
        return 'Company';
      case 'client':
        return 'Client';
      case 'employee':
        return 'Employee';
      case 'hr':
        return 'HR';
      case 'hap':
        return 'HAP';
      case 'hrb':
        return 'HRB';
      default:
        return signupType;
    }
  };

  const filteredUsers = allUsers.filter(user => {
    if (filterType === 'all') return true;
    return user.signup_type === filterType;
  });

  const usersWithIncompleteInfo = allUsers.filter(user => {
    // Check for incomplete company information
    if (user.signup_type === 'agent' && (!user.companies || user.companies.length === 0)) {
      return true;
    }
    if (['slp', 'channel_partner', 'company'].includes(user.signup_type)) {
      return !user.company_name || !user.website || !user.address;
    }
    return false;
  });

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Users</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="agent">Agents</option>
            <option value="slp">Service Partners (SLP)</option>
            <option value="channel_partner">Channel Partners</option>
            <option value="company">Companies</option>
            <option value="client">Clients</option>
            <option value="employee">Employees</option>
            <option value="hr">HR</option>
            <option value="hap">HAP</option>
            <option value="hrb">HRB</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
              <p className="text-sm text-gray-600">Total Approved Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <User className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {allUsers.filter(u => u.signup_type === 'agent').length}
              </p>
              <p className="text-sm text-gray-600">Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {allUsers.filter(u => u.signup_type === 'slp').length}
              </p>
              <p className="text-sm text-gray-600">Service Partners</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{usersWithIncompleteInfo.length}</p>
              <p className="text-sm text-gray-600">Incomplete Profiles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users with Incomplete Information */}
      {usersWithIncompleteInfo.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-orange-800">Users with Incomplete Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersWithIncompleteInfo.map(user => (
              <div key={user.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{getUserTypeLabel(user.signup_type)}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {getStatusBadge(user.status)}
                </div>
                <div className="text-xs text-orange-700">
                  {user.signup_type === 'agent' && (!user.companies || user.companies.length === 0) && (
                    <p>⚠️ No companies registered</p>
                  )}
                  {['slp', 'channel_partner', 'company'].includes(user.signup_type) && (
                    <div>
                      {!user.company_name && <p>⚠️ Missing company name</p>}
                      {!user.website && <p>⚠️ Missing website</p>}
                      {!user.address && <p>⚠️ Missing address</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Approved Users */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-4">
          <Users className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold">All Approved Users</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-sm text-gray-600">{getUserTypeLabel(user.signup_type)}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {user.phone && <p className="text-xs text-gray-500">📞 {user.phone}</p>}
                </div>
                {getStatusBadge(user.status)}
              </div>
              
              {/* User-specific details */}
              <div className="text-xs text-gray-600 space-y-1">
                {user.linkedin_url && (
                  <p>
                    <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">LinkedIn Profile</a>
                  </p>
                )}
                {user.experience_years && (
                  <p>Experience: {user.experience_years} years</p>
                )}
                {user.company_name && (
                  <p>Company: {user.company_name}</p>
                )}
                {user.website && (
                  <p>
                    <a href={user.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">Website</a>
                  </p>
                )}
                {user.city && user.state && (
                  <p>Location: {user.city}, {user.state}</p>
                )}
                {user.companies && user.companies.length > 0 && (
                  <p>Companies: {user.companies.length}</p>
                )}
                <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
        {filteredUsers.length === 0 && (
          <p className="text-gray-500 text-center py-4">No users found for the selected filter.</p>
        )}
      </div>
    </div>
  );
};

export default UsersSection;