import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, Building, Globe, Award } from 'lucide-react';

interface SLPUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  signup_type: string;
  status: string;
  created_at: string;
  linkedin_url?: string;
  pincode?: string;
  city?: string;
  state?: string;
  referral_id?: string;
  experience_years?: string;
  company_name?: string;
  website?: string;
  address?: string;
}

const SLPPage: React.FC = () => {
  const [slpUsers, setSlpUsers] = useState<SLPUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchSLPUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication error');
        setLoading(false);
        return;
      }

      const response = await api.get('/api/admin/users', {
        params: { signup_type: 'slp' },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSlpUsers(response.data.users || []);
      } else {
        setError(response.data.error || 'Failed to fetch SLP users');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch SLP users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (userId: number, status: 'active' | 'rejected') => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication error');
        return;
      }

      await api.post(`/api/admin/users/${userId}/approve`, {
        status,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the list
      fetchSLPUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update user status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
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
            Unknown
          </span>
        );
    }
  };

  const filteredUsers = slpUsers.filter(user => {
    if (filterStatus === 'all') return true;
    return user.status === filterStatus;
  });

  useEffect(() => {
    fetchSLPUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-0 m-0">
      <div className="w-full max-w-full overflow-x-hidden px-1 sm:px-2 md:px-4 py-4">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">SLP (Service Partners) Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage Service Partner registrations and approvals</p>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={fetchSLPUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SLP users found</h3>
              <p className="text-gray-500">
                {filterStatus === 'all' 
                  ? 'No Service Partner registrations found.' 
                  : `No SLP users with ${filterStatus} status found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                    {getStatusBadge(user.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                    {user.company_name && (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{user.company_name}</span>
                      </div>
                    )}
                    {user.experience_years && (
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{user.experience_years} years experience</span>
                      </div>
                    )}
                    {user.city && user.state && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{user.city}, {user.state}</span>
                      </div>
                    )}
                  </div>
                  
                  {user.status === 'pending' && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleApproveReject(user.id, 'active')}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveReject(user.id, 'rejected')}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block w-full max-w-full overflow-x-hidden">
          <div className="bg-white rounded-lg shadow w-full max-w-full overflow-x-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No SLP users found</h3>
                <p className="text-gray-500">
                  {filterStatus === 'all' 
                    ? 'No Service Partner registrations found.' 
                    : `No SLP users with ${filterStatus} status found.`
                  }
                </p>
              </div>
            ) : (
              <table className="w-full table-auto divide-y divide-gray-200 text-xs whitespace-normal break-words">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1 md:px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Service Partner</th>
                    <th className="px-1 md:px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Contact Info</th>
                    <th className="px-1 md:px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Company Details</th>
                    <th className="px-1 md:px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Experience</th>
                    <th className="px-1 md:px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Status</th>
                    <th className="px-1 md:px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-1 md:px-2 py-2 whitespace-normal break-words align-top">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-2">
                            <div className="font-medium text-gray-900 break-words">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-gray-500 break-words">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-1 md:px-2 py-2 whitespace-normal break-words align-top">
                        <div className="text-gray-900 break-words">
                          <div className="flex items-center mb-1">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="break-words">{user.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="break-words">{user.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-1 md:px-2 py-2 whitespace-normal break-words align-top">
                        <div className="text-gray-900 break-words">
                          {user.company_name && (
                            <div className="flex items-center mb-1">
                              <Building className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="break-words">{user.company_name}</span>
                            </div>
                          )}
                          {user.website && (
                            <div className="flex items-center mb-1">
                              <Globe className="h-4 w-4 text-gray-400 mr-2" />
                              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">
                                {user.website}
                              </a>
                            </div>
                          )}
                          {user.city && user.state && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="break-words">{user.city}, {user.state}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-1 md:px-2 py-2 whitespace-normal break-words align-top">
                        <div className="text-gray-900 break-words">
                          {user.experience_years && (
                            <div className="flex items-center mb-1">
                              <Award className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="break-words">{user.experience_years} years</span>
                            </div>
                          )}
                          {user.linkedin_url && (
                            <div className="flex items-center">
                              <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs break-words">
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-1 md:px-2 py-2 whitespace-normal break-words align-top">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-1 md:px-2 py-2 whitespace-normal break-words align-top text-xs font-medium">
                        {user.status === 'pending' && (
                          <div className="flex flex-col md:flex-row gap-2">
                            <button
                              onClick={() => handleApproveReject(user.id, 'active')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveReject(user.id, 'rejected')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </div>
                        )}
                        {user.status === 'active' && (
                          <span className="text-green-600">Approved</span>
                        )}
                        {user.status === 'rejected' && (
                          <span className="text-red-600">Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {slpUsers.filter(u => u.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {slpUsers.filter(u => u.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {slpUsers.filter(u => u.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {slpUsers.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLPPage; 