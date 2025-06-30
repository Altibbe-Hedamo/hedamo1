import React, { useState, useEffect } from 'react';
import { FaBullhorn, FaBell, FaEnvelope, FaCalendarAlt, FaTimes, FaUsers, FaChartLine } from 'react-icons/fa';
import api from '../../config/axios';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  created_by: number;
}

const AdminCommunicationCenter: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    recipients: [] as string[]
  });

  const recipientOptions = [
    { id: 'hvp', label: 'All HVP' },
    { id: 'hap', label: 'All HAP' },
    { id: 'hrb', label: 'All HRB' },
    { id: 'users', label: 'All Users' }
  ];

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        console.log('Fetching announcements...');
        const response = await api.get('/api/admin/announcements');
        console.log('Announcements response:', response.data);
        
        if (!response.data) {
          console.warn('No data received from API');
          setAnnouncements([]);
          return;
        }
        
        setAnnouncements(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching announcements:', err);
        setError(
          err.response?.data?.error || 
          err.message || 
          'Failed to fetch announcements. Please try again later.'
        );
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleRecipientChange = (recipientId: string) => {
    setNewAnnouncement(prev => {
      const currentRecipients = [...prev.recipients];
      const index = currentRecipients.indexOf(recipientId);
      
      if (index === -1) {
        currentRecipients.push(recipientId);
      } else {
        currentRecipients.splice(index, 1);
      }
      
      return {
        ...prev,
        recipients: currentRecipients
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content || newAnnouncement.recipients.length === 0) {
      setError('Title, content, and at least one recipient are required');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating announcement:', {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        recipients: newAnnouncement.recipients
      });
      
      const response = await api.post('/api/admin/announcements', {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        recipients: newAnnouncement.recipients
      });
      
      console.log('Announcement created:', response.data);
      
      const newAnnouncementData = {
        id: response.data.id,
        title: response.data.title,
        content: response.data.content,
        created_at: response.data.created_at,
        created_by: response.data.created_by
      };
      
      setAnnouncements([newAnnouncementData, ...announcements]);
      setNewAnnouncement({ title: '', content: '', recipients: [] });
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      console.error('Error creating announcement:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to create announcement. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Communication Center</h1>
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Announcement
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading announcements...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaBullhorn className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                    <p className="text-2xl font-semibold text-gray-900">{announcements.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaBell className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Announcements</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {announcements.filter(a => 
                        new Date(a.created_at).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaChartLine className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Last Announcement</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {announcements.length > 0
                        ? new Date(announcements[0].created_at).toLocaleDateString()
                        : 'No announcements'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h2>
              <div className="space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                      <p className="mt-1 text-gray-600">{announcement.content}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Posted on {new Date(announcement.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No announcements yet. Create your first announcement!</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* New Announcement Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowForm(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create New Announcement</h3>
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <textarea
                      id="content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter announcement content"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients
                    </label>
                    <div className="space-y-2">
                      {recipientOptions.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={option.id}
                            checked={newAnnouncement.recipients.includes(option.id)}
                            onChange={() => handleRecipientChange(option.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={option.id} className="ml-2 block text-sm text-gray-900">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommunicationCenter; 