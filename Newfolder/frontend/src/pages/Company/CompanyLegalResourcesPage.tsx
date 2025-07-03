import React, { useState } from 'react';

interface LegalDocument {
  id: number;
  title: string;
  category: string;
  description: string;
  lastUpdated: string;
  status: 'active' | 'pending' | 'expired';
  fileSize: string;
}

interface ComplianceItem {
  id: number;
  title: string;
  description: string;
  status: 'compliant' | 'pending' | 'non-compliant';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

const CompanyLegalResourcesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const legalDocuments: LegalDocument[] = [
    {
      id: 1,
      title: "Terms of Service Agreement",
      category: "Contracts",
      description: "Standard terms of service for platform usage and business operations",
      lastUpdated: "2024-01-15",
      status: 'active',
      fileSize: "2.3 MB"
    },
    {
      id: 2,
      title: "Privacy Policy",
      category: "Compliance",
      description: "Data protection and privacy policy for customer information",
      lastUpdated: "2024-01-10",
      status: 'active',
      fileSize: "1.8 MB"
    },
    {
      id: 3,
      title: "Agent Commission Agreement",
      category: "Contracts",
      description: "Standard agreement for agent commission structure and payments",
      lastUpdated: "2024-01-05",
      status: 'active',
      fileSize: "3.1 MB"
    },
    {
      id: 4,
      title: "Data Processing Agreement",
      category: "Compliance",
      description: "GDPR compliant data processing agreement for EU customers",
      lastUpdated: "2023-12-20",
      status: 'pending',
      fileSize: "2.7 MB"
    },
    {
      id: 5,
      title: "Intellectual Property Policy",
      category: "Policies",
      description: "Guidelines for intellectual property protection and usage",
      lastUpdated: "2023-12-15",
      status: 'active',
      fileSize: "1.5 MB"
    },
    {
      id: 6,
      title: "Dispute Resolution Policy",
      category: "Policies",
      description: "Procedures for handling disputes and customer complaints",
      lastUpdated: "2023-12-10",
      status: 'active',
      fileSize: "2.0 MB"
    }
  ];

  const complianceItems: ComplianceItem[] = [
    {
      id: 1,
      title: "GDPR Compliance Review",
      description: "Annual review of data protection compliance for EU operations",
      status: 'compliant',
      dueDate: "2024-03-15",
      priority: 'high'
    },
    {
      id: 2,
      title: "Tax Registration Update",
      description: "Update business tax registration for new service areas",
      status: 'pending',
      dueDate: "2024-02-28",
      priority: 'high'
    },
    {
      id: 3,
      title: "Insurance Policy Renewal",
      description: "Renew business liability and professional indemnity insurance",
      status: 'pending',
      dueDate: "2024-04-01",
      priority: 'medium'
    },
    {
      id: 4,
      title: "Financial Audit Preparation",
      description: "Prepare documentation for annual financial audit",
      status: 'pending',
      dueDate: "2024-05-15",
      priority: 'medium'
    },
    {
      id: 5,
      title: "Employee Handbook Update",
      description: "Update employee handbook with latest labor law changes",
      status: 'non-compliant',
      dueDate: "2024-01-31",
      priority: 'low'
    }
  ];

  const categories = ['all', 'Contracts', 'Compliance', 'Policies', 'Licenses'];

  const filteredDocuments = selectedCategory === 'all' 
    ? legalDocuments 
    : legalDocuments.filter(doc => doc.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
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
      <h1 className="text-2xl font-bold mb-6">Legal Resources & Compliance</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Documents</h3>
          <p className="text-3xl font-bold text-blue-600">{legalDocuments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Active Documents</h3>
          <p className="text-3xl font-bold text-green-600">
            {legalDocuments.filter(doc => doc.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Compliance Items</h3>
          <p className="text-3xl font-bold text-purple-600">{complianceItems.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Compliant</h3>
          <p className="text-3xl font-bold text-green-600">
            {complianceItems.filter(item => item.status === 'compliant').length}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Legal Documents
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compliance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Compliance
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Document Templates
            </button>
          </nav>
        </div>
      </div>

      {/* Legal Documents Section */}
      {activeTab === 'documents' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Upload Document
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{document.title}</div>
                          <div className="text-sm text-gray-500">{document.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {document.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(document.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {document.fileSize}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900 mr-3">Download</button>
                        <button className="text-purple-600 hover:text-purple-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Section */}
      {activeTab === 'compliance' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Compliance Management</h2>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Add Compliance Item
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complianceItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Update</button>
                        <button className="text-green-600 hover:text-green-900">Complete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Document Templates Section */}
      {activeTab === 'templates' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Document Templates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Service Agreement Template</h3>
              <p className="text-sm text-gray-600 mb-3">Standard service agreement template for new clients</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Download Template</button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">NDA Template</h3>
              <p className="text-sm text-gray-600 mb-3">Non-disclosure agreement for confidential information</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Download Template</button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Agent Contract Template</h3>
              <p className="text-sm text-gray-600 mb-3">Standard contract template for new agents</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Download Template</button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Privacy Policy Template</h3>
              <p className="text-sm text-gray-600 mb-3">GDPR compliant privacy policy template</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Download Template</button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Terms of Service Template</h3>
              <p className="text-sm text-gray-600 mb-3">Standard terms of service for platform usage</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Download Template</button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Data Processing Agreement</h3>
              <p className="text-sm text-gray-600 mb-3">GDPR compliant data processing agreement</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Download Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Legal Consultation
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Compliance Report
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Document Audit
        </button>
      </div>
    </div>
  );
};

export default CompanyLegalResourcesPage; 