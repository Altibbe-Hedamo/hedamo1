import React, { useEffect, useState } from 'react';
import api from '../../config/axios';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  signup_type: string;
  status: string;
  created_at: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('client');

  const fetchUsers = async (type: string) => {
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
        params: { signup_type: type },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUsers(response.data.users || []);
      } else {
        setError(response.data.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (userId: number, status: 'approved' | 'rejected') => {
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
      fetchUsers(selectedType);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update user status');
    }
  };

  useEffect(() => {
    fetchUsers(selectedType);
  }, [selectedType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-red-500 text-center">
          <p className="font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Filter users for HRB tab to only show approved
  const displayedUsers = users;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="mb-4 flex space-x-2">
        <button onClick={() => setSelectedType('client')} className={`px-4 py-2 rounded ${selectedType === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Clients</button>
        <button onClick={() => setSelectedType('agent')} className={`px-4 py-2 rounded ${selectedType === 'agent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Agents</button>
        <button onClick={() => setSelectedType('channel_partner')} className={`px-4 py-2 rounded ${selectedType === 'channel_partner' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Channel Partners</button>
        <button onClick={() => setSelectedType('company')} className={`px-4 py-2 rounded ${selectedType === 'company' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Companies</button>
      </div>
      {displayedUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found as of now.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.phone?.startsWith('91') ? user.phone.substring(2) : user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage; 