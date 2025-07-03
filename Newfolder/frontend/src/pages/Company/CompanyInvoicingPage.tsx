import React, { useState } from 'react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  issueDate: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const CompanyInvoicingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const invoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: "INV-2024-001",
      customerName: "John Smith",
      customerEmail: "john.smith@company.com",
      amount: 2500,
      status: 'paid',
      dueDate: '2024-01-15',
      issueDate: '2024-01-01',
      items: [
        { id: 1, description: "Premium Business Package", quantity: 1, unitPrice: 2000, total: 2000 },
        { id: 2, description: "Setup Fee", quantity: 1, unitPrice: 500, total: 500 }
      ]
    },
    {
      id: 2,
      invoiceNumber: "INV-2024-002",
      customerName: "Emily Davis",
      customerEmail: "emily.davis@business.com",
      amount: 1500,
      status: 'sent',
      dueDate: '2024-01-25',
      issueDate: '2024-01-10',
      items: [
        { id: 3, description: "Standard Business Package", quantity: 1, unitPrice: 1200, total: 1200 },
        { id: 4, description: "Training Session", quantity: 2, unitPrice: 150, total: 300 }
      ]
    },
    {
      id: 3,
      invoiceNumber: "INV-2024-003",
      customerName: "David Lee",
      customerEmail: "david.lee@enterprise.com",
      amount: 5000,
      status: 'overdue',
      dueDate: '2024-01-10',
      issueDate: '2023-12-25',
      items: [
        { id: 5, description: "Enterprise Solution", quantity: 1, unitPrice: 4500, total: 4500 },
        { id: 6, description: "Custom Integration", quantity: 1, unitPrice: 500, total: 500 }
      ]
    },
    {
      id: 4,
      invoiceNumber: "INV-2024-004",
      customerName: "Lisa Brown",
      customerEmail: "lisa.brown@startup.com",
      amount: 800,
      status: 'draft',
      dueDate: '2024-02-05',
      issueDate: '2024-01-15',
      items: [
        { id: 7, description: "Basic Business Package", quantity: 1, unitPrice: 600, total: 600 },
        { id: 8, description: "Support Package", quantity: 1, unitPrice: 200, total: 200 }
      ]
    },
    {
      id: 5,
      invoiceNumber: "INV-2024-005",
      customerName: "Michael Wilson",
      customerEmail: "michael.wilson@corp.com",
      amount: 3200,
      status: 'sent',
      dueDate: '2024-02-01',
      issueDate: '2024-01-15',
      items: [
        { id: 9, description: "Premium Business Package", quantity: 1, unitPrice: 2000, total: 2000 },
        { id: 10, description: "Advanced Analytics", quantity: 1, unitPrice: 800, total: 800 },
        { id: 11, description: "Priority Support", quantity: 1, unitPrice: 400, total: 400 }
      ]
    }
  ];

  const statuses = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'];

  const filteredInvoices = selectedStatus === 'all' 
    ? invoices 
    : invoices.filter(invoice => invoice.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Invoice Management</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Invoices</h3>
          <p className="text-3xl font-bold text-blue-600">{invoices.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Pending Amount</h3>
          <p className="text-3xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-600">Overdue Amount</h3>
          <p className="text-3xl font-bold text-red-600">${overdueAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Invoice
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates
            </button>
          </nav>
        </div>
      </div>

      {/* Invoices Section */}
      {activeTab === 'invoices' && (
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
              New Invoice
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                          <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</div>
                          {invoice.status === 'sent' && (
                            <div className="text-sm text-gray-500">
                              {getDaysUntilDue(invoice.dueDate)} days left
                            </div>
                          )}
                          {invoice.status === 'overdue' && (
                            <div className="text-sm text-red-500">
                              {Math.abs(getDaysUntilDue(invoice.dueDate))} days overdue
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900 mr-3">Send</button>
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

      {/* Create Invoice Section */}
      {activeTab === 'create' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer email..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Items</label>
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-6">
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Item description..."
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Price"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Invoice
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Preview
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates Section */}
      {activeTab === 'templates' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Invoice Templates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Standard Invoice</h3>
              <p className="text-sm text-gray-600 mb-3">Professional invoice template with company branding</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Use Template</button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Service Invoice</h3>
              <p className="text-sm text-gray-600 mb-3">Template optimized for service-based businesses</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Use Template</button>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Product Invoice</h3>
              <p className="text-sm text-gray-600 mb-3">Template designed for product sales and inventory</p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Use Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Export Invoices
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Send Reminders
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Invoice Analytics
        </button>
      </div>
    </div>
  );
};

export default CompanyInvoicingPage; 