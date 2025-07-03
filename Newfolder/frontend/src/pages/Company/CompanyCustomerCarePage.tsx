import React, { useState } from 'react';

interface CustomerTicket {
  id: number;
  customerName: string;
  email: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  createdAt: string;
  assignedTo: string;
}

interface CustomerFeedback {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  product: string;
  status: 'pending' | 'reviewed' | 'addressed';
}

const CompanyCustomerCarePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const customerTickets: CustomerTicket[] = [
    {
      id: 1,
      customerName: "John Smith",
      email: "john.smith@company.com",
      subject: "Product Delivery Issue",
      description: "Order #12345 was supposed to be delivered yesterday but hasn't arrived yet. Need urgent assistance.",
      priority: 'high',
      status: 'in-progress',
      category: 'Delivery',
      createdAt: '2024-01-15',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: 2,
      customerName: "Emily Davis",
      email: "emily.davis@business.com",
      subject: "Billing Query",
      description: "Received an invoice for services I didn't order. Need clarification on the charges.",
      priority: 'medium',
      status: 'open',
      category: 'Billing',
      createdAt: '2024-01-14',
      assignedTo: 'Mike Wilson'
    },
    {
      id: 3,
      customerName: "David Lee",
      email: "david.lee@enterprise.com",
      subject: "Technical Support",
      description: "Unable to access the platform dashboard. Getting error message when trying to log in.",
      priority: 'urgent',
      status: 'open',
      category: 'Technical',
      createdAt: '2024-01-14',
      assignedTo: 'Unassigned'
    },
    {
      id: 4,
      customerName: "Lisa Brown",
      email: "lisa.brown@startup.com",
      subject: "Feature Request",
      description: "Would like to request additional reporting features for better analytics.",
      priority: 'low',
      status: 'resolved',
      category: 'Feature Request',
      createdAt: '2024-01-13',
      assignedTo: 'Product Team'
    },
    {
      id: 5,
      customerName: "Michael Wilson",
      email: "michael.wilson@corp.com",
      subject: "Account Upgrade",
      description: "Interested in upgrading to the premium plan. Need information about features and pricing.",
      priority: 'medium',
      status: 'closed',
      category: 'Sales',
      createdAt: '2024-01-12',
      assignedTo: 'Sales Team'
    }
  ];

  const customerFeedback: CustomerFeedback[] = [
    {
      id: 1,
      customerName: "Alice Johnson",
      rating: 5,
      comment: "Excellent service and support. The platform is very user-friendly and the customer care team is responsive.",
      date: "2024-01-15",
      product: "Premium Business Package",
      status: 'reviewed'
    },
    {
      id: 2,
      customerName: "Bob Smith",
      rating: 3,
      comment: "Good platform overall, but the mobile app needs improvement. Some features are not working properly.",
      date: "2024-01-14",
      product: "Standard Business Package",
      status: 'pending'
    },
    {
      id: 3,
      customerName: "Carol Davis",
      rating: 4,
      comment: "Very satisfied with the service. Quick response times and helpful support team.",
      date: "2024-01-13",
      product: "Enterprise Solution",
      status: 'addressed'
    },
    {
      id: 4,
      customerName: "Daniel Wilson",
      rating: 2,
      comment: "Experienced several technical issues. Support team was slow to respond. Needs improvement.",
      date: "2024-01-12",
      product: "Basic Business Package",
      status: 'pending'
    }
  ];

  const statuses = ['all', 'open', 'in-progress', 'resolved', 'closed'];

  const filteredTickets = selectedStatus === 'all' 
    ? customerTickets 
    : customerTickets.filter(ticket => ticket.status === selectedStatus);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Care & Support</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Tickets</h3>
          <p className="text-3xl font-bold text-blue-600">{customerTickets.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Open Tickets</h3>
          <p className="text-3xl font-bold text-red-600">
            {customerTickets.filter(t => t.status === 'open').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Avg Response Time</h3>
          <p className="text-3xl font-bold text-green-600">2.5h</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Satisfaction Rate</h3>
          <p className="text-3xl font-bold text-purple-600">94%</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Support Tickets
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Customer Feedback
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Support Tickets Section */}
      {activeTab === 'tickets' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Create Ticket
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ticket.customerName}</div>
                          <div className="text-sm text-gray-500">{ticket.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                          <div className="text-sm text-gray-500">{ticket.description.substring(0, 50)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.assignedTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900 mr-3">Assign</button>
                        <button className="text-purple-600 hover:text-purple-900">Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customer Feedback Section */}
      {activeTab === 'feedback' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Customer Feedback</h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Export Feedback
            </button>
          </div>

          <div className="space-y-4">
            {customerFeedback.map((feedback) => (
              <div key={feedback.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{feedback.customerName}</h3>
                      <div className="text-yellow-500 text-lg">{getRatingStars(feedback.rating)}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        feedback.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                        feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{feedback.comment}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Product: {feedback.product}</span>
                      <span>{new Date(feedback.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-900">Reply</button>
                    <button className="text-green-600 hover:text-green-900">Mark Reviewed</button>
                    <button className="text-purple-600 hover:text-purple-900">Follow Up</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Customer Care Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold mb-2">Ticket Categories</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Technical Issues</span>
                  <span className="text-sm font-medium">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Billing Queries</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Feature Requests</span>
                  <span className="text-sm font-medium">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">General Support</span>
                  <span className="text-sm font-medium">20%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold mb-2">Response Times</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Urgent</span>
                  <span className="text-sm font-medium">1.2h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">High</span>
                  <span className="text-sm font-medium">2.5h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Medium</span>
                  <span className="text-sm font-medium">4.8h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Low</span>
                  <span className="text-sm font-medium">8.2h</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold mb-2">Customer Satisfaction</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">5 Stars</span>
                  <span className="text-sm font-medium">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">4 Stars</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">3 Stars</span>
                  <span className="text-sm font-medium">7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">2-1 Stars</span>
                  <span className="text-sm font-medium">3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Knowledge Base
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Customer Survey
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Support Training
        </button>
      </div>
    </div>
  );
};

export default CompanyCustomerCarePage; 