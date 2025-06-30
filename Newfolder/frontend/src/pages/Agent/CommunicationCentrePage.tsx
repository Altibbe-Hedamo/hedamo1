import React, { useEffect, useState } from 'react';
import { FaBullhorn, FaBook, FaQuestionCircle, FaCalendarAlt } from 'react-icons/fa';
import api from '../../config/axios';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  recipients: string[];
  created_by: number;
  updated_at: string;
}

const CommunicationCentrePage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        console.log('Fetching announcements...');
        
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await api.get('/api/agent/announcements', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

        const announcementsData = Array.isArray(response.data) ? response.data : [];
        setAnnouncements(announcementsData);
        
      } catch (err: any) {
        console.error('Error fetching announcements:', err);
        if (err.response) {
          if (err.response.status === 403) {
            setError('Access denied. You must be an agent to view these announcements.');
          } else {
            setError(`Failed to load announcements: ${err.response.data.message || 'Server error'}`);
          }
        } else if (err.request) {
          setError('No response from server. Please check your connection.');
        } else {
          setError(`Failed to load announcements: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Communication Centre</h1>
          <p className="mt-1 text-sm text-gray-600">Stay updated with the latest announcements</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FaBullhorn className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Updates</h3>
                <p className="text-sm text-gray-500">Latest news</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <FaBook className="text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Guides</h3>
                <p className="text-sm text-gray-500">Helpful resources</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FaQuestionCircle className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Support</h3>
                <p className="text-sm text-gray-500">Get help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 gap-6">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              No announcements available at the moment.
            </div>
          ) : (
            announcements.map((announcement) => (
              <div 
                key={announcement.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FaBullhorn className="text-blue-600 w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {announcement.title}
                      </h3>
                      <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="mr-2" />
                        <span>
                          {new Date(announcement.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationCentrePage; 