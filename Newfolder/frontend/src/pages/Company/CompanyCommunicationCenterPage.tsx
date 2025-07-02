import React, { useState } from 'react';

interface Message {
  id: number;
  subject: string;
  content: string;
  sender: string;
  recipient: string;
  date: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  type: 'internal' | 'external' | 'announcement';
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'published' | 'archived';
}

const CompanyCommunicationCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedType, setSelectedType] = useState('all');

  const messages: Message[] = [
    {
      id: 1,
      subject: "Monthly Performance Review",
      content: "Please review the attached monthly performance report and provide feedback by end of week.",
      sender: "Management Team",
      recipient: "All Employees",
      date: "2024-01-15",
      status: 'read',
      type: 'internal'
    },
    {
      id: 2,
      subject: "New Product Launch Announcement",
      content: "We are excited to announce the launch of our new premium product line next month.",
      sender: "Marketing Team",
      recipient: "All Customers",
      date: "2024-01-14",
      status: 'delivered',
      type: 'external'
    },
    {
      id: 3,
      subject: "System Maintenance Notice",
      content: "Scheduled maintenance will occur on Sunday from 2-4 AM. Service may be temporarily unavailable.",
      sender: "IT Department",
      recipient: "All Users",
      date: "2024-01-13",
      status: 'sent',
      type: 'announcement'
    },
    {
      id: 4,
      subject: "Agent Commission Update",
      content: "Updated commission structure effective from next month. Please review the new rates.",
      sender: "Finance Team",
      recipient: "All Agents",
      date: "2024-01-12",
      status: 'read',
      type: 'internal'
    },
    {
      id: 5,
      subject: "Customer Feedback Request",
      content: "We value your feedback. Please take a moment to complete our customer satisfaction survey.",
      sender: "Customer Success",
      recipient: "Premium Customers",
      date: "2024-01-11",
      status: 'delivered',
      type: 'external'
    }
  ];

  const announcements: Announcement[] = [
    {
      id: 1,
      title: "Platform Updates - January 2024",
      content: "New features and improvements have been added to enhance your experience. Check out the latest updates in our knowledge base.",
      author: "Product Team",
      date: "2024-01-15",
      priority: 'medium',
      status: 'published'
    },
    {
      id: 2,
      title: "Holiday Schedule",
      content: "Office will be closed for the upcoming holiday. Support will be available with limited hours.",
      author: "HR Department",
      date: "2024-01-10",
      priority: 'high',
      status: 'published'
    },
    {
      id: 3,
      title: "Security Enhancement",
      content: "We have implemented additional security measures to protect your data. No action required from your end.",
      author: "Security Team",
      date: "2024-01-08",
      priority: 'high',
      status: 'published'
    },
    {
      id: 4,
      title: "Training Session - New Features",
      content: "Join us for a training session on the new platform features. Registration required.",
      author: "Training Team",
      date: "2024-01-05",
      priority: 'low',
      status: 'draft'
    }
  ];

  const messageTypes = ['all', 'internal', 'external', 'announcement'];

  const filteredMessages = selectedType === 'all' 
    ? messages 
    : messages.filter(message => message.type === selectedType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-yellow-100 text-yellow-800';
      case 'read': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-purple-100 text-purple-800';
      case 'external': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Communication Center</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Messages</h3>
          <p className="text-3xl font-bold text-blue-600">{messages.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Unread</h3>
          <p className="text-3xl font-bold text-red-600">
            {messages.filter(m => m.status === 'sent' || m.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Announcements</h3>
          <p className="text-3xl font-bold text-purple-600">{announcements.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Published</h3>
          <p className="text-3xl font-bold text-green-600">
            {announcements.filter(a => a.status === 'published').length}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('compose')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compose'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Compose
            </button>
          </nav>
        </div>
      </div>

      {/* Messages Section */}
      {activeTab === 'messages' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {messageTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              New Message
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{message.subject}</div>
                          <div className="text-sm text-gray-500">{message.content.substring(0, 50)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.sender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.recipient}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(message.type)}`}>
                          {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                          {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(message.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900 mr-3">Reply</button>
                        <button className="text-purple-600 hover:text-purple-900">Forward</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Section */}
      {activeTab === 'announcements' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Announcements</h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Create Announcement
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        announcement.status === 'published' ? 'bg-green-100 text-green-800' :
                        announcement.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{announcement.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>By {announcement.author}</span>
                      <span>{new Date(announcement.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button className="text-green-600 hover:text-green-900">Publish</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compose Section */}
      {activeTab === 'compose' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Compose Message</h2>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Internal Message</option>
                <option>External Message</option>
                <option>Announcement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter recipient names or groups..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter message subject..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
              <textarea
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your message content..."
              ></textarea>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Save Draft
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Schedule Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Message Templates
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Communication Analytics
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Bulk Messaging
        </button>
      </div>
    </div>
  );
};

export default CompanyCommunicationCenterPage; 